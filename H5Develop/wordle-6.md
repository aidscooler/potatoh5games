# cocos creator实现wordle游戏（六）
&emsp;&emsp;就wordle游戏本身而言它已经完成了，但我并不打算就到此为止。“麻雀虽小五脏俱全”，从“完整”的角度来看，它还缺少一些“必不可少”的功能：如登陆，战绩，排行榜之类可以提高玩家黏度的功能。先从登陆开始，我第一时间想到的就是微信登陆。因为该游戏的目标发布平台为微信小游戏，能玩到这个游戏的玩家都是有微信账号的，玩家不需要再注册。同时我也不需要再去实现一个登陆服务了。

## 构建发布
&emsp;&emsp;实现微信登陆需要调用微信的SDK，只能在微信开发者工具中测试。所以先介绍一下如何构建发布游戏。在Cocos Creator中点击“项目”-->“构建发布”：
<p align="center"><img src="/blogimage/wordle/6/1.png"></p>
&emsp;&emsp;填写游戏名称，发布路径：默认使用build文件夹，按照此设置发布后会在你的Cocos Creator项目路径下生成一个build文件夹，打包后的文件会存放在build文件夹下的BlingWordle文件夹中。
<p align="center"><img src="/blogimage/wordle/6/2.png"></p> 
设置游戏启动图片：
<p align="center"><img src="/blogimage/wordle/6/3.png"></p>
<p align="center"><img src="/blogimage/wordle/6/4.png"></p>
&emsp;&emsp;如果不设置这个，在游戏启动时会默认加载Cocos Creator的Logo图片。官方推荐的图片尺寸是144 X 144像素。
设置微信Appid：
<p align="center"><img src="/blogimage/wordle/6/5.png"></p>

&emsp;&emsp;Appid就是你在微信公众平台上 创建的小游戏的Appid，在第一篇教程中，我们注册了微信公众平台的账号，现在需要完善你的小游戏信息。首先登陆微信公众平台：

完成基本信息设置：
<p align="center"><img src="/blogimage/wordle/6/6.png"></p>
小程序类目要填写正确：游戏-->休闲游戏 
<p align="center"><img src="/blogimage/wordle/6/7.png"></p>
&emsp;&emsp;前面的大类必须选游戏，后面根据自己的游戏类型自行选择。然后在左边的菜单中，选择最下方的“设置”，在设置页面的最下方可查看自己的Appid:
<p align="center"><img src="/blogimage/wordle/6/8.png"></p>
&emsp;&emsp;回到Cocos Creator中，配置好的构建发布信息会自动保存起来，后续不用再重复配置。你也可以针对不同项目创建不同的发布配置。
<p align="center"><img src="/blogimage/wordle/6/9.png"></p>
构建完成后，会在你的项目路径下生成一个build/BlingWordle文件夹：
<p align="center"><img src="/blogimage/wordle/6/10.png"></p>  
&emsp;&emsp;其中openDataContext是用于微信好友排行榜的，根据以上的构建发布不会产生这个文件夹。后续在介绍微信好友排行榜时再做介绍。
&emsp;&emsp;打开微信开发者工具：在微信公众平台上绑定你的微信号为管理员，然后用该微信扫描登陆
登陆微信开发者工具后，导入刚才构建发布的项目：
<p align="center"><img src="/blogimage/wordle/6/11.png"></p>
填写你的AppID:
<p align="center"><img src="/blogimage/wordle/6/12.png"></p>
点击确定以后，就可以在微信开发者工具中测试，发布小游戏了。
<p align="center"><img src="/blogimage/wordle/6/13.png"></p>
点击“上传”进行游戏发布：
<p align="center"><img src="/blogimage/wordle/6/14.png"></p>
&emsp;&emsp;上传完成以后，在微信公众平台的版本管理中就可以看到了，不过此时还处于开发版，需要提交审核，审核通过以后才能最终上线。
<p align="center"><img src="/blogimage/wordle/6/15.png"></p>
&emsp;&emsp;提交审核需要填写一大堆申请资料，按照要求一步一步填写即可，比较简单就不再介绍了就是比较繁琐。此时你可以将开发版本设置为体验版，把二维码发送给你的好友，邀请他们帮你测试。

## 微信登陆
&emsp;&emsp;总体思路就是先判断用户是否授权，已经授权就获取用户的昵称和头像进行显示。没有授权则生成一个按钮让用户点击进行授权。在resources/scripts文件夹下创建WXSDK.ts脚本文件，代码如下：
```TypeScript
import { gamemanager } from "./gamemanager";
 
export default class WXSdk {
    public static data = null;
    public static username:string = null;
    public static headUrl:string = null;
 
    public static getUserName(): string {
        if (WXSdk.data == null) {
            return '';
        }
        else {
            return WXSdk.data.userInfo.nickName;
        }
    }
 
    public static getHeadURL(): string {
        if (WXSdk.data == null) {
            return '';
        }
        else {
            return WXSdk.data.userInfo.avatarUrl;
        }
    }
 
 
    public static Login(callback): void {
        let sysInfo = wx.getSystemInfoSync();
        let width = sysInfo.screenWidth;
        let height = sysInfo.screenHeight;
        wx.getSetting({
            success(res) {
                console.log("res.authSetting:" + res.authSetting);
                if (res.authSetting["scope.userInfo"]) {
                    console.log("用户已授权");
                    wx.getUserInfo({
                        success(res) {
                            WXSdk.data = res;
                            console.log(res);
                            WXSdk.username = WXSdk.getUserName();
                            WXSdk.headUrl = WXSdk.getHeadURL();
                            gamemanager.instance.setUserInfo(WXSdk.headUrl,WXSdk.username);
                            if (callback){
                                callback(WXSdk.username,WXSdk.headUrl);
                            }
                        }
                    });
                }
                else {
                    console.log("用户未授权");
                    //用户未授权的话，全屏覆盖一个按钮，用户点击任意地方都会触发onTap()，弹出授权界面
                    let button = wx.createUserInfoButton({
                        type: 'text',
                        text: '',//不显示文字
                        style: {
                            left: 0,
                            top: 0,
                            width: width,
                            height: height,
                            lineHeight: 40,
                            backgroundColor: '#00000000',//设置按钮透明
                            color: '#ffffff',
                            textAlign: 'center',
                            fontSize: 16,
                            borderRadius: 4,
                            borderColor:'#00000000',
                            borderWidth:0
                        },
                        withCredentials:false
                    });
                    button.onTap(
                        (res) => {
                            if (res.userInfo) {
                                WXSdk.data = res;
                                console.log(res);
                                WXSdk.username = WXSdk.getUserName();
                                WXSdk.headUrl = WXSdk.getHeadURL();
                                gamemanager.instance.setUserInfo(WXSdk.headUrl,WXSdk.username);
                                if (callback){
                                    callback(WXSdk.username,WXSdk.headUrl);
                                }                                
                                button.destroy();//此时删除按钮
                            }
                            else//说明用户点击 不允许授权的按钮
                            {
                                console.log('用户拒绝授权');
                                //用户不允许授权的话不删除按钮，阻止进入游戏
                                //button.destroy();
                            }
                        }
                    );
                }
            }
        });
    }
}
```
在gamemanager中增加setUserInfo函数实现设置用户昵称，头像的功能，代码如下：
```TypeScript
    setUserInfo (url,name) {//显示用户头像和昵称
        let homeNode = gamemanager.instance.getHomeNode();
        let headNode = homeNode.getChildByPath('top/head');
        let nameNode = homeNode.getChildByPath('top/name');
 
        nameNode.getComponent(Label).string = name;
        assetManager.loadRemote(url,{ext : '.png'},function (err,asset : ImageAsset){
            if(err) {
                console.log(err);
            }
            else {
                console.log('头像下载成功');
                headNode.getChildByName('headimage').getComponent(Sprite).spriteFrame = 
                SpriteFrame.createWithImage(asset);              
            }
        });
    }
```
&emsp;&emsp;需要注意的是，获取到的头像url是没有后缀的。在使用assetManager.loadRemote进行远程加载时，需要添加图片后缀{ext : '.png'}，否则会加载失败。

最后，在homt.ts中的start()函数中调用微信登陆功能：
```TypeScript
    start () {
        let callback = (username,avatarUrl)=> {
            //回调函数，后续用于实现登陆成功后查询玩家战绩
        }
        WXSdk.Login(callback);
        this.initgame();
    }
```
&emsp;&emsp;实现的效果就是，玩家首次进入游戏后，点击任何地方就会弹出微信授权的按钮。授权以后就会显示玩家的昵称和头像。若不授权则停留在当前画面，点击任何地方后又会出现微信授权按钮。构建发布以后就可以在微信开发者工具中运行，查看效果了。

&emsp;&emsp;如果不出意外的话，在登陆以后，玩家的头像还是加载失败了。错误信息提示：“https://thirdwx.qlogo.cn不在合法域名中”，真是奇怪，微信自己存放用户头像的域名为什么不合法。经过百度以后才知道，还需要在微信公众平台中设置一下合法域名才行。在“开发管理”-->“开发设置”中，配置服务器域名：
<p align="center"><img src="/blogimage/wordle/6/16.png"></p>
&emsp;&emsp;由于是从远程下载头像图片文件，所以需要在downloadFile合法域名中配置。其他域名设置就根据自己的实际需要来配置了。比如，在实际开发中我请求了有道翻译的翻译接口，就需要在request合法域名中配置有道翻译的域名。不知道为什么微信在这方面管控的这么严格。重新构建发布以后就可以在微信开发者工具中成功实现微信登陆了。
