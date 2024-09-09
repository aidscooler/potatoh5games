import Compressor from 'compressorjs';

self.onmessage = async (e: MessageEvent<{ blobUrl: string; fileName: string; options: any }>) => {
  const { blobUrl, fileName, options } = e.data;

  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();

    const compressedFile = await new Promise<File>((resolve, reject) => {
      new Compressor(blob, {
        ...options,
        success(result) {
          resolve(new File([result], fileName, { type: result.type }));
        },
        error(err) {
          reject(err);
        },
      });
    });

    self.postMessage({ compressedFile });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
