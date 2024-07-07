import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('./public/classic/emulatorJS-4.0.12/games/nesfile')
      .map((gamefilename) => {
        //console.log(gamefilename);
        return { params: { gamefilename: gamefilename.split('.')[0] } }
      })
  }
}