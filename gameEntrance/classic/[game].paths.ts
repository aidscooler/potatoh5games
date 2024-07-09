import { filepaths } from '../../.vitepress/utils/util'

export default {
  paths() { 
    let nesfilepath = filepaths('./public/classic/emulatorJS-4.0.12/games/nesfile');
    let gbafilepath = filepaths('./public/classic/emulatorJS-4.0.12/games/gbafile');
    let filepath = nesfilepath.concat(gbafilepath);
    //console.log(filepath);
    return filepath;
  }
}