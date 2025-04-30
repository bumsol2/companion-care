/**
 * jscodeshift Codemod to extract themeColor and viewport from metadata export
 *
 * Usage:
 *   npx jscodeshift -t fix-metadata-themeColor-viewport.js path/to/files
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let modified = false;

  // 메타데이터 객체 export 찾기
  const exportDecls = root.find(j.ExportNamedDeclaration, {
    declaration: {
      type: 'VariableDeclaration',
      declarations: [
        {
          id: { name: 'metadata' },
          init: { type: 'ObjectExpression' },
        },
      ],
    },
  });

  exportDecls.forEach(path => {
    const metadataNode = path.node.declaration.declarations[0].init;
    const props = metadataNode.properties;

    const newExports = [];
    const propsToRemove = [];

    // themeColor와 viewport 찾아서 별도 export로 분리
    props.forEach(prop => {
      const key = prop.key.name || prop.key.value;
      if (key === 'themeColor' || key === 'viewport') {
        // 새로운 export 생성
        const exportNode = j.exportNamedDeclaration(
          j.variableDeclaration('const', [
            j.variableDeclarator(j.identifier(key), prop.value),
          ])
        );
        newExports.push(exportNode);
        propsToRemove.push(prop);
        modified = true;
      }
    });

    // 원본 metadata에서 속성 제거
    metadataNode.properties = props.filter(prop => {
      const key = prop.key.name || prop.key.value;
      return key !== 'themeColor' && key !== 'viewport';
    });

    // 새로운 export 삽입
    newExports.forEach(newExport => {
      j(path).insertAfter(newExport);
    });
  });

  // viewport가 객체 형태인 경우도 처리
  const viewportObjectExports = root.find(j.ExportNamedDeclaration, {
    declaration: {
      type: 'VariableDeclaration',
      declarations: [
        {
          id: { name: 'metadata' },
        },
      ],
    },
  }).filter(path => {
    const props = path.node.declaration.declarations[0].init.properties;
    return props.some(prop => {
      const key = prop.key.name || prop.key.value;
      return key === 'viewport' && prop.value.type === 'ObjectExpression';
    });
  });

  viewportObjectExports.forEach(path => {
    const metadataNode = path.node.declaration.declarations[0].init;
    const props = metadataNode.properties;

    props.forEach(prop => {
      const key = prop.key.name || prop.key.value;
      if (key === 'viewport' && prop.value.type === 'ObjectExpression') {
        // viewport 객체를 별도 export로 분리
        const exportNode = j.exportNamedDeclaration(
          j.variableDeclaration('const', [
            j.variableDeclarator(j.identifier(key), prop.value),
          ])
        );
        j(path).insertAfter(exportNode);
        modified = true;
      }
    });

    // 원본 metadata에서 viewport 속성 제거
    metadataNode.properties = props.filter(prop => {
      const key = prop.key.name || prop.key.value;
      return key !== 'viewport';
    });
  });

  // cookies() 또는 getServerSession() 사용 시 dynamic = 'force-dynamic' 추가
  const hasCookiesOrSession = root.find(j.CallExpression, {
    callee: {
      name: n => ['cookies', 'getServerSession', 'createServerComponentClient'].includes(n)
    }
  }).size() > 0;

  const hasSupabaseAuth = root.find(j.MemberExpression, {
    object: {
      name: 'supabase'
    },
    property: {
      name: 'auth'
    }
  }).size() > 0;

  const hasUseClient = root.find(j.StringLiteral, {
    value: 'use client'
  }).size() > 0;

  const hasDynamicExport = root.find(j.ExportNamedDeclaration, {
    declaration: {
      type: 'VariableDeclaration',
      declarations: [
        {
          id: { name: 'dynamic' }
        }
      ]
    }
  }).size() > 0;

  // 서버 컴포넌트이고, cookies/session을 사용하며, dynamic export가 없는 경우
  if ((hasCookiesOrSession || (hasSupabaseAuth && !hasUseClient)) && !hasDynamicExport) {
    const dynamicExport = j.exportNamedDeclaration(
      j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier('dynamic'),
          j.stringLiteral('force-dynamic')
        )
      ])
    );
    
    // 파일 맨 앞에 삽입
    root.get().node.program.body.unshift(dynamicExport);
    modified = true;
  }

  return modified ? root.toSource({ quote: 'single' }) : file.source;
};
