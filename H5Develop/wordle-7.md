# cocos creator实现wordle游戏（七）
&emsp;&emsp;这篇接着实现玩家战绩统计功能，使用了微信云数据库（主要是图方便和便宜）。微信云数据库本质上来说算是MongoDB数据库，是一种非关系型数据库。打开微信开发者工具，登陆以后点击云开发：
<p align="center"><img src="/blogimage/wordle/7/1.png"></p>

## 微信云数据库
&emsp;&emsp;在“云开发”首页会显示“云函数”，“云数据库”等相关云资源的使用情况。右上角有一个“环境ID”，开发时会用到。点击“数据库”：
<p align="center"><img src="/blogimage/wordle/7/2.png"></p>
在“数据库”页面就可以进行数据库的创建等操作了：
<p align="center"><img src="/blogimage/wordle/7/3.png"></p>

这里简单介绍一下云数据库的几个基本概念：
- 集合：可以理解为就是一张“表”，对应关系型数据库中的Table。
- 记录：可以理解为“行”，对应关系型数据库中的Row。
- 字段：这个和关系型数据库中的Field一样。
&emsp;&emsp;在“集合名称”那里点击“+”创建一个“score”集合用于存放玩家的战绩信息，字段可以不用先定义只需要在添加记录的时候把需要的字段传进去就行了（这一点和sqlserver、mysql等关系型数据库不一样）。通过调用微信云数据库API添加的记录会默认生成“_id”，“_openid”两个字段，这两个字段我们不需要维护，也不允许维护。

## 玩家战绩设计
&emsp;&emsp;根据游戏特点，除了基本的“总局数”，“胜利局数”，“当前连胜”，“最大连胜”以外再额外添加了每一步猜中的局数。新建userScore.ts，代码如下：
```TypeScript
export class userScore {
    public static _id = '1';
    public static _openid = '1';
    public static userName = '';//用户名称
    public static avatarUrl = '';//用户头像Url
    public static totalcount = 0; //总局数
    public static wincount = 0;//胜利局数
    public static step1 = 0;//第一步猜中局数
    public static step2 = 0;//第二步猜中局数
    public static step3 = 0;//第三步猜中局数
    public static step4 = 0;//第四步猜中局数
    public static step5 = 0;//第五步猜中局数
    public static step6 = 0;//第六步猜中局数
    public static cstraitwin = 0;//当前连胜
    public static mstraightwin = 0; //最大连胜
 
    public static setScore (data:any){
        if(!data){
            return;
        }
        
        if (typeof(data._id) !== 'undefined') {
            console.log('setScore data._id:' + data._id);
            this._id = data._id;
        }
        if (typeof(data._openid) !== 'undefined') {
            console.log('setScore data._openid:' + data._openid);
            this._openid = data._openid;
        }
        this.userName = data.userName;
        this.avatarUrl = data.avatarUrl;
        this.totalcount = data.totalcount;
        this.wincount = data.wincount;
        this.step1 = data.step1;
        this.step2 = data.step2;
        this.step3 = data.step3;
        this.step4 = data.step4;
        this.step5 = data.step5;
        this.step6 = data.step6;
        this.cstraitwin = data.cstraitwin;
        this.mstraightwin = data.mstraightwin;
    }
 
    public static toData(): any{
        var data = {
            userName : this.userName,
            avatarUrl : this.avatarUrl,            
            totalcount : this.totalcount,
            wincount : this.wincount,
            step1 : this.step1,
            step2 : this.step2,
            step3 : this.step3,
            step4 : this.step4,
            step5 : this.step5,
            step6 : this.step6,
            cstraitwin : this.cstraitwin,
            mstraightwin : this.mstraightwin            
        }
        return data;
    }
}
```
&emsp;&emsp;因为在更新数据时，默认创建的“_id”，“_openid”两个字段不能操作。而更新数据需要用到“_id”字段，所以额外新增一个toData函数，生成需要更新的数据并把“_id”，“_openid”去掉。

## 微信云API调用封装
新建wxCloud.ts，代码如下：
```TypeScript
import { _decorator} from 'cc';
import { userScore } from './userScore';
const { ccclass, property } = _decorator;
 
@ccclass('wxCloud')
export class wxCloud {//微信云api封装
    private static _instance = null;
 
    static get instance (){
        if (!this._instance) {
            this._instance = new wxCloud();
        }
        return this._instance;
    }
 
    constructor () {
        //微信云初始化
        wx.cloud.init({
            traceUser: true,
            env: 'cloud1-微信开发者工具中查看自己的ID'
        });
    }
    //获取openID
    public getUserOpenID(callback){
        wx.cloud.callFunction({
            name: 'getOpenID',
            complete: (res) => {
                callback(res.result.openid);
            }
        });
    }
    //获取分数
    public getUserScore(openid,callback){
        const db = wx.cloud.database();
        db.collection('score').where({
            _openid: openid
        }).get({
            success: (res) => {
                //console.log('getUserScore res:' + res);
                //console.log('getUserScore res.errMsg:' + res.errMsg);
                //console.log('getUserScore res.data:' + res.data);//若没有该记录则res.data是空数组
                //console.log('getUserScore res.data[0]:' + res.data[0]); data是一个对象数组,data[0]是对象
                if(res.errMsg === 'collection.get:ok'){
                    callback(res.data[0]);
                }
                else{
                    callback(null);
                }
            },
            fail : ()=> {
                callback(null);
            }
        })
    }
 
    //设置分数
    public setUserScore(option, cb){
        wxCloud.instance.getUserScore(userScore._openid,(res)=>{
            if(res ){
                this.updateUserCloudData(option,cb);
            }
            else {//没有则添加
                this.addUserCloudData(option,cb);
            }
        })
    }
 
    //新增分数记录
    public addUserCloudData (option, cb) {
        const db = wx.cloud.database();
        db.collection('score').add({
            data: option,
            success: (res) => {
                option._id = res._id;
                cb(option);
            },
            fail: (res) => {
                console.log('add fail:' + res.errMsg);
            }
        })
    }
 
	//更新分数记录
    public updateUserCloudData (option, cb) {
        const db = wx.cloud.database();
        db.collection('score').doc(userScore._id).update({
            data : option,
            success: (res) => {
                cb(option);
            },
            fail:(res) =>{
                console.log('update fail:' + res.errMsg);
            }
        })
    }
 
}
```
&emsp;&emsp;在调用微信云API时，需要先初始化一下。其实也就是把你的云ID设置一下，为了防止重复初始化将该类设计为单例模式。需要注意的是云ID要包括前面“cloud1-”才算是完整的ID，这个坑也是踩的郁闷。另外就是，getUserOpendID是调用云函数来获取用户的openID，在游戏开始前需要先根据用户的openID查询玩家的战绩数据。这里再介绍一下云函数的创建，在微信开发者工具中创建一个“cloudfunctions”文件夹，如下图所示：
<p align="center"><img src="/blogimage/wordle/7/4.png"></p>
&emsp;&emsp;然后在project.config.json中配置云函数的路径为刚刚新建的“cloudfunctions”文件夹：
<p align="center"><img src="/blogimage/wordle/7/5.png"></p>
&emsp;&emsp;此时可以看到 “cloudfunctions”文件夹已经变成黄色，并且有了云朵的图案了。右键创建云函数：
<p align="center"><img src="/blogimage/wordle/7/6.png"></p>
&emsp;&emsp;输入云函数名称“getOpenID”，点击回车就创建好了。云函数的入口也默认生成好了，如下图所示：
<p align="center"><img src="/blogimage/wordle/7/7.png"></p>
&emsp;&emsp;这个函数只用于获取用户的OpenID，其余不需要。在return里面只保留openid即可。然后右键点击getOpenID文件夹，选择“上传并部署：云端安装依赖”：
<p align="center"><img src="/blogimage/wordle/7/8.png"></p>
&emsp;&emsp;云函数部署好以后本地就不需要了，后续打包不用将cloudfunctions文件夹打包进去。在客户端的调用方式可以参考上面创建的wxCloud.ts中的getUserOpenID函数。

## 初始化玩家战绩
在gamemanager中新增initScore用于初始化玩家战绩，代码如下：
```TypeScript
    initScore(sopenid,username,avatarUrl){
        wxCloud.instance.getUserScore(sopenid,function(res){           
            if(res){//如果根据openid能查询到数据则表示是老用户
                if(!res.userName) {//此处是处理旧数据，新版本增加userName,avatarUrl字段
                    res.userName = username;
                }
                if(!res.avatarUrl) {
                    res.avatarUrl = avatarUrl;
                }
                userScore.setScore(res);                
            }
            else {//用户第一次使用时数据库中没有openid 这里从云函数中获取的
                userScore._openid = sopenid;
                userScore.userName = username;
                userScore.avatarUrl = avatarUrl;                
            }
        });  
    }
```
&emsp;&emsp;在home.ts的start()函数中新增一个回调函数，调用gamemanager中的玩家战绩初始化函数。将回调函数传递给微信登陆函数，实现玩家登陆后获取战绩数据。代码如下：
```TypeScript
    start () {
        let callback = (username,avatarUrl)=> {
            //初始化用户openid
            let sopenid = localStorage.getItem('openid');
            if (!sopenid) {//本地没有openid再到微信云取
                wxCloud.instance.getUserOpenID(function(openid){
                    localStorage.setItem('openid',openid);  
                    gamemanager.instance.initScore(openid,username,avatarUrl);                       
                });
            }
            else {
                //初始化玩家分数        
                gamemanager.instance.initScore(sopenid,username,avatarUrl);               
            }
        }
        WXSdk.Login(callback);
        this.initgame();
    }
```
&emsp;&emsp;微信云开发的免费配额有限（具体配额信息可以在微信开发者工具查看），在调用云函数获取到openID后，通过localStorage.setItem将openID保存在本地。每次玩家登陆以后，通过localStorage.getItem判断本地是否有openID，如果没有才去调用云函数获取，尽量节约资源。

## 游戏结束时计算得分
在gamemanager中创建setScore函数用于计算玩家得分，代码如下：
```TypeScript
    setScore(type,step){
        let score = userScore.toData();
        score.totalcount++;
        if (type === 'win'){
            score.wincount++;
            score.cstraitwin++;
            if(score.cstraitwin > score.mstraightwin) {
                score.mstraightwin = score.cstraitwin;
            }
            switch (step){
                case 1 : score.step1++; break;
                case 2 : score.step2++; break;
                case 3 : score.step3++; break;
                case 4 : score.step4++; break;
                case 5 : score.step5++; break;
                case 6 : score.step6++; break;
            }
        }
        else {//若输了，当前连胜清零
            score.cstraitwin = 0;
        }
        let cb = (option)=>{          
            userScore.setScore(option);          
        }
        //将分数保存在微信云数据库
        wxCloud.instance.setUserScore(score,cb); 
    }
```
通过userScore.toData获取到需要更新的字段信息，根据玩家本局游戏输赢来计算得分信息。
计算逻辑也很简单：
- 无论输赢，游戏总局数都+1
- 如果赢了则胜利局数+1，当前连胜局数+1，在第几步赢的局数+1，如果当前连胜局数大于最大连胜局数，则将当前连胜局数赋值给最大连胜局数。
- 如果输了，则将当前连胜清零。
将得分信息保存到云数据库以后，再调用回调函数将得分信息更新到本地。
在home.ts中的processAnswer函数，根据玩家输赢情况来调用：
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
            //更新战绩
            let schar = Util.getLastChar(layoutNode_middle.name);
            gamemanager.instance.setScore('win',parseInt(schar));       
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
                gamemanager.instance.setScore('loose',null);
                this.readyToNext();                
            }
        }
    }
```
游戏结束时，获取当前laytout_middle节点的名称最后一位序号来判断是在第几步赢的。

## 制作显示战绩的页面
&emsp;&emsp;将页面也设计为一个prefab，页面布局主要还是通过Layout实现。具体布局方法可参考教程三中游戏主界面的布局方法，这里就不再累述主要介绍一下UI设计。结构如下：
<p align="center"><img src="/blogimage/wordle/7/9.png"></p>

- 根节点statistic为Sprite（精灵）：尺寸为720 x 1280和游戏设计大小一致。背景颜色设置为豆沙绿和游戏主界面的背景颜色一致。挂载widget组件，设置上下左右边距为0，这样能确保页面显示时能覆盖整个游戏区域。绑定statistic.ts脚本文件，实现战绩显示等相关功能。
- Label为标题。
- Layout-title为Layout组件：设置为横向排列，包含4个Label组件，分别设置内容为“总局数”，“胜利局数”，“当前连胜”，“最大连胜”。
- Layout-content为Layout组件：设置为横向排列，尺寸设置和Layout-title一致。包含4个Label组件，分别显示玩家的总局数，胜利局数，当前连胜，最大连胜。

Layout-title和Layout-content的横向间距需要设置为一样，他们的子节点大小要保持一致，这样一来在界面上就能一一对应上。
- Label-001为Label组件。
- Layout-Graphic为Layout组件：设置为横向排列，尺寸为610 X 400。它的子节点如下：
<p align="center"><img src="/blogimage/wordle/7/10.png"></p>
&emsp;&emsp;Layout-column为Layout组件：设置为纵向排列。包含6个Label组件，分别设置显示内容“第一步”，“第二步”，“第三步”，“第四步”，“第五步”，“第六步”。

&emsp;&emsp;Graphics为Graphics组件：用于画柱状图，尺寸为500 x 400。为了方便计算柱状图的下标起始位置，需要将它的锚点设置为（0,0）。

&emsp;&emsp;Layout-step为Layout组件：设置为纵向排列。包含6个Label组件，用于显示第几步胜利的局数。

&emsp;&emsp;Layout-column和Layout-step的纵向间距需要设置一样，他们的子节点Label组件的高度也需要设置一样，这样就能保证能够对齐了。

&emsp;&emsp;Layout-column，Layout-Graphics，Graphics的宽度之和要等于它们的父节点Layout-Graphic的宽度。

- Layout-buttom为Layout组件：设置为横向排列。包含“确定”，“炫耀一下”两个Button组件。

## 战绩功能实现
statistic.ts脚本文件需要绑定到根节点statistic。代码如下：
```TypeScript 
import { _decorator, Component, Node, Label, Graphics, UITransform } from 'cc';
import { userScore } from './userScore';
const { ccclass, property } = _decorator;
@ccclass('statistic')
export class statistic extends Component {
    start () {
        this.setScore();
    }
 
    onClick(){
        this.node.destroy();
    }
 
    setScore(){
        let score = userScore.toData();
        let max = 0;
        for (let k in score) {
           if ((max < score[k]) && (['step1','step2','step3','step4','step5','step6'].indexOf(k) > -1 )) {
               max = score[k];
           }
        }
        this.node.getChildByPath('Layout-content/totalcount').getComponent(Label).string = score.totalcount.toString();
        this.node.getChildByPath('Layout-content/wincount').getComponent(Label).string = score.wincount.toString();
        this.node.getChildByPath('Layout-content/cstraight').getComponent(Label).string = score.cstraitwin.toString();
        this.node.getChildByPath('Layout-content/mstraight').getComponent(Label).string = score.mstraightwin.toString();
        this.node.getChildByPath('Layout-graphic/Layout-step/step1').getComponent(Label).string = score.step1.toString();
        this.node.getChildByPath('Layout-graphic/Layout-step/step2').getComponent(Label).string = score.step2.toString();
        this.node.getChildByPath('Layout-graphic/Layout-step/step3').getComponent(Label).string = score.step3.toString();
        this.node.getChildByPath('Layout-graphic/Layout-step/step4').getComponent(Label).string = score.step4.toString();
        this.node.getChildByPath('Layout-graphic/Layout-step/step5').getComponent(Label).string = score.step5.toString();
        this.node.getChildByPath('Layout-graphic/Layout-step/step6').getComponent(Label).string = score.step6.toString();
        let gNode = this.node.getChildByPath('Layout-graphic/Graphics');
        let gUI = gNode.getComponent(UITransform);
        let g = gNode.getComponent(Graphics);
        g.fillRect(0,350,this.calcwidth(score.step1,max,gUI.contentSize.width),50);
        g.fillRect(0,280,this.calcwidth(score.step2,max,gUI.contentSize.width),50);
        g.fillRect(0,210,this.calcwidth(score.step3,max,gUI.contentSize.width),50);
        g.fillRect(0,140,this.calcwidth(score.step4,max,gUI.contentSize.width),50);
        g.fillRect(0,70,this.calcwidth(score.step5,max,gUI.contentSize.width),50);
        g.fillRect(0,0,this.calcwidth(score.step6,max,gUI.contentSize.width),50);        
    }
 
    calcwidth (step,total,uiwidth): number{
        if (total === 0){
            return 0;
        }
        else {
            return step / total * uiwidth; 
        }
    };
 
    share(){
        wx.shareAppMessage({
            title: '6次机会猜中一个单词，你行吗？'          
        })
    }
 
}
```
&emsp;&emsp;onClick函数绑定到“确定”按钮上，share()函数绑定到“炫耀一下”按钮上。wx为微信api，通过调用shareAppMessage实现分享功能。需要注意的是，在微信开发者工具中调用分享功能时，显示的都是测试群，游戏发布后分享功能正常使用。
&emsp;&emsp;调用Graphics组件的fillRect来绘制柱状图：fillRect(0,0,100,50) 表示在Graphics组件的(0,0)坐标开始，绘制一个宽100，高50的矩形。绘制的颜色在“属性检查器”中Fillcolor中设置，也可以在代码中动态调整。在本游戏中，柱状图是横向的，所以绘制的高度固定为50。该高度是和左边“第n步”Label的高度一致。宽度是根据6步中猜中局数的比例来动态设定，设定逻辑参见calcwidth函数，根据每一步猜中的局数和6步中猜中局数的最大值相除得到一个比例，再根据这个比例计算宽度。
