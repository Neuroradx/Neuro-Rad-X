/**
 * Adapts pasted React infographic code to match the app's standard style,
 * structure, colors, and design (Intracranial Hemorrhage / Carotid Plaque ICAD pattern).
 */

const BOOK_ICON_PATH =
  'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25';

export function adaptInfographicCode(code: string): string {
  let adapted = code;

  // 1. Ensure 'use client' at top
  if (!adapted.trimStart().startsWith("'use client'") && !adapted.trimStart().startsWith('"use client"')) {
    adapted = "'use client';\n\n" + adapted;
  }

  // 2. Fix imports - infographic-shared path
  adapted = adapted.replace(/from\s+['"]\.\.\/infographic-shared['"]/g, "from './infographic-shared'");
  adapted = adapted.replace(
    /from\s+['"]@\/components\/infographics\/infographic-shared['"]/g,
    "from './infographic-shared'"
  );

  // 3. Remove Tooltip from recharts import (use ChartTooltip from @/components/ui/chart instead)
  adapted = adapted.replace(/,?\s*Tooltip\s*,?/g, '');
  // Fix potential double commas left in imports
  adapted = adapted.replace(/\{\s*,\s*/g, '{ ');
  adapted = adapted.replace(/,(\s*)\}/g, '$1}');

  // 4. Ensure ChartContainer, ChartTooltip, ChartTooltipContent from @/components/ui/chart
  if (!adapted.includes("from '@/components/ui/chart'") && !adapted.includes('from "@/components/ui/chart"')) {
    const chartImport =
      "import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';";
    const cardImport = adapted.match(/import\s+{[^}]+}\s+from\s+["']@\/components\/ui\/card["']/);
    if (cardImport) {
      adapted = adapted.replace(
        /import\s+{[^}]+}\s+from\s+["']@\/components\/ui\/card["']/,
        (m) => m + '\n' + chartImport
      );
    }
  }

  // 5. Ensure GradientText, SectionIcon, InfographicSection from infographic-shared
  if (!adapted.includes("from './infographic-shared'")) {
    const hasGradientText = adapted.includes('GradientText');
    if (hasGradientText) {
      adapted = adapted.replace(
        /import\s+{[^}]+}\s+from\s+["']@\/components\/ui\/card["']/,
        (m) => m + "\nimport { GradientText, SectionIcon, InfographicSection } from './infographic-shared';"
      );
    }
  }

  // 6. Remove local component definitions (GradientText, SectionIcon, InfographicSection, ChartTooltipContent)
  adapted = adapted.replace(
    /const\s+GradientText\s*=\s*\([^)]*\)\s*=>\s*\([^)]*<span[^>]*>[^<]*<\/span>[^)]*\)[^;]*;/gs,
    ''
  );
  adapted = adapted.replace(
    /const\s+SectionIcon\s*=\s*\([^)]*\)\s*=>\s*\([^)]*<svg[^>]*>[\s\S]*?<\/svg>[^)]*\)[^;]*;/gs,
    ''
  );
  adapted = adapted.replace(
    /const\s+InfographicSection\s*=\s*\([^)]*\)\s*=>\s*\([^)]*<Card[\s\S]*?<\/Card>[^)]*\)[^;]*;/gs,
    ''
  );
  adapted = adapted.replace(
    /const\s+ChartTooltipContent\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?return\s+null;?\s*\}[^;]*;/gs,
    ''
  );

  // 7. Add InfographicSection import if used but missing
  if (adapted.includes('<InfographicSection') && !adapted.includes('InfographicSection')) {
    adapted = adapted.replace(
      /import\s+{\s*GradientText,\s*SectionIcon\s*}\s+from\s+['"]\.\/infographic-shared['"]/,
      "import { GradientText, SectionIcon, InfographicSection } from './infographic-shared'"
    );
  }

  // 8. Layout wrapper - remove extra classes, keep only infographic-layout space-y-8
  adapted = adapted.replace(
    /className="infographic-layout space-y-8[^"]*"/g,
    'className="infographic-layout space-y-8"'
  );
  adapted = adapted.replace(
    /className="infographic-layout space-y-8 p-4 md:p-8[^"]*"/g,
    'className="infographic-layout space-y-8"'
  );
  adapted = adapted.replace(
    /className="infographic-layout space-y-8[^"]*bg-background[^"]*"/g,
    'className="infographic-layout space-y-8"'
  );
  adapted = adapted.replace(
    /className="infographic-layout space-y-8[^"]*max-w-7xl[^"]*"/g,
    'className="infographic-layout space-y-8"'
  );

  // 9. Header - remove redundant classes
  adapted = adapted.replace(
    /className="infographic-header text-center[^"]*"/g,
    'className="infographic-header"'
  );
  adapted = adapted.replace(
    /className="infographic-title text-4xl[^"]*"/g,
    'className="infographic-title"'
  );
  adapted = adapted.replace(
    /className="infographic-subtitle text-lg[^"]*"/g,
    'className="infographic-subtitle"'
  );

  // 10. Cards - remove border-2 shadow-sm
  adapted = adapted.replace(/\binfographic-card border-2 shadow-sm\b/g, 'infographic-card');
  adapted = adapted.replace(/\binfographic-card md:col-span-\d+ border-2 shadow-sm\b/g, (m) =>
    m.replace(' border-2 shadow-sm', '')
  );

  // 11. Chart colors - hex to theme vars
  adapted = adapted.replace(/color:\s*['"]#[0-9a-fA-F]{3,8}['"]/g, "color: 'hsl(var(--chart-1))'");
  adapted = adapted.replace(/fill:\s*['"]#[0-9a-fA-F]{3,8}['"]/g, "fill: 'hsl(var(--chart-1))'");

  // 12. Cell fill - use var(--color-${key}) pattern
  adapted = adapted.replace(
    /fill=\{CHART_CONFIG\[entry\.key\]\.color\}/g,
    'fill={`var(--color-${entry.key})`}'
  );
  adapted = adapted.replace(
    /fill=\{chartConfig\[entry\.key\]\.color\}/g,
    'fill={`var(--color-${entry.key})`}'
  );

  // 13. Tooltip -> ChartTooltip
  adapted = adapted.replace(/<Tooltip\s+content=\{<ChartTooltipContent/g, '<ChartTooltip content={<ChartTooltipContent');
  adapted = adapted.replace(/<Tooltip\s+cursor=/g, '<ChartTooltip cursor=');
  adapted = adapted.replace(/<\/Tooltip>/g, '</ChartTooltip>');

  // 14. LaTeX symbols
  adapted = adapted.replace(/\$\s*\\ge\s*\$/g, '≥');
  adapted = adapted.replace(/\$\\ge\$/g, '≥');

  // 15. Info boxes - blue to primary
  adapted = adapted.replace(
    /bg-blue-50 dark:bg-blue-950\/30 border border-blue-100 dark:border-blue-900/g,
    'bg-primary/10 border border-primary/20'
  );
  adapted = adapted.replace(
    /text-blue-700 dark:text-blue-300/g,
    'text-primary'
  );
  adapted = adapted.replace(
    /text-blue-600 dark:text-blue-400/g,
    'text-muted-foreground'
  );

  // 16. Sub-cards - use infographic-card-inner
  adapted = adapted.replace(
    /rounded-lg bg-card border\b/g,
    'infographic-card-inner'
  );
  adapted = adapted.replace(
    /rounded-xl border border-border\/40 bg-muted\/20\b/g,
    'infographic-card-inner'
  );

  // 17. Footer - ensure standard 3-line format
  adapted = adapted.replace(
    /footer className="infographic-footer mt-16 pt-8 border-t border-border"/g,
    'footer className="infographic-footer"'
  );
  adapted = adapted.replace(
    /footer className="infographic-footer mt-12 pt-8 border-t border-muted"/g,
    'footer className="infographic-footer"'
  );
  adapted = adapted.replace(
    /footer className="infographic-footer text-left"/g,
    'footer className="infographic-footer"'
  );

  // 18. Export default App -> will be fixed by create-infographic-action
  adapted = adapted.replace(/export default App\s*;?/g, 'export default App;');

  return adapted;
}
