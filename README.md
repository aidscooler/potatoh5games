Build with Vitepress.

**Run this project**  
nvm use 20 (optional,this project develped under nodejs 20)  
npm install  
npm run docs:dev  

**Build this project**  
npm run docs:build   

**Add a standard H5 games**  
1、put the H5 game's build package into public folder  
there are two kind at present(Casual,Brain),if your game need players to use their brain then put it into the "public/brain" folder  
such as "public/brain/wordle".Make sure the game folder has a index.html.  
2、Config the game's navigation  
This project's default language is zh-CH and en-US is avaliable.  
".vitepress/gameNavData/" is the zh-CH config folder. As the game wordle,you should edit ".vitepress/gameNavData/brain.json"  
```json
    {
      "icon": { "src": "/brain/wordle/logo_48x48.png" },
      "title": "猜单词",
      "details": "你又6次机会猜中一个随机单词",
      "link": "/gameEntrance/brain/wordle"
    }
```
Also you should eidt ".vitepress/gameNavData/en/brain.json" for en-US
```json
    {
      "icon": { "src": "/brain/wordle/logo_48x48.png" },
      "title": "wordle",
      "details": "6 changces to guess a word!",
      "link": "/en/gameEntrance/brain/wordle"
    }
```

**Add a FC game**  
This project use EmulatorJS to run the FC game.Turn to [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) for more detals.  
1、Put the .nes file into "public/classic/emulatorJS-4.0.12/games/nesfile"  
2、Put the game's icon into "public/classic/emulatorJS-4.0.12/games/icons"  
3、Config the navigation  
As for game contra  
edit the ".vitepress/gameNavData/classic.json"
```json
    {
      "icon": { "src": "/classic/emulatorJS-4.0.12/games/icons/contra.ico" },
      "title": "魂斗罗",
      "details": "经典老游戏",
      "link": "/gameEntrance/classic/contra.nes"
    }
```
Also edit the ".vitepress/gameNavData/en/brain.json" for en-US
```json
    {
      "icon": { "src": "/classic/emulatorJS-4.0.12/games/icons/contra.ico" },
      "title": "Contra",
      "details": "classic Famicom Game",
      "link": "/en/gameEntrance/classic/contra.nes"
    }
```


