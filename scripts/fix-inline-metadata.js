// scripts/fix-inline-metadata.js
import fs from 'fs';
import path from 'path';
import * as babel from '@babel/core';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import glob from 'fast-glob';

// 명령줄 인수 처리
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('--ci');

async function main() {
  const files = await glob(['app/**/*.{js,ts,jsx,tsx}'], { absolute: true });
  console.log(`🔍 Found ${files.length} files to process`);

  let updatedCount = 0;

  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    let updated = false;

    try {
      const result = babel.parseSync(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        filename: file,
      });

      traverse(result, {
        ExportNamedDeclaration(path) {
          const decl = path.node.declaration;
          if (!t.isVariableDeclaration(decl)) return;

          decl.declarations.forEach((d) => {
            if (!t.isIdentifier(d.id)) return;

            if (d.id.name === 'metadata' && t.isObjectExpression(d.init)) {
              const remainingProps = [];
              const extracted = {};

              d.init.properties.forEach((prop) => {
                if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) return;
                const key = prop.key.name;
                if (key === 'themeColor' || key === 'viewport') {
                  extracted[key] = prop.value;
                  updated = true;
                } else {
                  remainingProps.push(prop);
                }
              });

              d.init.properties = remainingProps;

              // Add separate exports
              const parent = path.parentPath;
              if (extracted.themeColor) {
                parent.insertBefore(
                  t.exportNamedDeclaration(
                    t.variableDeclaration('const', [
                      t.variableDeclarator(
                        t.identifier('themeColor'),
                        extracted.themeColor
                      ),
                    ])
                  )
                );
              }
              if (extracted.viewport) {
                parent.insertBefore(
                  t.exportNamedDeclaration(
                    t.variableDeclaration('const', [
                      t.variableDeclarator(
                        t.identifier('viewport'),
                        extracted.viewport
                      ),
                    ])
                  )
                );
              }
            }
          });
        },
      });

      if (updated) {
        const output = generate(result, { retainLines: true }).code;
        
        if (isDryRun) {
          console.log(`🔍 Would update: ${file}`);
        } else {
          fs.copyFileSync(file, file + '.bak');
          fs.writeFileSync(file, output);
          console.log(`✅ Updated: ${file}`);
        }
        updatedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n✨ Done! ${isDryRun ? 'Would update' : 'Updated'} ${updatedCount} files.`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

