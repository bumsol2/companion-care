module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'themeColor and viewport must be exported separately, not inside metadata',
    },
    fixable: null,
    messages: {
      noInline: '`{{prop}}` should be exported separately, not inside `metadata`.',
    },
  },

  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (
          node.declaration &&
          node.declaration.type === 'VariableDeclaration'
        ) {
          const decl = node.declaration.declarations[0];

          if (
            decl.id.name === 'metadata' &&
            decl.init &&
            decl.init.type === 'ObjectExpression'
          ) {
            const problematicProps = decl.init.properties.filter(p =>
              ['themeColor', 'viewport'].includes(p.key.name)
            );

            problematicProps.forEach(p => {
              context.report({
                node: p,
                messageId: 'noInline',
                data: { prop: p.key.name },
              });
            });
          }
        }
      },
    };
  },
};
