import { js as beautify } from 'js-beautify'
import * as JavaScriptObfuscator from 'javascript-obfuscator'

export type Action = 'beautify' | 'purify' | 'encrypt' | 'decrypt' | 'uglify'

export async function processCode(action: Action, code: string): Promise<string> {
  switch (action) {
    case 'beautify':
      return beautify(code, { indent_size: 2 })
    case 'purify':
      //console.log(code);
      import('uglify-js')
      .then((module) => {
        const UglifyJS = module.default;
        const result = UglifyJS.minify(code, {
          mangle: false,
          compress: {
              dead_code: true,
              drop_debugger: true, 
              global_defs: {},
              hoist_vars: true,
              if_return: true,
              join_vars: true,
              cascade: true,
              collapse_vars: true,
              reduce_vars: true,
              toplevel: true,
              unused: true,
              warnings: false
          },
          output: {
              comments: false,
              beautify: false
          }
      })
        return result.code || code // 如果出错，返回原始代码
      })
      .catch((error) => {
        throw new Error(error);
      })
    case 'encrypt':
      // 实现代码加密逻辑
      return btoa(code)
    case 'decrypt':
      // 实现代码解密逻辑
      return atob(code)
    case 'uglify':
      return JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: true,
      }).getObfuscatedCode()
    default:
      throw new Error('未知的操作')
  }
}
