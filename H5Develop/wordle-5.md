# cocos creator实现wordle游戏（五）

## 初始化游戏
由于在游戏中“空格”的背景和Label会有相应的变化。所以在游戏开始前需要进行一些初始化设置。
- 随机生成一个5个字母的单词。
- 重置“空格”的背景和字体颜色：重置为在Cocos Creator编辑器中的初始设计值。
- 设置“空格”只读：初始状态下，只有第一排可以输入。
- 重置键盘按钮的背景颜色：重置为在Cocos Creator编辑器中的初始设计值。
- 设置当前选中的“空格”。
在gamemanager中实现以上功能，代码如下：
```TypeScript
    import { words } from './words';//加载词库
    //根据词库随机生成一个单词
    setCurrentAnswer () {
        let sAnswer = words.getRandomword();
        gamemanager._currentAnswer = sAnswer;
    }
 
    getCurrentAnswer () {
        return gamemanager._currentAnswer;
    }
 
    //重置中间方块区域
    resetMiddleBtn () {
        let homeNode = gamemanager.instance.homeNode;
        for (let i = 0; i < 6; i ++){
            let layoutNode = homeNode.getChildByPath('top/Layout_middle' + (i + 1).toString());
            for(let j = 0; j < layoutNode.children.length;j++){
                layoutNode.children[j].getChildByName('Sprite').getComponent(Sprite).spriteFrame = 
                layoutNode.children[j].getChildByName('Sprite').getComponent(Sprite).spriteAtlas.getSpriteFrame('btn_border');
                layoutNode.children[j].getChildByName('Label').getComponent(Label).string = '';
                layoutNode.children[j].getChildByName('Label').getComponent(Label).color = new Color(0,0,0);
            }  
        }  
    }
    //设置中间方块区域只读
    setMiddleBtnReadOnly () {
        let homeNode = gamemanager.instance.homeNode;
        for (let i = 0; i < 6; i ++){
            let layoutNode = homeNode.getChildByPath('top/Layout_middle' + (i + 1).toString());
            if (i === 0) {
                gamemanager.instance.setBtnEnable(layoutNode,true);
            }
            else {
                gamemanager.instance.setBtnEnable(layoutNode,false); 
            }   
        }  
    }
    setBtnEnable(layoutNode,isEnable){
        if(layoutNode) {
            for(let i = 0;i < layoutNode.children.length;i++){
                layoutNode.children[i].getComponent(Button).enabled = isEnable;
            }
        }
    } 
    //重置键盘按钮
    resetKeybordeBG () {
        let homeNode = gamemanager.instance.homeNode;
        for(let i = 0; i < 3; i++){
            let layoutNode = homeNode.getChildByPath('top/Layout_bottom' + (i + 1).toString());
            for(let j = 0; j < layoutNode.children.length; j++){
                    layoutNode.children[j].getComponent(Sprite).spriteFrame = 
                    layoutNode.children[j].getComponent(Sprite).spriteAtlas.getSpriteFrame('keybord_bg');
            }
        }
    }
    //运行“空格”输入动画
    showBtnInputTween (currentBtnNode) {
        currentBtnNode.getComponent('btn_middle').tweenObjLabelInput.start();
    }
    //运行“空格”清除动画
    showBtnClearTween (currentBtnNode) {
        currentBtnNode.getComponent('btn_middle').tweenObjClear.start();
    }
```
&emsp;&emsp;词库是在github上找的原版游戏的词库。词库分为两部分，正确的单词大概有2700多个，允许输入的单词大概有1万个。原版游戏的作者只将常用的英文单词作为正确答案，考虑不通国家的玩家的语言不同又增加了近万个单词允许输入。后续教程写完以后会将原代码以及所用到的素材提供下载，这里就不再贴出来了，太长不好显示。

在home.ts脚本中增加initgame函数来统一管理游戏初始化过程：
```TypeScript
    start () {
        this.initgame();
    }
    //初始化游戏
    initgame() {
        let homeNode = gamemanager.instance.getHomeNode();   
        const layoutnode = homeNode.getChildByPath('top/Layout_middle1');
        //设置答案
        gamemanager.instance.setCurrentAnswer();
        //重置中间框格背景，字体颜色
        gamemanager.instance.resetMiddleBtn();
        //设置中间方格只读
        gamemanager.instance.setMiddleBtnReadOnly();
        //重置键盘按钮颜色
        gamemanager.instance.resetKeybordeBG(); 
        //选中第一个方框
        gamemanager.instance.setCurrentLayoutNode(layoutnode); 
        gamemanager.instance.setCurrentBtnNode(layoutnode.children[0]); 
        layoutnode.children[0].getComponent(Button).clickEvents[0].emit(['click']);                     
    }
```
## 提交答案
- 获取当前所在第几排，然后将这一排5个字母组合成一个字符串。
- 进行合法性校验：填写的字母够不够5个，是否为有效单词。
- 若未通过校验则显示提示框，提示框为prefab组件。
在home.ts中增加submitAnswer函数，代码如下：
```TypeScript
    submitAnswer () {//提交答案
        let currentLayoutNode = gamemanager.instance.getCurrentLayoutNode();
        let err = '';
        let sAnswer = '';
 
        for (let i = 0;i < currentLayoutNode.children.length; i++) {
            sAnswer += currentLayoutNode.children[i].getChildByName('Label').getComponent(Label).string;
        }
        sAnswer = sAnswer.toLowerCase();
        if (sAnswer.length < 1) {
            err = '请填一个单词';
        }
        else if (sAnswer.length < 5) {
            err = '单词还没有填完';
        }
        else if (words.allwords.indexOf(sAnswer) < 0){//校验单词
            err = '不是有效单词';
        }
 
        if (err) {//弹出提示框
            Util.showDiolag('prefab/messageBox',homeNode.parent,(newNode) =>{
                if(newNode) {
                    newNode.getChildByName('Label').getComponent(Label).string = err;
                }                
            });
        }
        else {         
            //处理答案提交动画           
            this.processAnswer();
        }
    }
```
需要先创建Util.ts脚本并在home.ts中引用它，Utile.ts脚本中我将常用的功能进行了一些封装。如下：
```TypeScript
 
import { _decorator, Component, resources,Prefab,instantiate,Label } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('Util')
export class Util extends Component {
  //判断字符串是否为空
    static isEmpty (str): boolean {
      if (
            str === null ||
            str === '' ||
            str === undefined ||
            str.length === 0
          ) {
            return true
        } 
        else {
            return false
      }
    }
  //动态加载prefab组件
  static showDiolag(sPath,parentNode,callback){
    resources.load(sPath,Prefab,(err, prefeb) => {
      if(err) {
          console.log(err);
      }
      else {
          let newNode = instantiate(prefeb);
          if(callback) {
            callback(newNode);
          }
          parentNode.addChild(newNode); 
      }
    });   
  }
  //执行线性等待
  static async sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
          resolve('');
        }, ms)
    });
  }    
  //获取字符串最后一个字符
  static getLastChar(str) : string{
    if(Util.isEmpty(str)){
      return '';
    }
    else {
      return str.slice(str.length - 1,str.length);
    }
  }
  //http请求有道翻译
  static translate(str,handler){
    let xhr = new XMLHttpRequest();
    xhr.timeout = 5000;//超时参数
    xhr.onreadystatechange = function (data) {
        if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
            let response = xhr.responseText;
            let data = JSON.parse(response);
            if (handler) {//获取翻译结果
              let sResult = data['translateResult'][0][0]['tgt'];
              let sUrl = 'https://dict.youdao.com/dictvoice?type=0&audio=' + str; 
              handler(sResult,sUrl);
            }
            //data['translateResult'][0][0]['tgt']翻译结果
            //data.type 翻译类型:EN2ZH_CN英译汉 ZH_CN2EN汉译英
            //有道英文语音接口
            //'https://dict.youdao.com/dictvoice?type=0&audio=' + sResult;
            //百度中文语音接口
            //https://fanyi.baidu.com/gettts?lan=zh&text=' + sResult + '&spd=5&source=web';
        }  
    }//翻译接口采用有道翻译
    let url = 'https://fanyi.youdao.com/translate?&doctype=json&type=EN2ZH_CN&i=' + str
    xhr.withCredentials = true;
    xhr.open("GET", url , true);
    //跨域设置
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST');
    xhr.setRequestHeader('Access-Control-Allow-Headers', 'x-requested-with,content-type,authorization');
    xhr.send();
  }  
}
```
&emsp;&emsp;由于typescripte脚本是异步执行方式，在实践中要顺序显示“方格”的翻转动画，就需要实现一个类似Java中的sleep函数功能，让前一个“空格”开始翻转后等待100ms再开始旋转下一个“空格”。之所以要设计一个获取字符串最后一个字符的功能是因为在Cocos creator编辑器中，Layout和btn_middle等组件我都是将名称最后一位作为索引，然后在代码中根据这个索引来判断是位置。现在回过头来重新看这段代码就会觉得没有必要，可以根据父节点的.children属性来遍历子节点。 

&emsp;&emsp;玩家提交的答案通过合法性校验后根据游戏规则判断猜测结果并调用“方格”的旋转动画，在home.ts中增加processAnswer函数：

&emsp;&emsp;将随机生成的答案转换为sAnswer数组，在for循环中依次比对玩家输入的每一个字母，并根据游戏规则改变“方格”的背景。为了方便玩家识别还有哪些字母可使用，增加了alterKeybordebg函数将比对结果同步更新到键盘按钮上。当前这一排提交后就需要将这一排设置为只读，让玩家不能再输入，然后将下一排设置为可以输入。当玩家猜中单词时则胜利，游戏结束。当第6排提交以后还未猜中单词，再获取下一排时就会获取到null，则输了，游戏结束。实现代码如下：
```TypeScript
    async processAnswer (){
        let homeNode = gamemanager.instance.getHomeNode();
        let isPass = true;
        let layoutNode_middle = gamemanager.instance.getCurrentLayoutNode();
        let sAnswer = gamemanager.instance.getCurrentAnswer().split('');
        //先锁定这一排
        gamemanager.instance.setBtnEnable(layoutNode_middle,false); 
        for (let i = 0; i < layoutNode_middle.children.length; i++) {
            let char = layoutNode_middle.children[i].getChildByName('Label').getComponent(Label).string;
            char = char.toLowerCase();
            if (sAnswer.indexOf(char) < 0){//答案中没有这个字母
                layoutNode_middle.children[i].getComponent('btn_middle').runRotation('btn_wrong');
                this.alterKeybordebg(char,'wrong');
                isPass = false;
            }else{
                if (sAnswer[i] != char) {//答案中有这个字母但是顺序不对
                    layoutNode_middle.children[i].getComponent('btn_middle').runRotation('btn_partright');
                    this.alterKeybordebg(char,'partright');
                    sAnswer[sAnswer.indexOf(char)] = null; 
                    isPass = false;
                }
                else{//答案中有这个字母，顺序也对
                    layoutNode_middle.children[i].getComponent('btn_middle').runRotation('btn_right');
                    this.alterKeybordebg(char,'right');
                    sAnswer[i] = null;
                }
            }
            await Util.sleep(100); //不执行线性等待，则所有方块一起翻转   
        }
        if(isPass) {//通过则显示胜利弹窗和战绩，
            let sCorrectAnswer = gamemanager.instance.getCurrentAnswer();
            Util.showDiolag('prefab/resultBox',homeNode.parent,(newNode)=>{
                if(newNode){
                    newNode.getChildByName('content').getChildByName('title').getComponent(Label).string = '恭喜你答对了!';
                    newNode.getChildByName('content').getChildByName('message').getComponent(Label).string = 
                    '答案是:' + sCorrectAnswer;                    
                }
            });            
            this.readyToNext();
        }
        else {
            //获取下一排的layoutNode
            let char = Util.getLastChar(layoutNode_middle.name);
            let nextIndex = parseInt(char) + 1;
            const nextLayoutNode = homeNode.getChildByPath('top/Layout_middle' + nextIndex.toString());
            if(nextLayoutNode){//获取到了则设置当前layout节点和btn节点
                const nextBtnNode = nextLayoutNode.getChildByName(nextLayoutNode.name + '_1');
                gamemanager.instance.setBtnEnable(nextLayoutNode,true);
                gamemanager.instance.setCurrentLayoutNode(nextLayoutNode);
                gamemanager.instance.setCurrentBtnNode(nextBtnNode);
                //模拟点击事件
                nextBtnNode.getComponent(Button).clickEvents[0].emit(['click']);
            }
            else{//没获取到，则表示已经输了,显示正确答案
                let sCorrectAnswer = gamemanager.instance.getCurrentAnswer() ;
                Util.showDiolag('prefab/resultBox',homeNode.parent,(newNode)=>{
                    if(newNode){
                        newNode.getChildByName('content').getChildByName('title').getComponent(Label).string = '很遗憾你答错了!';
                        newNode.getChildByName('content').getChildByName('message').getComponent(Label).string = 
                        '答案是:' + sCorrectAnswer;                    
                    }
                });
                this.readyToNext();                
            }
        }
    }
 
    alterKeybordebg(sKey,type){
       let homeNode = gamemanager.instance.getHomeNode(); 
       let key = sKey.toUpperCase();
       for(let i = 0;i < 3; i++) {
           let layoutNode = homeNode.getChildByPath('top/Layout_bottom' + (i + 1).toString());
           for(let j = 0; j < layoutNode.children.length; j++) {
               if (layoutNode.children[j].getChildByName('Label').getComponent(Label).string === key) {
                   if(type === 'wrong') {//错误要判断之前是否已经更新过了，没有更新过才更新
                        if ((layoutNode.children[j].getComponent(Sprite).spriteFrame.name === 'keybord_bg')) {
                            layoutNode.children[j].getComponent(Sprite).spriteFrame = 
                            layoutNode.children[j].getComponent(Sprite).spriteAtlas.getSpriteFrame('keybord_wrong');                            
                        }
                   }
                   else if (type === 'right') {//正确直接更新
                        layoutNode.children[j].getComponent(Sprite).spriteFrame = 
                        layoutNode.children[j].getComponent(Sprite).spriteAtlas.getSpriteFrame('keybord_right');
                   }
                   else {
                       //若存在，但是位置不正确的字母,需要判断是否之前更新过，如果之前更新过则不需要再更新了
                       if (layoutNode.children[j].getComponent(Sprite).spriteFrame.name === 'keybord_bg') {
                            layoutNode.children[j].getComponent(Sprite).spriteFrame = 
                            layoutNode.children[j].getComponent(Sprite).spriteAtlas.getSpriteFrame('keybord_partright');
                       }
                   }
               }
           }
       }
    }    
```
&emsp;&emsp;上述代码中调用的this.readyToNext()是将“ENTER”键的显示内容变化成“NEXT”，此时玩家点击后将开起第二局游戏。为了方便玩家识别，做了背景色的变化。代码如下：
```TypeScript
    readyToNext() {
        //游戏结束时，将当前选中节点置空
        gamemanager.instance.setCurrentBtnNode(null);
        gamemanager.instance.setCurrentLayoutNode(null);
        this.setENTERBtnInfo('NEXT',new Color(17,235,130));     
    }
```
&emsp;&emsp;最后在home.ts中创建onClick函数，此函数将绑定到ENTER键的点击事件上。判断“ENTER”键的显示内容若为“ENTER”则调用submitAnswer进行答案提交，若为“NEXT”，则还原“ENTER”键的初始社会并调用initgame开始下一局游戏。代码如下：
```TypeScript
   setENTERBtnInfo(smessage : string,color : Color){//还原ENTER键的背景和显示内容
        let homeNode = gamemanager.instance.getHomeNode();
        let ENTERNode = homeNode.getChildByPath('top/Layout_bottom4/ENTER');
        ENTERNode.getChildByName('Label').getComponent(Label).string = smessage;
        ENTERNode.getComponent(Sprite).color = color;
        ENTERNode.angle = 0;
    }
 
    startNextGame() { //开始下一局游戏
        this.setENTERBtnInfo('ENTER',new Color(255,255,255));        
        this.initgame(); 
    }
 
    onClick (){//ENTER键点击事件
        let homeNode = gamemanager.instance.getHomeNode();
        let ENTERNode = homeNode.getChildByPath('top/Layout_bottom4/ENTER');
        if (ENTERNode.getChildByName('Label').getComponent(Label).string === 'NEXT') {
            this.startNextGame();
        }
        else {
            this.submitAnswer();
        }
    }
```
事件绑定的操作前面已经介绍过，这里不再累述。最终“ENTER”键的设置如下：
<p align="center"><img src="/blogimage/wordle/5/1.png"></p>

## 制作消息提示框和游戏结果信息提示框
&emsp;&emsp;在游戏中提示框是很常见的组件，需要制作为prefab在代码中动态加载，实现组件的重复利用。动态加载的功能已经在Util.ts脚本中封装好。prefab的制作方法在前面已经介绍过，这里不再累述，只是介绍一下提示框的UI和功能设计。

消息提示框设计如下：
<p align="center"><img src="/blogimage/wordle/5/2.png"></p>

- messageBox为一个空节点。
- Mask为Sprite（单色）：大小设置为宽720，高1280,。并且绑定一个button组件，UIOpacity组件。将UIOpacity设置为0（完全透明），button按钮事件数量设置为0。
<p align="center"><img src="/blogimage/wordle/5/3.png"></p>
这样设计的目的是为了让Mask成为一个透明遮罩，当提示框显示出来时，用户点击Sprite以外的区局也就无法触发“空格”上的点击事件。  

- Sprite为Sprite。作为背景图，添加一个UIOpacity组件，透明度设置为100。
<p align="center"><img src="/blogimage/wordle/5/4.png"></p>

- Label。主要设置一下字体，颜色。Sprite和Label的大小根据自己喜好自行设定即可。

界面设计完成后，再创建一个messageBox.ts脚本文件绑定到messageBox这个空节点上。messageBox.ts实现的功能也很简单，如下：
```TypeScript
import { _decorator, Component, Node, tween, Sprite, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('messageBox')
export class messageBox extends Component {
    private tweenObj = null;
 
    onLoad () {
        let self = this;
        this.tweenObj = tween(this.node.getChildByName('Sprite').getComponent(UIOpacity))
        .to(0.3,{opacity : 255})
        .delay(1)
        .call(function () {
            self.node.destroy();
        });
    }
 
    start () {
        this.tweenObj.start();
    }
}
```
在加载的时候创建一个动画，在0.3秒内将Sprite的透明度变化到255，延迟一秒，调用self.node.destroy()将节点销毁，此时提示框也就消失了。
调用代码：
```TypeScript
Util.showDiolag('prefab/messageBox',homeNode.parent,(newNode) =>{
                if(newNode) {
                    newNode.getChildByName('Label').getComponent(Label).string = err;
                }                
            });

```
&emsp;&emsp;第一个参数是prefab的路径和prefab的名称，prefab是在resources目录下的文件夹，messageBox是prefab的名称。homeNode是prefab将要加载到哪个节点下，这里的homeNode也就是home节点。通过回调函数给messageBox中的Label复制，显示提示消息。最终实现的效果就是弹出一个提示框，提示框有一个透明的变化，由半透明变化到不透明，并且显示1秒后就自动销毁，不用玩家再手工关闭。


游戏结果提示框设计如下：
<p align="center"><img src="/blogimage/wordle/5/5.png"></p>

- resultBox是空节点。宽720，高1280
- mask和消息提示框prefab中的mask一样。
- content是Sprtie，背景为一张黄色的图片。
- title是Label，用于显示游戏结果。
- message是Label，用于显示答案。
- btn是按钮，点击后关闭该提示框。
新建resultBox.ts脚本将脚本挂载到resultBox空节点上。代码如下：
```TypeScript
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('resultBox')
export class resultBox extends Component {
    onClick() {
        this.node.destroy();
    }
}
```
然后将onClick函数绑定到btn按钮的点击事件上即可。调用方式：
```TypeScript
Util.showDiolag('prefab/resultBox',homeNode.parent,(newNode)=>{
                if(newNode){
                    newNode.getChildByName('content').getChildByName('title').getComponent(Label).string = '恭喜你答对了!';
                    newNode.getChildByName('content').getChildByName('message').getComponent(Label).string = 
                    '答案是:' + sCorrectAnswer;                    
                }
            });
```
## 音效播放功能实现
&emsp;&emsp;作为一个游戏来说，音效是不可或缺的元素，没有声音的游戏显得太苍白了。在Cocos Creator3.x版本中提供了AudioSource组件来实现音效的播放这与2.x版本中不一样，好在官方在demo示例中提供了完整使用案例。直接拿过来用即可。
新建audioManager.ts脚本，代码如下：
```TypeScript
 
import { _decorator, Component,AudioClip,AudioSource,assetManager,assert,warn, resources } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('audioManager')
export class audioManager extends Component {
    private static _instance: audioManager;
    private static _audioSource?: AudioSource;
 
    //单例模式 
    static get instance () {
        if (this._instance) {
            return this._instance;
        }
 
        this._instance = new audioManager();
        return this._instance;
    }
 
    soundVolume : number = 1;
 
    //初始化函数，在gameRoot调用
    init (audioSource: AudioSource) {
        audioManager._audioSource = audioSource;
    }
 
    /**
     * 播放音效
     * @param {String} name 
     */
    playSound(name: string){
        const audioSource = audioManager._audioSource!;
        assert(audioSource,'AudioSource not inited!');
 
        let path = 'sound/';
 
        resources.load(path + name,AudioClip,(err: any,audioClip: AudioClip) =>{
            if (err) {
                warn('load audioClip failed: ',err);
            }
            audioSource.playOneShot(audioClip,this.soundVolume);
        });
    }
 
    /**
     * 播放远程音效
     * @param {String} url 
     */
    playRemote(url: string){
        const audioSource = audioManager._audioSource!;
        assert(audioSource,'AudioSource not inited!'); 
        console.log(url);
        assetManager.loadRemote(url,{ext : '.mp3'},(err, audioClip : AudioClip) => {
            if (err) {
                warn('load audioClip failed: ',err);
            }
            audioSource.playOneShot(audioClip,this.soundVolume);        
        })
    }
    setSoundVolume(volume: number){
        this.soundVolume = volume;
    }
 
    openSound () {
        this.setSoundVolume(1);
    }
 
    closeSound () {
        this.setSoundVolume(0);
    }
 
    start () {
        // [3]
    }
 
    // update (deltaTime: number) {
    //     // [4]
    // }
}
```
&emsp;&emsp;audioManager.ts我是在官方提供的示例中直接复制的，只保留了我需要的playSound()函数。在此基础上新增了另外一个播放远程音效的功能playRemote。音频文件一般使用mp3格式，需要存放在resources文件夹下才能动态加载，为了便于管理，音频文件都统一存放在resources下的sound文件夹中。

&emsp;&emsp;新建gameRoot.ts脚本，挂载到gameRoot节点下。gameRoot在之前已经介绍过，作为场景下的第一个节点，在代码中注册为常驻节点并挂载AudioSource组件。代码如下：
```TypeScript
 
import { _decorator, Component, AudioSource,assert,game } from 'cc';
import { audioManager } from './audioManager';
 
const { ccclass, property } = _decorator;
 
@ccclass('gameRoot')
export class gameRoot extends Component {
 
   @property(AudioSource)
   private _audioSource: AudioSource = null;
 
 
   onLoad(): void{
       const audioSource = this.getComponent(AudioSource);
       assert(audioSource);
       this._audioSource = audioSource;
       //将gameRoot节点注册为常驻节点
       game.addPersistRootNode(this.node);
 
       audioManager.instance.init(this._audioSource);
   }
}
```
gameRoot节点下挂载audioSource组件：
<p align="center"><img src="/blogimage/wordle/5/6.png"></p>
调用方式：

```TypeScript
audioManager.instance.playSound('btn_click');
```
'btn_click'就是键盘按钮点击的音频文件，通过指定音频文件的名称就可以进行播放，很方便。
<p align="center"><img src="/blogimage/wordle/5/7.png"></p>
&emsp;&emsp;这里要注意一下，在网上搜索音频文件的时候要确认好是否有版权。不想付费的话就只能选没有版权的音频文件（知识付费的年代不好白嫖啊）。另外推荐一个免费的[压缩工具](https://www.youcompress.com/)，这个工具是网页版并且免费的，压缩比例也比较高。这个是为了后续发布出来的程序包尽量小一点，微信小游戏的发布有限制，首包只能小于4M。每一KB都要斤斤计较。
到此游戏的基本玩法功能都实现完了，调试的时候发现少了一个功能（“DEL”清除键的功能还没有实现）。清除功能也简单，就是将当前选中的“空格”中的内容清空，并切换一下背景。新建btn_backspace.ts脚本文件，代码如下：

```TypeScript
 
import { _decorator, Component,Sprite, Node, Label, Button } from 'cc';
import { audioManager } from './audioManager';
import { gamemanager } from './gamemanager';
const { ccclass, property } = _decorator;
 
@ccclass('btn_backspace')
export class btn_backspace extends Component {
    onClick () {
        audioManager.instance.playSound('btn_click');
        let layoutNode = gamemanager.instance.getCurrentLayoutNode();
        let btnNode = gamemanager.instance.getCurrentBtnNode();   
        //游戏结束时CurrentLayoutNode被置空，再次点击DEL按钮就不要操作了
        if (!layoutNode) {
            return;
        }    
        //如果当前选中的空格为空，则选最右边的空格
        if (!btnNode) {
            btnNode = layoutNode.children[layoutNode.children.length - 1];
            gamemanager.instance.setCurrentBtnNode(btnNode);
        }
        this.clearBtnNode(btnNode);
    }
 
    clearBtnNode (btnNode) {
        btnNode.getChildByName('Sprite').getComponent(Sprite).spriteFrame = 
        btnNode.getChildByName('Sprite').getComponent(Sprite).spriteAtlas.getSpriteFrame('btn_border');
        btnNode.getChildByName('Label').getComponent(Label).string = '';        
        gamemanager.instance.showBtnClearTween(btnNode);        
    }
 
}
```
将 btn_backspace.ts挂载到“DEL”按键上，并绑定onClick事件：
<p align="center"><img src="/blogimage/wordle/5/8.png"></p>
至此 游戏的基本玩法功能就已经全部实现了，赶紧试玩一下吧。

## 注意事项
&emsp;&emsp;在VS CODE中修改了代码以后，一定要切换到Cocos Creator编辑器中。此时，Cocos Creator编辑器的左下方会冒出一个小弹窗显示出哪些脚本文件被修改了，这就代表Cocos Creator重新加载了这些被修改的脚本文件。然后你在VS CODE中按F5进行调试的时候才是最新的代码，不切换一下的话你在VS CODE中修改了代码直接F5运行的话，还是运行的之前的老代码。这个坑我也是踩了好几次。

