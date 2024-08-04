import { filepaths } from '../../.vitepress/utils.mjs'

export default {
  paths() {
    let path = filepaths('./public/brain')
    path = path.filter(function(item) {
      return item.params.game !== 'wordle-zh-CN';
    })
    //console.log(path);
    return path;
  }
}