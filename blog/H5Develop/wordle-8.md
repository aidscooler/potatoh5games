# cocos creator实现wordle游戏（八）
此篇教程介绍如何实现排行榜功能。设计了两个排行榜：世界排行榜，好友排行榜。完成代码在此
## 世界排行榜
根据上一篇教程我们已经收集到了玩家的战绩数据，只需要按照按照胜利局数查询出来排列即可。
首先还是创建云函数来获取玩家战绩数据，创建方法参考上一篇教程。代码如下：
```TypeScript
// 云函数入口文件
const cloud = require('wx-server-sdk')
 
cloud.init()
 
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  return await db.collection('score').field({
    userName: true,
    avatarUrl: true,
    wincount: true
  }).orderBy('wincount','desc')
  .limit(event.limitnumber)
  .get({
    success: (res)=> {
      return {
        errMSG: '',
        data: res.data
      }
    },
    fail: (res)=> {
      return {
        errMsg: res.errMsg
      }
    }
  });
}
```
&emsp;&emsp;需要注意的是，微信云函数返回的数据最多返回100条，所以在limit那里你设置超过100的话就没什么作用，也只能返回100条数据。要想获取超过100条数据，就只能分多次调用然后拼接数据了。这里，主要返回了用户的头像，昵称和胜利局数。云函数创建后记得一定要部署上去。

然后在wxCloud.ts里面添加调用代码：
```TypeScript
    //获取世界排行榜
    public getWorldRank (limit: number,callback) {
        wx.cloud.callFunction({
            name:"getWorldRank",//云函数名字
            data:{
              limitnumber: limit
            },
            success: (res) => {
                callback(res.result.data);
            },
            fail: (res) => {
              console.log("请求失败！",res.result.errMsg)
            }
        })   
    }
```
制作显示页面：页面也是设计为prefab。结果如下：
<p align="center"><img src="/blogimage/wordle/8/1.png"></p>

- rank是根节点：尺寸为720 X 1280。挂载一个prefab（名称是Item，用于显示玩家的头像、昵称和胜利局数。）挂载一个widget组件（设置上下左右边距是0）。
- mask是Sptite（精灵）：尺寸720 X 1280，颜色透明度设置为0，挂载一个widget组件（上下左右边距设置为0），挂载一个button组件（不用设置点击事件）。这样设计的目的是实现一个遮罩，防止用户的点击事件穿透过去。
- content是Sprite（精灵）：尺寸640 X 1020。颜色设置为豆沙绿和游戏背景图一致。
- Layout-title是Layout组件：设置为横向布局。包含4个button组件（“世界排行榜”，“好友排行榜”，“关闭”，还有一个设置颜色透明作为占位用的）。
- friend、world都是Sprite（精灵）：尺寸640 X 960.都包含一个ScrollView组件用于显示排行榜信息。

由于玩家排行信息是一行一行显示的，所以将显示玩家信息的组件设计为prefab，用于动态加载显示：
<p align="center"><img src="/blogimage/wordle/8/2.png"></p>

- Item根节点是Sprite（精灵）
- Layout是Layout组件：尺寸640 X 100，设置为横向布局。包含rank，username,score3个Label组件用于显示玩家排名，昵称，得分。avatar是Sprite（精灵）用于显示玩家头像。

创建rank.ts脚本绑定到rank根节点，代码如下：
```TypeScript
import { _decorator, Component, Prefab, instantiate, Sprite, assetManager,ImageAsset,SpriteFrame, Label, Color, color } from 'cc';
import { wxCloud } from './wxCloud';
const { ccclass, property } = _decorator;
 
@ccclass('rank')
export class rank extends Component {
 
    @property({type: Prefab,visible: true})
    item = null;
 
    onLoad () {
        //获取世界排行榜
        let contentNode = this.node.getChildByPath('content/world/ScrollView/view/content');
        wxCloud.instance.getWorldRank(100,(res) => {
            if (res && res.length > 0) {
                for (let i = 0; i < res.length; i++){
                    let newItem = instantiate(this.item);
                    if ((i % 2) === 0) {
                        newItem.getComponent(Sprite).color = new Color(247,247,247);
                    }
                    newItem.getChildByPath('Layout/rank').getComponent(Label).string = (i + 1).toString();
                    if (typeof(res[i].avatarUrl) !== 'undefined' && res[i].avatarUrl) {
                        assetManager.loadRemote(res[i].avatarUrl,{ext : '.png'}, (err,asset : ImageAsset) =>{
                            if(err) {
                                console.log(err);
                            }
                            else {
                                //console.log('rank头像下载成功');
                                newItem.getChildByPath('Layout/avatar').getComponent(Sprite).spriteFrame = 
                                SpriteFrame.createWithImage(asset);   
                            }
                        });
                    }
                    let sname = '  ';
                    if (typeof(res[i].userName) !== 'undefined') {
                        sname += res[i].userName;
                    }
                    newItem.getChildByPath('Layout/username').getComponent(Label).string = sname;
                    newItem.getChildByPath('Layout/score').getComponent(Label).string = res[i].wincount + '局';
                    contentNode.addChild(newItem);                                                               
                }
            }
        });                
    }
 
    start () {
          
    }
 
    btnFriendClick () {
        let friendNode = this.node.getChildByPath('content/friend');
        let worldNode = this.node.getChildByPath('content/world');
        let friendBtnNode = this.node.getChildByPath('content/Layout-title/btn_friend');
        let worldBtnNode = this.node.getChildByPath('content/Layout-title/btn_world');
 
        friendNode.active = true;
        worldNode.active = false;
        friendBtnNode.getComponent(Sprite).color = new Color(199,234,204);
        worldBtnNode.getComponent(Sprite).color = new Color(255,255,255);        
      
    }
 
    btnWorldClick () {
        let friendNode = this.node.getChildByPath('content/friend');
        let worldNode = this.node.getChildByPath('content/world');
        let friendBtnNode = this.node.getChildByPath('content/Layout-title/btn_friend');
        let worldBtnNode = this.node.getChildByPath('content/Layout-title/btn_world');        
 
        worldNode.active = true;
        friendNode.active = false;
        friendBtnNode.getComponent(Sprite).color = new Color(255,255,255);
        worldBtnNode.getComponent(Sprite).color = new Color(199,234,204);           
  
    }
 
    onclose () {
        this.node.destroy();
    }
}
``` 
&emsp;&emsp;在窗体onLoad时，调用微信云函数获取排行数据，动态加载item实现世界排行榜的渲染。将 btnFriendClick函数绑定到“好友排行榜”按钮，btnWorldClick绑定到“世界排行榜”按钮，onclose绑定到“关闭”按钮。在页面设计上，好友排行榜和世界排行榜的ScrollVie组件是在同一个位置，尺寸大小一样，在点击按钮时通过设置按钮颜色和ScrollView的active属性来实现切换效果。

## 好友排行榜
&emsp;&emsp;要实现好友排行就需要将玩家的战绩数据存放到“开放数据域”，这个数据域是微信专门提供的一个独立封闭的数据域。这里暂且将项目环境称之为“主域”，好友排行榜的渲染区域称之为“子域”。“主域”不能获得“开放数据域”的数据，只能在“子域”中获取“开放数据域”里面的数据来渲染好友排行信息。在“构建发布”选项中，勾选“生成开放数据域工程模板”：
<p align="center"><img src="/blogimage/wordle/8/3.png"></p>
构建以后就会在build文件夹下看到一个openDataContext文件夹，这就是我们所说的“子域”。
<p align="center"><img src="/blogimage/wordle/8/4.png"></p>
openDataContext内容如下：
<p align="center"><img src="/blogimage/wordle/8/5.png"></p>
index.js是“子域”入口，主要作用是获取“主域”传递的消息，来进行相应的操作。
render目录结构如下：
<p align="center"><img src="/blogimage/wordle/8/6.png"></p>
dataDemo.js用于获取数据，style.js和template.js是样式和渲染模板文件。 

&emsp;&emsp;“子域”是一个独立封闭的区域，“主域”只能给“子域”发送消息而“子域”不能给“主域”发送消息。所以好友排行榜的实现过程就是在“主域”发送消息给“子域”，让“子域”去“开放数据域”获取好友信息并且渲染出来。由于“子域”是独立封闭的，所以它无法使用“主域”中的任何东西。看上去比较复杂，但实际上Cocos creator已经将这些后台处理的东西都封装好了，我们只需要做一些配置即可。

首先就是需要将玩家的胜利局数存放到“开放数据域”，在游戏结束时调用对应的API即可，在wxCloud中添加API调用的封装，代码如下：
```TypeScript
    //保存玩家得分
    public setNewCloudScore(newKVData) {
        wx.setUserCloudStorage({
            KVDataList: [newKVData],
            success: (res) => {
                console.log('update score success!');
            },
            fail: (res) => {
                console.log(res);
            }
        });
    }
```
在gamemanager的setScore函数中增加如下代码：
```TypeScript
        //将得分保存在微信开放区域，供好友排行榜显示  
        let newKVData = { key: 'score', value: score.wincount.toString() }
        wxCloud.instance.setNewCloudScore(newKVData);  
```
然后修改openDataContext/render下的dataDemo.js文件，代码如下：
```TypeScript
let dataDemo = {
    data: [
        /*
        {
            rankScore: 0,
            avatarUrl: '',
            nickname: '',
        },
        */
    ],
};
 
export let rankData = {
    data: [
        /*
        {
            rankScore: 0,
            avatarUrl: '',
            nickname: '',
        },
        */
    ],    
}
 
export function getFriendCloudStorage(callback) {
    rankData.data.splice(0,rankData.data.length);//清空数组
    wx.getFriendCloudStorage({
        keyList: ['score'],
        success: (res) => {
            for (let i = 0; i < res.data.length; i++) {
                let item = {};
                item.rankScore = res.data[i].KVDataList[0]['value'];
                item.avatarUrl = res.data[i].avatarUrl;
                item.nickname = res.data[i].nickname;
                rankData.data.push(item);
            }
            rankData.data.sort((a, b) => b.rankScore - a.rankScore);   
            callback && callback();
        },
        fail: (res) => {
            console.log("getFriendData fail--------", res);
            callback && callback(res.data);                
        }
    });
}
 
export default dataDemo;
```
&emsp;&emsp;在默认生成好的代码上，稍作修改，将获取的字段修改为我们需要的得分，玩家昵称，头像。并且传入一个回调函数callback，用于在数据加载完毕以后再渲染。

修改openDataContext下的index.js，代码如下：
```TypeScript
import style from './render/style'
import {anonymous} from './render/template'
import Layout from './engine'
import {rankData,getFriendCloudStorage} from './render/dataDemo'
 
let __env = GameGlobal.wx || GameGlobal.tt || GameGlobal.swan;
let sharedCanvas  = __env.getSharedCanvas();
let sharedContext = sharedCanvas.getContext('2d');
function draw() {
    Layout.clear();
    Layout.init(anonymous(rankData), style);
    Layout.layout(sharedContext);
}
 
function updateViewPort(data) { 
    Layout.updateViewPort({
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
    });
}
 
__env.onMessage(data => {
    //clearInterval(danmuInterval);
    if ( data.type === 'engine' && data.event === 'viewport' ) {
        updateViewPort(data);
    }
    else if (data.value === 'rankData') {
        getFriendCloudStorage(draw);
    }
});
```
&emsp;&emsp;在onMessage函数中，“子域”在收到'rankData'消息时，调用getFriendCloudStorage获取好友信息，并把渲染函数作为回调函数传递给它，确保在数据获取完之后再渲染排行界面。

在rank.ts的onLoad中发送消息给“子域”，让“子域”渲染好友排行数据：
```TypeScript
        /*
        * 向开放数据域发送消息，渲染好友排行榜
        */
        wx.getOpenDataContext().postMessage({
            value: 'rankData',
        });  
```
最后，在Cocos creator层级管理器中为friend节点的下的ScrollView的content节点添加一个Sprite（精灵）
<p align="center"><img src="/blogimage/wordle/8/7.png"></p>
设置Sprite的尺寸为640 x 960，然后挂载一个SubContextView组件。这个组件将显示“子域”渲染的内容。至此，微信好友排行榜就算制作完成了。