import fs from 'fs';
import path from 'path';
import * as babel from '@babel/core';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import glob from 'fast-glob';
import chalk from 'chalk';

/**
 * 명령줄 옵션
 * @typedef {Object} Options
 * @property {boolean} dryRun - 실제 파일 수정 없이 변경 예정 파일만 출력
 * @property {boolean} ci - CI 모드 (백업 파일 생성 안 함, 종료 코드로 성공 여부 표시)
 * @property {string} ext - 처리할 파일 확장자 (쉼표로 구분)
 */

/**
 * Next.js 14 메타데이터 수정 Codemod
 * @param {Options} options - 명령줄 옵션
 */
export async function fixMetadata(options = {}) {
  const { dryRun = false, ci = false, ext = '.js,.jsx,.ts,.tsx' } = options;
  
  const extensions = ext.split(',').map(e => e.startsWith('.') ? e : `.${e}`);
  const extensionPattern = extensions.length > 1 
    ? `{${extensions.join(',')}}` 
    : extensions[0];
  
  console.log(chalk.blue(`🔍 Scanning for files with extensions: ${extensions.join(', ')}`));
  
  const files = await glob([`app/**/*${extensionPattern}`], { absolute: true });
  console.log(chalk.blue(`📁 Found ${files.length} files to process`));

  let updatedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const code = fs.readFileSync(file, 'utf8');
      let updated = false;

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

              if (!updated) return;
              
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
        
        if (dryRun) {
          console.log(chalk.yellow(`🔍 Would update: ${file}`));
        } else {
          if (!ci) {
            fs.copyFileSync(file, file + '.bak');
          }
          fs.writeFileSync(file, output);
          console.log(chalk.green(`✅ Updated: ${file}`));
        }
        updatedCount++;
      }
    } catch (error) {
      console.error(chalk.red(`❌ Error processing ${file}:`), error.message);
      errorCount++;
    }
  }

  console.log(chalk.blue(`\n✨ Done! ${dryRun ? 'Would update' : 'Updated'} ${updatedCount} files.`));
  
  if (errorCount > 0) {
    console.log(chalk.red(`⚠️ Encountered ${errorCount} errors during processing.`));
    if (ci) {
      process.exit(1);
    }
  }
  
  return { updatedCount, errorCount };
}
