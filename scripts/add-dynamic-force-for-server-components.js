/**
 * Adds `export const dynamic = 'force-dynamic'` to server components
 * using cookies, Supabase auth, or getServerSession.
 *
 * Usage:
 *   npx jscodeshift -t add-dynamic-force-for-server-components.js app/
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const sourceText = file.source;

  // Skip client components
  if (sourceText.includes("'use client'") || sourceText.includes('"use client"')) {
    return null;
  }

  // Skip if already declared
  if (sourceText.includes("export const dynamic = 'force-dynamic'") || 
      sourceText.includes('export const dynamic = "force-dynamic"')) {
    return null;
  }

  // Detect SSR-sensitive API usage
  const usesSSR =
    /cookies\s*\(\)/.test(sourceText) ||
    /getServerSession\s*\(/.test(sourceText) ||
    /createServerComponentClient\s*\(/.test(sourceText) ||
    /supabase\.auth\./.test(sourceText) ||
    /headers\s*\(\)/.test(sourceText);

  if (!usesSSR) {
    return null;
  }

  const dynamicExport = j.exportNamedDeclaration(
    j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier('dynamic'),
        j.literal('force-dynamic')
      ),
    ])
  );

  // Insert export at the top
  root.get().node.program.body.unshift(dynamicExport);

  // Add a newline after the export for better readability
  return root.toSource({ quote: 'single' }).replace(
    "export const dynamic = 'force-dynamic';", 
    "export const dynamic = 'force-dynamic';\n"
  );
};
