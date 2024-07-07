import fs from 'fs'

export default {
  paths() {
    let path =  fs
      .readdirSync('./public/brain')
      .map((foldername) => {
        if(foldername !== 'wordle-zh-CN') {
          return { params: { foldername: foldername.split('.')[0] } }
        }
    })
    path = path.filter(function(item) {
      return item !== undefined;
    });
    //console.log(path);
    return path;
  }
}