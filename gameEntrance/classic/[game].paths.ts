import { filepaths } from '../../.vitepress/utils.mjs'
import virtureroute from '../../.vitepress/config/virtureroute.json'

export default {
  paths() { 
    let basepath = filepaths('./public/classic')//获取classic的子文件夹，本地h5游戏存放在这里
    let nesfilepath = filepaths('./public/classic/games/nesfile');//nes文件
    let gbafilepath = filepaths('./public/classic/games/mame2003plusfile');//zip文件
    let filepath = basepath;
    filepath = filepath.concat(nesfilepath);
    filepath = filepath.concat(gbafilepath);
    virtureroute.forEach(function(element){//添加cdn文件名称
      filepath.push({params:{game: element.filename}})
    });
    // filepath.push({params:{game: 'redalert2'}});//嵌入其他网页的路由
    // filepath.push({params:{game: 'mslug3.zip'}});//访问CDN路径的路由
    // filepath.push({params:{game: 'mslug4.zip'}});
    // filepath.push({params:{game: 'mslugx.zip'}});
    //console.log(filepath);
    return filepath;
  }
}