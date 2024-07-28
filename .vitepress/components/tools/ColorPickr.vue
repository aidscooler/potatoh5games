<template>
    <div class="enhanced-color-picker">
      <div class="theme-selector">
        <button 
          v-for="theme in themes" 
          :key="theme.value"
          :class="['theme-button', theme.value, { active: currentTheme === theme.value }]"
          @click="changeTheme(theme.value)"
        >
          {{ theme.label }}
        </button>
      </div>
      <div ref="pickrContainerWrapper"></div>
      <div class="button-container">
        <button v-if="supportsEyeDropper" @click="openEyeDropper" class="eyedropper-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 16l4-4l-6-6l-4 4"></path>
            <path d="M8.5 15.5l-5 5"></path>
            <path d="M2 22l5-5"></path>
            <path d="M18.5 5.5l-9 9"></path>
          </svg>
          打开吸管
        </button>
        <input v-else type="color" @input="handleColorInput" class="color-input" />
      </div>
      <div class="color-values" v-if="selectedColor">
        <h3>选中的颜色值：</h3>
        <div v-for="(value, key) in formattedColorValues" :key="key" class="color-value-item">
          <p><strong>{{ key.toUpperCase() }}:</strong> {{ value }}</p>
          <button @click="copyToClipboard(value)" class="copy-button">复制</button>
        </div>
      </div>
    </div>
    <div class="copy-message" v-if="copyMessage">{{ copyMessage }}</div>
</template>
  
  <script setup lang="ts">
  //import Pickr from '@simonwep/pickr';
  import Options from '@simonwep/pickr';
  import '@simonwep/pickr/dist/themes/classic.min.css';
  import '@simonwep/pickr/dist/themes/monolith.min.css';
  import '@simonwep/pickr/dist/themes/nano.min.css';
  
  let Pickr = null;
  const pickrContainerWrapper = ref<HTMLElement | null>(null);
  const pickr = ref(null);
  const supportsEyeDropper = ref(false);
  const selectedColor = ref<Pickr.HSVaColor | null>(null);
  const currentTheme = ref<Options.Theme>('classic');

  const copyMessage = ref('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      copyMessage.value = '复制成功！';
      setTimeout(() => {
        copyMessage.value = '';
      }, 2000);
    }, (err) => {
      console.error('无法复制文本: ', err);
      copyMessage.value = '复制失败，请重试';
      setTimeout(() => {
        copyMessage.value = '';
      }, 2000);
    });
  };

  const formattedColorValues = ref({
      hexa: '',
      rgba: '',
      hsla: '',
      hsva: '',
      cmyk: ''
  });
  
  const themes = [
    { value: 'classic', label: 'Classic' },
    { value: 'monolith', label: 'Monolith' },
    { value: 'nano', label: 'Nano' }
  ];
  
  const roundToTwoDecimal = (value: number): number => {
    return Math.round(value * 100) / 100;
  };
  
  const formatRGBA = (rgba: number[]): string => {
    const [r, g, b, a] = rgba.map((v, i) => i === 3 ? roundToTwoDecimal(v) : Math.round(v));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  
  const formatHSLA = (hsla: number[]): string => {
    const [h, s, l, a] = hsla.map((v, i) => i === 3 ? roundToTwoDecimal(v) : Math.round(v));
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
  };
  
  const formatHSVA = (hsva: number[]): string => {
    const [h, s, v, a] = hsva.map((v, i) => i === 3 ? roundToTwoDecimal(v) : Math.round(v));
    return `hsva(${h}, ${s}%, ${v}%, ${a})`;
  };
  
  const formatCMYK = (cmyk: number[]): string => {
    const formattedValues = cmyk.map(v => Math.round(v));
    return `cmyk(${formattedValues.join('%, ')}%)`;
  };
  
  const initializePickr = async () => {
    //await nextTick(); // 确保DOM已经更新
    // 每次重新创建一个新的 pickrContainer
    const newContainer = document.createElement('div');
    pickrContainerWrapper.value?.appendChild(newContainer);    

      if (pickr.value) {
        pickr.value.destroyAndRemove();
      }
      pickr.value = Pickr.create({
        el: newContainer,
        theme: currentTheme.value,
        swatches: [
          'rgba(244, 67, 54, 1)',
          'rgba(233, 30, 99, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(103, 58, 183, 1)',
          'rgba(63, 81, 181, 1)',
          'rgba(33, 150, 243, 1)',
          'rgba(3, 169, 244, 1)',
          'rgba(0, 188, 212, 1)',
          'rgba(0, 150, 136, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(139, 195, 74, 1)',
          'rgba(205, 220, 57, 1)',
          'rgba(255, 235, 59, 1)',
          'rgba(255, 193, 7, 1)'
        ],
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: {
            hex: true,
            rgba: true,
            hsla: true,
            hsva: true,
            cmyk: true,
            input: true,
            clear: true,
            save: true
          }
        }
      });
      pickr.value.on('change', (color: Pickr.HSVaColor) => {
        selectedColor.value = color;
        //console.log(color.toHEXA().toString());
        updateFormattedColorValues(color)
      }); 
      pickr.value.on('save', (color: Pickr.HSVaColor) => {
        selectedColor.value = color;
        //console.log(color.toHEXA().toString());
        updateFormattedColorValues(color)
      });    
      pickr.value.on('clear', (color: Pickr.HSVaColor) => {
        selectedColor.value = null;
        //console.log(color.toHEXA().toString());
        updateFormattedColorValues(null)
      });          
  };
  const updateFormattedColorValues = (color) => {
    if (color) {
      formattedColorValues.value.hexa = color.toHEXA().toString();
      formattedColorValues.value.rgba = formatRGBA(color.toRGBA());
      formattedColorValues.value.hsla = formatHSLA(color.toHSLA());
      formattedColorValues.value.hsva = formatHSVA(color.toHSVA());
      formattedColorValues.value.cmyk = formatCMYK(color.toCMYK());
    } else {
      Object.keys(formattedColorValues.value).forEach(key => formattedColorValues[key] = '');
    }
  };

  const changeTheme = (theme: String) => {
    currentTheme.value = theme as Options.Theme;
    initializePickr();
  };
  
  const checkEyeDropperSupport = () => {
    supportsEyeDropper.value = 'EyeDropper' in window;
  };
  
  const openEyeDropper = async () => {
    if (!('EyeDropper' in window)) {
      console.error('EyeDropper API is not supported in this browser');
      return;
    }
  
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (pickr.value) {
        pickr.value.setColor(result.sRGBHex);
      }
    } catch (error) {
      console.error('EyeDropper error:', error);
    }
  };
  
  const handleColorInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (pickr.value) {
      pickr.value.setColor(target.value);
    }
  };
  
  onMounted( async () => {

    if (typeof window !== 'undefined') {
      import('@simonwep/pickr')
        .then(module => {
          Pickr = module.default;
          initializePickr();
          checkEyeDropperSupport();        
        })
        .catch(error => {
          console.error('Failed to load Pickr:', error)
        })
    }    
  });
  
  onBeforeUnmount(() => {
    if (pickr.value) {
      pickr.value.destroyAndRemove();
    }
  });

    </script>
  
  <style scoped>
  .enhanced-color-picker {
    font-family: 'Roboto', sans-serif;
    max-width: 350px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .theme-selector {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .theme-button {
    padding: 8px 16px;
    margin: 0 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  
  .theme-button.classic {
    background-color: #f1f3f4;
    color: #333;
  }
  
  .theme-button.monolith {
    background-color: #3498db;
    color: white;
  }
  
  .theme-button.nano {
    background-color: #2ecc71;
    color: white;
  }
  
  .theme-button.active {
    transform: scale(1.05);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  
  .button-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
  
  .eyedropper-button, .color-input {
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .eyedropper-button:hover, .color-input:hover {
    background-color: #3367d6;
  }
  
  .eyedropper-button svg {
    width: 18px;
    height: 18px;
  }
  
  .color-input {
    width: 100px;
    height: 40px;
    padding: 0;
  }
  
  .color-values {
    margin-top: 20px;
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
  }
  
  .color-values h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  .color-values p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  /* Pickr 自定义样式 */
  :deep(.pickr) {
    width: 100%;
  }
  
  :deep(.pcr-button) {
    width: 100%;
    height: 40px;
    border-radius: 4px;
  }
  
  :deep(.pcr-app) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
  }
  
  :deep(.pcr-interaction input) {
    border-radius: 4px;
    font-size: 14px;
  }
  
  :deep(.pcr-interaction .pcr-save) {
    background-color: #4285f4;
  }
  
  :deep(.pcr-interaction .pcr-save:hover) {
    background-color: #3367d6;
  }

  .color-value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.copy-button {
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.copy-button:hover {
  background-color: #3367d6;
}
.copy-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1000;
}
  </style>
  