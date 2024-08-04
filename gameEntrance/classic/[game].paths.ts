import { filepaths } from '../../.vitepress/utils.mjs'

export default {
  paths() { 
    let basepath = filepaths('./public/classic')
    let nesfilepath = filepaths('./public/classic/games/nesfile');
    let gbafilepath = filepaths('./public/classic/games/mame2003plusfile');
    let filepath = basepath;
    filepath = filepath.concat(nesfilepath);
    filepath = filepath.concat(gbafilepath);
    filepath.push({params:{game: 'redalert2'}});//嵌入其他网页的路由
    filepath.push({params:{game: 'mslug3.zip'}});//访问CDN路径的路由
    filepath.push({params:{game: 'mslug4.zip'}});
    filepath.push({params:{game: 'mslugx.zip'}});
    //console.log(filepath);
    return filepath;
  }
}