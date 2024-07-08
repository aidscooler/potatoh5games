import { filepaths } from '../../.vitepress/utils/util'

export default {
  paths() { 
    let nesfilepath = filepaths('./public/classic/emulatorJS-4.0.12/games/nesfile');
    let ndsfilepath = filepaths('./public/classic/emulatorJS-4.0.12/games/ndsfile');
    let filepath = nesfilepath.concat(ndsfilepath);
    //console.log(filepath);
    return filepath;
  }
}