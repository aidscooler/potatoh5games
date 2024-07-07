import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('./public/casual')
      .map((foldername) => {
        //console.log(foldername.split('.')[0]);
        return { params: { foldername: foldername.split('.')[0] } }
      })
  }
}