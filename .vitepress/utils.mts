import fs from 'fs'

//读取json配置文件的全部内容
export function readJSON(filepath) {
    try {
      const data = fs.readFileSync(filepath,{ encoding : 'utf-8'});
      //console.log(data);
      const obj = JSON.parse(data);
      //console.log(obj);
      return obj;
    }catch(err) {
      console.error('Error reading or parsing file:', err);
      return undefined;
    }
}

//生成sidebar内容，目前未做递归遍历子文件夹
export function  genSidebar(path) {
    let sidebarData = readJSON(path);
    for(var key in sidebarData) {
        for (var i = 0; i < sidebarData[key].length; i++) {
            sidebarData[key][i].items = fs.readdirSync('.' + key)
                .map((itemName) => {
                        const file = fs.readFileSync('.' + key + itemName, { encoding: 'utf-8'} );
                        const title = file.split('\n')[0];//文章第一行要写标题，这里才能读取出来
                        //console.log(title.split('#')[1]); //去掉 #
                        return { text: title.split('#')[1], link: key + itemName.split('.')[0] }
                })
        } 
    }
    //console.log(JSON.stringify(sidebarData));
    return sidebarData;
}

//获取文件夹下的子目录，文件名
export function filepaths(path) {
  return fs
    .readdirSync(path)
    .map((game) => {
      //console.log(game);
      return { params: { game: game } }
    });
}

//官网说明的动态路由生成方法 
// export function filepaths(path) {
//     return fs
//       .readdirSync(path)
//       .map((game) => {
//         //console.log(game);
//         return { params: { game: game } }
//     });
// }

