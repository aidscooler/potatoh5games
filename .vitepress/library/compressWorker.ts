import Compressor from 'compressorjs';

self.onmessage = async (e: MessageEvent<{ file: File; options: any }>) => {
  const { file, options } = e.data;
  //console.log(options)
  try {
    const compressedFile = await new Promise<File>((resolve, reject) => {
      new Compressor(file, {
        ...options,
        success(result) {
            //console.log(result)
          resolve(new File([result], file.name, { type: result.type }));
        },
        error(err) {
            //console.log(err);
          reject(err);
        },
      });
    });

    self.postMessage({ compressedFile });
  } catch (error) {
    console.log(error)
    self.postMessage({ error: error.message });
  }
};
