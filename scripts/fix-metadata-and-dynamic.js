// scripts/fix-metadata-and-dynamic.js
const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const fixMetadata = (filePath) => {
  // .tsx 또는 .jsx 파일만 처리
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const backupPath = filePath + '.bak';

  let modified = false;

  // Move themeColor and viewport to viewport export
  const metadataRegex = /export const metadata\s*=\s*{([\s\S]*?)}/gm;
  const themeColorMatch = /themeColor\s*:\s*['"`](.*?)['"`]/.exec(content);
  const viewportMatch = /viewport\s*:\s*['"`](.*?)['"`]/.exec(content);
  const viewportObjectMatch = /viewport\s*:\s*{([\s\S]*?)}/gm.exec(content);

  if (metadataRegex.test(content) && (themeColorMatch || viewportMatch || viewportObjectMatch)) {
    // 백업 파일 생성
    fs.copyFileSync(filePath, backupPath);
    
    // viewport가 문자열로 정의된 경우
    if (viewportMatch) {
      const viewportParts = viewportMatch[1].split(',');
      const widthMatch = /width=([^,]+)/.exec(viewportMatch[1]);
      const initialScaleMatch = /initial-scale=([^,]+)/.exec(viewportMatch[1]);
      
      const width = widthMatch ? widthMatch[1] : 'device-width';
      const initialScale = initialScaleMatch ? initialScaleMatch[1] : '1';
      
      const themeColorValue = themeColorMatch ? themeColorMatch[1] : '#ffffff';
      
      const newViewport = `\nexport const viewport = {\n  width: '${width}',\n  initialScale: ${initialScale},\n  themeColor: '${themeColorValue}'\n};`;
      
      // metadata에서 themeColor와 viewport 제거
      content = content.replace(/themeColor\s*:\s*['"`].*?['"`],?/g, '');
      content = content.replace(/viewport\s*:\s*['"`].*?['"`],?/g, '');
      
      // 콤마 정리 및 새 viewport 추가
      content = content.replace(metadataRegex, (match) => match.replace(/,\s*}/, '\n}'));
      
      // 이미 viewport export가 없는 경우에만 추가
      if (!content.includes('export const viewport')) {
        content = content + newViewport;
      }
      
      modified = true;
    }
    // viewport가 객체로 정의된 경우
    else if (viewportObjectMatch) {
      const viewportObject = viewportObjectMatch[1];
      const themeColorValue = themeColorMatch ? themeColorMatch[1] : '#ffffff';
      
      // 새로운 viewport 객체 생성
      const newViewport = `\nexport const viewport = {\n${viewportObject},\n  themeColor: '${themeColorValue}'\n};`;
      
      // metadata에서 themeColor와 viewport 제거
      content = content.replace(/themeColor\s*:\s*['"`].*?['"`],?/g, '');
      content = content.replace(/viewport\s*:\s*{[\s\S]*?},?/g, '');
      
      // 콤마 정리 및 새 viewport 추가
      content = content.replace(metadataRegex, (match) => match.replace(/,\s*}/, '\n}'));
      
      // 이미 viewport export가 없는 경우에만 추가
      if (!content.includes('export const viewport')) {
        content = content + newViewport;
      }
      
      modified = true;
    }
    // themeColor만 있는 경우
    else if (themeColorMatch) {
      const themeColorValue = themeColorMatch[1];
      const newViewport = `\nexport const viewport = {\n  width: 'device-width',\n  initialScale: 1,\n  themeColor: '${themeColorValue}'\n};`;
      
      // metadata에서 themeColor 제거
      content = content.replace(/themeColor\s*:\s*['"`].*?['"`],?/g, '');
      
      // 콤마 정리 및 새 viewport 추가
      content = content.replace(metadataRegex, (match) => match.replace(/,\s*}/, '\n}'));
      
      // 이미 viewport export가 없는 경우에만 추가
      if (!content.includes('export const viewport')) {
        content = content + newViewport;
      }
      
      // 별도의 themeColor export 추가
      if (!content.includes('export const themeColor')) {
        content = content + `\nexport const themeColor = '${themeColorValue}';\n`;
      }
      
      modified = true;
    }
  }

  // Add export const dynamic = 'force-dynamic' if cookies/getServerSession/createServerComponentClient found
  if (
    (
      /cookies\(\)|getServerSession\(|createServerComponentClient/.test(content) && 
      !/export const dynamic\s*=/.test(content)
    ) || 
    (
      /supabase.*auth/.test(content) && 
      !/export const dynamic\s*=/.test(content) && 
      !content.includes("'use client'")
    )
  ) {
    // 백업 파일이 아직 생성되지 않았다면 생성
    if (!modified) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    content = `export const dynamic = 'force-dynamic';\n\n` + content;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  }
};

// scripts 디렉토리 생성 확인
const scriptsDir = path.resolve(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

const appDir = path.resolve(__dirname, '../app');
console.log(`🔍 Scanning directory: ${appDir}`);
walk(appDir, fixMetadata);
console.log('✅ All files processed!');
