// TypeScript 7 has no programmatic API yet, and typescript-eslint and vue-tsc embed the
// compiler. Give only those packages the 6.x compat build; the project itself stays on TS 7.
// Drop this once typescript-eslint and vue-tsc support TS 7.
const TS6 = 'npm:@typescript/typescript6@^6.0.2'

function readPackage(pkg) {
  if (pkg.name === 'vue-tsc' || pkg.name.startsWith('@typescript-eslint/')) {
    if (pkg.peerDependencies?.typescript) delete pkg.peerDependencies.typescript
    pkg.dependencies = { ...pkg.dependencies, typescript: TS6 }
  }
  return pkg
}

module.exports = { hooks: { readPackage } }
