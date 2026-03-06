'use server';

import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { verifyAdminRole } from '@/lib/auth-helpers';
import { adaptInfographicCode } from '@/lib/adapt-infographic-code';

const CATEGORY_IDS = ['vascular', 'microangiopathy', 'oncology', 'inflammatory_infectious_toxic', 'general_technique', 'other'] as const;

function toPascalCase(str: string): string {
  return str
    .trim()
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toSnakeCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function ensureComponentExportName(code: string, targetName: string): string {
  // Try to find and replace the default export component name
  // Pattern: export default SomeName; or export default SomeName
  const exportDefaultMatch = code.match(/export\s+default\s+(\w+)\s*;?/);
  if (exportDefaultMatch) {
    const oldName = exportDefaultMatch[1];
    if (oldName !== targetName) {
      // Replace const OldName = with const TargetName =
      code = code.replace(new RegExp(`const\\s+${oldName}\\s*=`, 'g'), `const ${targetName} =`);
      // Replace function OldName( with function TargetName(
      code = code.replace(new RegExp(`function\\s+${oldName}\\s*\\(`, 'g'), `function ${targetName}(`);
      // Replace export default OldName
      code = code.replace(new RegExp(`export\\s+default\\s+${oldName}`, 'g'), `export default ${targetName}`);
    }
  }
  return code;
}

export type CreateInfographicResult = { success: true; message: string; filePath: string; registryId: string } | { success: false; error: string };

export async function createInfographicFromCode(
  callerUid: string,
  params: { code: string; componentName: string; title: string; categoryId: string }
): Promise<CreateInfographicResult> {
  if (!(await verifyAdminRole(callerUid))) {
    return { success: false, error: 'Unauthorized. Admin access required.' };
  }

  const { code, componentName, title, categoryId } = params;

  if (!code?.trim()) {
    return { success: false, error: 'Code is required.' };
  }
  if (!componentName?.trim()) {
    return { success: false, error: 'Component name is required.' };
  }
  if (!title?.trim()) {
    return { success: false, error: 'Title is required.' };
  }
  if (!CATEGORY_IDS.includes(categoryId as (typeof CATEGORY_IDS)[number])) {
    return { success: false, error: `Invalid categoryId. Must be one of: ${CATEGORY_IDS.join(', ')}` };
  }

  const pascalName = toPascalCase(componentName);
  const componentExportName = pascalName.endsWith('Infographic') ? pascalName : `${pascalName}Infographic`;
  const snakeId = toSnakeCase(componentName);
  const registryId = `${snakeId}_infographic_component`;

  try {
    const projectRoot = process.cwd();
    const infographicsDir = path.join(projectRoot, 'src', 'components', 'infographics');
    const fileName = `${componentExportName}.tsx`;
    const filePath = path.join(infographicsDir, fileName);

    const adaptedCode = adaptInfographicCode(code);
    let finalCode = ensureComponentExportName(adaptedCode, componentExportName);

    await writeFile(filePath, finalCode, 'utf-8');

    const registryPath = path.join(projectRoot, 'src', 'lib', 'infographic-registry.ts');
    let registryContent = await readFile(registryPath, 'utf-8');

    const importLine = `import ${componentExportName} from '@/components/infographics/${componentExportName}';`;
    if (registryContent.includes(importLine)) {
      return { success: false, error: `Infographic "${componentExportName}" is already registered.` };
    }

    const insertAfter = "import PcnslInfographic from '@/components/infographics/PcnslInfographic';";
    if (registryContent.includes(insertAfter)) {
      registryContent = registryContent.replace(
        insertAfter,
        `${insertAfter}\nimport ${componentExportName} from '@/components/infographics/${componentExportName}';`
      );
    } else {
      const lastImport = registryContent.lastIndexOf("from '@/components/infographics/");
      if (lastImport === -1) {
        return { success: false, error: 'Could not find import section in registry.' };
      }
      const lineEnd = registryContent.indexOf('\n', lastImport);
      const insertPos = lineEnd === -1 ? registryContent.length : lineEnd + 1;
      registryContent = registryContent.slice(0, insertPos) + `import ${componentExportName} from '@/components/infographics/${componentExportName}';\n` + registryContent.slice(insertPos);
    }

    const newInfoEntry = `  {
    id: '${registryId}',
    title: '${title.replace(/'/g, "\\'")}',
    categoryId: '${categoryId}',
    isComponent: true,
  },`;
    const infoArrayEnd = registryContent.indexOf('];', registryContent.indexOf('COMPONENT_INFOGRAPHICS'));
    if (infoArrayEnd === -1) {
      return { success: false, error: 'Could not find COMPONENT_INFOGRAPHICS array end.' };
    }
    registryContent = registryContent.slice(0, infoArrayEnd) + '\n' + newInfoEntry + '\n' + registryContent.slice(infoArrayEnd);

    const newMapEntry = `  ${registryId}: ${componentExportName},`;
    const mapObjectEnd = registryContent.indexOf('};', registryContent.indexOf('COMPONENT_MAP'));
    if (mapObjectEnd === -1) {
      return { success: false, error: 'Could not find COMPONENT_MAP object end.' };
    }
    registryContent = registryContent.slice(0, mapObjectEnd) + '\n' + newMapEntry + '\n' + registryContent.slice(mapObjectEnd);

    await writeFile(registryPath, registryContent, 'utf-8');

    return {
      success: true,
      message: 'Infographic created and registered successfully. Visit /infographics as admin to sync Firestore.',
      filePath: `src/components/infographics/${fileName}`,
      registryId,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[createInfographicFromCode]', err);
    return { success: false, error: message };
  }
}
