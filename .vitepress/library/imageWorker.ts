const ctx: Worker = self as any;

ctx.onmessage = function(e: MessageEvent) {
  if (e.data.type === 'convertToBase64') {
    convertToBase64(e.data.file);
  } else if (e.data.type === 'convertToImage') {
    convertToImage(e.data.base64);
  }
};

function convertToBase64(file: File) {
  //console.log('Converting to Base64:', file);
  const reader = new FileReader();
  reader.onload = function(event) {
    ctx.postMessage({ type: 'result', value: (event.target as FileReader).result });
  };
  reader.onerror = function(error) {
    ctx.postMessage({ type: 'error', message: '文件读取错误' });
  };
  reader.readAsDataURL(file);
}

function convertToImage(base64: string) {
  try {
    const base64Data = base64.startsWith('data:') 
      ? base64 
      : `data:image/png;base64,${base64}`;
    
    ctx.postMessage({ type: 'result', value: base64Data });
  } catch (error) {
    ctx.postMessage({ type: 'error', message: '无效的Base64编码' });
  }
}
