// scripts/verify-genkit-versions.js

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const dependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const genkitPackages = Object.keys(dependencies).filter(
  (pkg) => pkg.startsWith('genkit') || pkg.startsWith('@genkit-ai/')
);

if (genkitPackages.length === 0) {
  console.log('✅ No Genkit packages found.');
  process.exit(0);
}

const firstVersion = dependencies[genkitPackages[0]];
let allVersionsMatch = true;

console.log('🔍 Checking Genkit package versions...');

for (const pkg of genkitPackages) {
  const version = dependencies[pkg];
  if (version !== firstVersion) {
    allVersionsMatch = false;
    console.error(
      `❌ Mismatch found: ${pkg}@${version} does not match ${genkitPackages[0]}@${firstVersion}`
    );
  } else {
    console.log(`  ✓ ${pkg}@${version}`);
  }
}

if (allVersionsMatch) {
  console.log('\n✅ Success! All Genkit packages share the same version.');
  process.exit(0);
} else {
  console.error(
    '\n🔥 Error: Inconsistent Genkit package versions detected. Please align all Genkit packages to the same version in your package.json.'
  );
  process.exit(1);
}
