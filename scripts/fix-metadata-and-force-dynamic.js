/**
 * Fixes Next.js metadata export + SSR dynamic declaration
 * for App Router (Next.js 13/14+).
 *
 * ✅ viewport & themeColor export 분리
 * ✅ SSR API 사용 시 dynamic='force-dynamic' 자동 삽입
 *
 * Usage:
 *   npx jscodeshift -t fix-metadata-and-force-dynamic.js app/
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const sourceText = file.source;
  let modified = false;

  // 클라이언트 컴포넌트 스킵
  if (sourceText.includes("'use client'") || sourceText.includes('"use client"')) {
    return null;
  }

  // ✅ 1. SSR 관련 API 사용 시 force-dynamic 추가
  const needsDynamic =
    /cookies\s*\(\)/.test(sourceText) ||
    /getServerSession\s*\(/.test(sourceText) ||
    /createServerComponentClient\s*\(/.test(sourceText) ||
    /supabase\.auth\./.test(sourceText) ||
    /headers\s*\(\)/.test(sourceText);

  const alreadyHasDynamic = /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/.test(sourceText);

  if (needsDynamic && !alreadyHasDynamic) {
    const dynamicExport = j.exportNamedDeclaration(
      j.variableDeclaration('const', [
        j.variableDeclarator(j.identifier('dynamic'), j.literal('force-dynamic')),
      ])
    );
    root.get().node.program.body.unshift(dynamicExport);
    modified = true;
  }

  // ✅ 2. metadata → viewport / themeColor 분리
  root.find(j.ExportNamedDeclaration).forEach(path => {
    const decl = path.node.declaration;
    if (
      decl?.type === 'VariableDeclaration' &&
      decl.declarations[0]?.id?.name === 'metadata'
    ) {
      const metadata = decl.declarations[0].init;

      if (metadata?.type === 'ObjectExpression') {
        const props = metadata.properties;
        const newProps = [];

        let viewportProp, themeColorProp;

        for (const prop of props) {
          // 속성 이름 가져오기 (일반 식별자 또는 문자열 리터럴)
          const propName = prop.key.name || prop.key.value;
          
          if (propName === 'viewport') {
            viewportProp = prop;
          } else if (propName === 'themeColor') {
            themeColorProp = prop;
          } else {
            newProps.push(prop);
          }
        }

        if (viewportProp) {
          // viewport가 문자열인 경우 객체로 변환
          if (viewportProp.value.type === 'StringLiteral' || viewportProp.value.type === 'Literal') {
            const viewportStr = viewportProp.value.value;
            const widthMatch = /width=([^,]+)/.exec(viewportStr);
            const initialScaleMatch = /initial-scale=([^,]+)/.exec(viewportStr);
            
            const viewportObj = j.objectExpression([]);
            
            if (widthMatch) {
              viewportObj.properties.push(
                j.objectProperty(
                  j.identifier('width'),
                  j.stringLiteral(widthMatch[1].trim())
                )
              );
            }
            
            if (initialScaleMatch) {
              viewportObj.properties.push(
                j.objectProperty(
                  j.identifier('initialScale'),
                  j.numericLiteral(parseFloat(initialScaleMatch[1].trim()))
                )
              );
            }
            
            // themeColor가 있으면 viewport 객체에 추가
            if (themeColorProp && themeColorProp.value.type === 'StringLiteral') {
              viewportObj.properties.push(
                j.objectProperty(
                  j.identifier('themeColor'),
                  j.stringLiteral(themeColorProp.value.value)
                )
              );
            }
            
            root.get().node.program.body.push(
              j.exportNamedDeclaration(
                j.variableDeclaration('const', [
                  j.variableDeclarator(j.identifier('viewport'), viewportObj),
                ])
              )
            );
          } else {
            // viewport가 이미 객체인 경우
            root.get().node.program.body.push(
              j.exportNamedDeclaration(
                j.variableDeclaration('const', [
                  j.variableDeclarator(j.identifier('viewport'), viewportProp.value),
                ])
              )
            );
          }
          modified = true;
        }

        // viewport에 themeColor를 추가하지 않은 경우에만 별도로 export
        if (themeColorProp && (!viewportProp || viewportProp.value.type !== 'StringLiteral')) {
          root.get().node.program.body.push(
            j.exportNamedDeclaration(
              j.variableDeclaration('const', [
                j.variableDeclarator(j.identifier('themeColor'), themeColorProp.value),
              ])
            )
          );
          modified = true;
        }

        // metadata 객체에서 제거된 속성 업데이트
        decl.declarations[0].init.properties = newProps;
      }
    }
  });

  return modified ? root.toSource({ quote: 'single' }) : null;
};
