import fs from 'fs'
//官网说明的动态路由生成方法
 
export function filepaths(path) {
    return fs
      .readdirSync(path)
      .map((game) => {
        //console.log(game);
        return { params: { game: game } }
      });
}

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