<template>
    <div>
      <h1>
        移除照片背景<a
          href="http://github.com/xenova/transformers.js"
          target="_blank"
        ></a>
      </h1>
      <div class="flex">
        <h4>
          在浏览器中本地运行，由<a href="https://bria.ai/" target="_blank"
            >BRIA AI</a
          >的<a href="https://huggingface.co/briaai/RMBG-1.4" target="_blank"
            >RMB G V1.4型号</a
          >提供支持
        </h4>
        <div id="container">
          <label id="upload-button" for="upload">
            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#000"
                d="M3.5 24.3a3 3 0 0 1-1.9-.8c-.5-.5-.8-1.2-.8-1.9V2.9c0-.7.3-1.3.8-1.9.6-.5 1.2-.7 2-.7h18.6c.7 0 1.3.2 1.9.7.5.6.7 1.2.7 2v18.6c0 .7-.2 1.4-.7 1.9a3 3 0 0 1-2 .8H3.6Zm0-2.7h18.7V2.9H3.5v18.7Zm2.7-2.7h13.3c.3 0 .5 0 .6-.3v-.7l-3.7-5a.6.6 0 0 0-.6-.2c-.2 0-.4 0-.5.3l-3.5 4.6-2.4-3.3a.6.6 0 0 0-.6-.3c-.2 0-.4.1-.5.3l-2.7 3.6c-.1.2-.2.4 0 .7.1.2.3.3.6.3Z"
              ></path>
            </svg>
            点击上传图片
            <label id="example">（或者试试示例）</label>
          </label>
        </div>
        <label id="status"></label>
      </div>
  
      <input id="upload" type="file" accept="image/*" />
    </div>
  </template>
  
  <script lang="tsx" setup>
  //import { AutoModel, AutoProcessor, env, RawImage } from '@huggingface/transformers';
  import { getGPUTier } from 'detect-gpu';

  let AutoModel,AutoProcessor,env,RawImage;
  onMounted(async () => {
      const modules = await import('@huggingface/transformers');
      AutoModel = modules.AutoModel;
      AutoProcessor = modules.AutoProcessor;
      env = modules.env;
      RawImage = modules.RawImage;

      // Since we will download the model from the Hugging Face Hub, we can skip the local model check
      env.allowLocalModels = false;
      //env.remoteHost = "https://scriptecho.oss-cn-beijing.aliyuncs.com/huggingface/";
      env.remoteHost = "https://briaai.potatoh5games.fun/";
      env.remotePathTemplate = "{model}";
  
      env.backends.onnx.wasm.wasmPaths = "/wasm/";
      // Proxy the WASM backend to prevent the UI from freezing
      env.backends.onnx.wasm.proxy = true;
  
      // Constants
      const EXAMPLE_URL = 'https://scriptecho.oss-cn-beijing.aliyuncs.com/images/pexels-photo-5965592.webp';
  
      // Reference the elements that we will need
      const status = document.getElementById('status');
      const fileUpload = document.getElementById('upload');
      const imageContainer = document.getElementById('container');
      const example = document.getElementById('example');

      const gpuTier = await getGPUTier();
      const modelSettings: Parameters<typeof AutoModel.from_pretrained>[1] = {
        // Do not require config.json to be present in the repository
        config: { model_type: "custom" },
        subfolder: ""
      }
      if (gpuTier?.fps && !gpuTier?.isMobile) {
        modelSettings.device = "webgpu"
        modelSettings.dtype = "fp32"
      }  
      // Load model and processor
      status.textContent = '正在加载模型...';

      const model = await AutoModel.from_pretrained('briaai/RMBG-1.4', modelSettings);

      const processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
          // Do not require config.json to be present in the repository
          config: {
              do_normalize: true,
              do_pad: false,
              do_rescale: true,
              do_resize: true,
              image_mean: [0.5, 0.5, 0.5],
              feature_extractor_type: "ImageFeatureExtractor",
              image_std: [1, 1, 1],
              resample: 2,
              rescale_factor: 0.00392156862745098,
              size: { width: 1024, height: 1024 },
          }
      });
  
      status.textContent = '已完成';
  
      example.addEventListener('click', (e) => {
          e.preventDefault();
          predict(EXAMPLE_URL);
      });
  
      fileUpload.addEventListener('change', function (e) {
          const file = e.target.files[0];
          if (!file) {
              return;
          }
  
          const reader = new FileReader();
  
          // Set up a callback when the file is loaded
          reader.onload = e2 => predict(e2.target.result);
  
          reader.readAsDataURL(file);
      });
  
      // Predict foreground of the given image
      async function predict(url) {
          // Read image
          const image = await RawImage.fromURL(url);
  
          // Update UI
          imageContainer.innerHTML = '';
          imageContainer.style.backgroundImage = `url(${url})`;
  
          // Set container width and height depending on the image aspect ratio
          const ar = image.width / image.height;
          const [cw, ch] = (ar > 720 / 480) ? [720, 720 / ar] : [480 * ar, 480];
          imageContainer.style.width = `${cw}px`;
          imageContainer.style.height = `${ch}px`;
  
          status.textContent = '正在分析...';
  
          // Preprocess image
          const { pixel_values } = await processor(image);
  
          // Predict alpha matte
          const { output } = await model({ input: pixel_values });
  
          // Resize mask back to original size
          const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);
  
          // Create new canvas
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
  
          // Draw original image output to canvas
          ctx.drawImage(image.toCanvas(), 0, 0);
  
          // Update alpha channel
          const pixelData = ctx.getImageData(0, 0, image.width, image.height);
          for (let i = 0; i < mask.data.length; ++i) {
              pixelData.data[4 * i + 3] = mask.data[i];
          }
          ctx.putImageData(pixelData, 0, 0);
  
          // Update UI
          imageContainer.append(canvas);
          imageContainer.style.removeProperty('background-image');
          imageContainer.style.background = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg==")`;
          status.textContent = '完成!';
      }
  })
  </script>
  
  <style scoped>
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    font-family: sans-serif;
  }
  
  html,
  body {
    height: 100%;
  }
  
  body {
    padding: 16px 32px;
  }
  
  body,
  #container,
  #upload-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  h1 {
    text-align: center;
  }
  
  #container {
    position: relative;
    width: 640px;
    height: 420px;
    max-width: 100%;
    max-height: 100%;
    border: 2px dashed #d1d5db;
    border-radius: 0.75rem;
    overflow: hidden;
    margin-top: 1rem;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  #mask-output {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  
  #upload-button {
    gap: 0.4rem;
    font-size: 18px;
    cursor: pointer;
  }
  
  #upload {
    display: none;
  }
  
  svg {
    pointer-events: none;
  }
  
  #example {
    font-size: 14px;
    text-decoration: underline;
    cursor: pointer;
  }
  
  #example:hover {
    color: #2563eb;
  }
  
  canvas {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  #status {
    min-height: 16px;
    margin: 8px 0;
    width: 640px;
  }
  
  input[type='range'] {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
  }
  .flex {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  </style>