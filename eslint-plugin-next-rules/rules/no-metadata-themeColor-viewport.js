// eslint-plugin-next-rules/rules/no-metadata-themeColor-viewport.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow themeColor and viewport inside metadata object export (Next.js 14)',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      moveToExport: "'{{prop}}' should not be inside metadata. Export it separately as `export const {{prop}} = ...`.",
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      ExportNamedDeclaration(node) {
        if (
          node.declaration?.type === 'VariableDeclaration' &&
          node.declaration.declarations?.[0]?.id?.name === 'metadata' &&
          node.declaration.declarations[0].init?.type === 'ObjectExpression'
        ) {
          const metadataNode = node.declaration.declarations[0].init;
          const props = metadataNode.properties;

          props.forEach((prop) => {
            // 속성 이름 가져오기 (일반 식별자 또는 문자열 리터럴)
            const key = prop.key.name || prop.key.value;
            
            if (['themeColor', 'viewport'].includes(key)) {
              context.report({
                node: prop,
                messageId: 'moveToExport',
                data: { prop: key },
                fix(fixer) {
                  const valueSource = sourceCode.getText(prop.value);
                  const exportStatement = `\nexport const ${key} = ${valueSource};\n`;
                  
                  // 콤마 처리 개선
                  const fixes = [fixer.insertTextAfter(node, exportStatement)];
                  
                  // 마지막 속성이 아닌 경우 콤마도 제거
                  if (prop.parent.properties.indexOf(prop) < prop.parent.properties.length - 1) {
                    // 속성과 다음 속성 사이의 텍스트 범위 계산
                    const nextProp = prop.parent.properties[prop.parent.properties.indexOf(prop) + 1];
                    const endOfProp = prop.range[1];
                    const startOfNextProp = nextProp.range[0];
                    
                    // 속성과 콤마 제거
                    fixes.push(fixer.removeRange([prop.range[0], startOfNextProp]));
                  } else if (prop.parent.properties.length > 1) {
                    // 마지막 속성이지만 다른 속성이 있는 경우, 앞의 콤마 처리
                    const prevProp = prop.parent.properties[prop.parent.properties.indexOf(prop) - 1];
                    const endOfPrevProp = prevProp.range[1];
                    
                    // 앞의 콤마와 함께 속성 제거
                    fixes.push(fixer.removeRange([endOfPrevProp, prop.range[1]]));
                  } else {
                    // 유일한 속성인 경우 단순 제거
                    fixes.push(fixer.remove(prop));
                  }
                  
                  return fixes;
                },
              });
            }
          });
        }
      },
    };
  },
};
