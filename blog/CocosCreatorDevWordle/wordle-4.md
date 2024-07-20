# cocos creator实现wordle游戏（四）
## 游戏流程分析
- 游戏中需要玩家输入一个5个字母的单词，一个“空格”里面输入一个字母。输入完成后点击“ENTER”键进行提交。
- 根据游戏规则校验玩家提交的单词。
- 若猜中单词则结束游戏，若未猜中单词则在下一排继续输入单词。
- 重复1,2,3步骤，若6次机会用完还没猜中即输了。

## 基础功能分析
- “空格”选中效果：这里说的“空格”就是上一篇中制作的prefab（btn_middle），在cocos creator编辑器中已经将btn_middle的背景（子节点Sprite）设置为一个灰色边框，当玩家选中这个btn_middle可以将其背景设置为一个黑色的边框以表示选中状态，或者高级一点实现一个动画。
- gamemanager中需要增加CurrentLayoutNode，CurrentBtnNode，用来记录当前在第几排（前面在布局中使用了6个Layout组件来实现6排输入区域），当前选中的btn_middle。
- 输入效果：玩家点击下方的键盘按钮，在当前选中的btn_middle中设置被点击的键盘按钮的内容。
- 玩家点击“ENTER”提交动画效果：根据游戏规则判断用户猜测的单词，变换btn_middle的背景并实现翻转动画。

## 创建控制节点
在gamemanager中添加currentLayoutNode和currentBtnNode属性。代码如下：
```TypeScript
    private static _currentLayoutNode : Node;
    private static _currentBtnNode : Node;
 
 
    setCurrentLayoutNode (aNode) {
        gamemanager._currentLayoutNode = aNode;
    }
 
    getCurrentLayoutNode () {
        return gamemanager._currentLayoutNode;
    }
 
    setCurrentBtnNode(aNode) {
        gamemanager._currentBtnNode = aNode;
    }
 
    getCurrentBtnNode () {
        return gamemanager._currentBtnNode;
    }
```
## btn_middle动画效果实现
- 在cocos creator的资源管理器中新建btn_middle.ts脚本文件，然后双击打开该脚本文件，删除默认的注释代码，实现选中，输入，清空，翻转动画。
- 使用cocos creator提供的缓动组件tween来实现动画效果。
- 选中动画：玩家选中某个btn_middle后，可以简单的将该btn_middle的浅色背景框替换成深色的背景框来实现选中效果，为了使得游戏更生动所以改为实现一个动画效果。实现的效果就是让btn_middle“抖动”一下，再闪烁几下。实现代码如下：

```TypeScript
    //抖动动画
    tween(this.node)
    .to(0.05,{scale : new Vec3(1.03,1.03,1)},{easing : 'backOut'})
    .to(0.05,{scale : new Vec3(1,1,1)})       
    .union()
    .repeat(2)
    //闪烁动画
    let spriteNode = this.node.getChildByName('Sprite');
    tween(spriteNode.getComponent(UIOpacity))
    .to(0.5,{opacity : 100})
    .to(0.5,{opacity : 255})
    .to(0.5,{opacity : 100})
    .union()
```
&emsp;&emsp;这里简单介绍一下tween缓动组建的使用，tween缓动组件需要传递一个节点，并且可以在设置的时间内，改变传入节点的属性从而达到动画的效果。以上面的代码为例，btn_middle.ts脚本文件挂载到btn_middle这个prefab上，当btn_middle被加载的时候，btn_middle.ts中的类也被实例化了，此时类中的this.node就是指该btn_middle节点。所以tween(this.node)表示在btn_middle节点上的动画，.to(0.05,{scale : new Vec3(1.03,1.03,1)},{easing : 'backOut'}) 表示在0.05秒内，将节点的scale属性变化到1.03,1.03,1，scale属性在属性检查器中如下：
<p align="center"><img src="/blogimage/wordle/4/1.png"></p>
&emsp;&emsp;scale可以理解为大小，默认为Vec3(1,1,1)也就是原始大小，x代表横轴上的变化，y代表纵轴上的变化，在2d游戏中可以不考虑Z。可以手动设置x,y,z的大小来观察组件在场景编辑器中的变化从而确定在代码中要实现的效果。
{easing : 'backOut'} 代表在大小变化完成时的一个修饰，为了让动画更“圆润”一点，这个设置代表大小变化完了之后有个快速收缩并复原的效果。
所以.to(0.05,{scale : new Vec3(1.03,1.03,1)},{easing : 'backOut'}) 是实现了在0.05秒将节点增大3%,并且完成时有个收缩并复原的效果。
同理： .to(0.05,{scale : new Vec3(1,1,1)}) 实现了在0.05秒内将节点大小还原的效果。
.union() 表示将这两个动作联合在一起，
.repeat(2)代表执行两次。
所以结合起来的效果就是btn_middle节点在0.1秒内变大3%又变回去，执行了两次。看上去就是“抖动”了一下。tween缓动组件基本上可以实现传入节点的任意属性的改变，以上图为例，若要改变btn_middle的位置，就在.to中设置position属性即可。

## 闪烁动画的实现
通过改变sprite的透明度来达到视觉上的闪烁效果。
由于node节点的属性只有上图中的4个，所以要实现透明度的改变则需要在sprite节点上挂载UIOpacity组件，如下图所示：
<p align="center"><img src="/blogimage/wordle/4/2.png"></p>

```TypeScript
  // 通过getChildByName()获取btn_middle节点下的Sprite子节点。
  let spriteNode = this.node.getChildByName('Sprite');
  tween(spriteNode.getComponent(UIOpacity))    //在tween中传入sptite节点的UIOpacity组件，就可以实现 Opacity属性的变化了。    
  .to(0.5,{opacity : 100}) //0代表完全透明。
  .to(0.5,{opacity : 255})//Opacity默认255代表不透明
  .to(0.5,{opacity : 100})
  .union()，
```
以上代码实现了，在0.5秒内将透明度变化到100，又在0.5秒内将透明度变化到255，最后在0.5秒内变化到100。tween还有另外一种改变属性的方式：.by。与.to的不同之处在于.by是在原有基础上改变，.to是改变到目标值。用.by的方式实现以上效果，代码如下：

```TypeScript
  tween(spriteNode.getComponent(UIOpacity))
    .by(0.5,{opacity : -155})//在初始值255上减155 变化为100
    .by(0.5,{opacity : 155})//在100的基础上加155 变化为255
    .by(0.5,{opacity : -155})//在255基础上减155变化为100
    .union()
```
在实践过程中我比较倾向于使用.to的方式，因为使用.by方式不太容易看懂变化后的目标属性值，需要计算一下。其次就是在选中动画中，变大和变小结合起来执行时，只要手速很快的去点击，就会出现偶尔无法变小回去的bug。快速的点击一段时间后，节点就会慢慢的变大，变不回去了。使用.to的方式就没有这个问题了。

由于typescripte脚本语言是异步执行的，tween还提供了一个.call功能来实现在动画结束后执行回调函数的效果。如下所示：

```TypeScript
        let spriteNode = this.node.getChildByName('Sprite');
        tween(spriteNode.getComponent(UIOpacity))
        .to(0.5,{opacity : 100})
        .to(0.5,{opacity : 255})
        .to(0.5,{opacity : 100})
        .union()
        .call(function () {
            spriteNode.getComponent(UIOpacity).opacity = 255;
            let spriteName = spriteNode.getComponent(Sprite).spriteFrame.name;
            if(self.node.getChildByName('Label').getComponent(Label).string) {
                spriteNode.getComponent(Sprite).spriteFrame = 
    spriteNode.getComponent(Sprite).spriteAtlas.getSpriteFrame('btn_border_black'); 
            }
            else {
                spriteNode.getComponent(Sprite).spriteFrame = 
    spriteNode.getComponent(Sprite).spriteAtlas.getSpriteFrame('btn_border');
            } 
        });
```
&emsp;&emsp;在“闪烁”动画结束时，通过.call来调用了一个匿名函数，将sprite节点的透明度还原为默认值，同时根据Label是否有值来更换sprite的背景图，如果Label中有值了代表玩家输入了字母，此时sprite背景图应该为黑色的边框。若果Label中没有值，sprite的背景图就应该为灰色的边框。其中sprite组件的spriteAtlase属性就是在属性检查器中“SpriteAtlas”属性加载.plist文件，里面打包了btn_middle节点所用到的所有背景图，在代码中就可以很方便的使用图片名称来获取图片，从而实现背景图的切换。值得注意的是，在这个匿名函数无法访问到this，所以在调用该函数前需要将 this赋值给一个变量，一般取名为self（let self = this;）在匿名函数中使用 self.node 和在匿名函数外部使用 this.node效果一样。

输入动画：设计为“抖动”一次。

清空动画：设计为“抖动”一次。

代码如下：
```TypeScript
        //输入动画
        tween(this.node)
        .to(0.1,{scale : new Vec3(1.05,1.05,1)},{easing : 'backOut'})
        .to(0.1,{scale : new Vec3(1,1,1)})
        .union();
        //清空动画
        tween(this.node)
        .to(0.1,{scale : new Vec3(0.95,0.95,1)},{easing : 'backIn'})
        .to(0.1,{scale : new Vec3(1,1,1)})
        .union();
```
翻转动画：利用节点的Rotation属性实现翻转，分三步实现。
<p align="center"><img src="/blogimage/wordle/4/3.png"></p>
&emsp;&emsp;X代表沿X轴旋转，也就是本游戏的旋转效果。Y代表沿Y轴旋转，效果就像开关门。Z代表沿Z轴旋转，在2d游戏中，Z轴是垂直与屏幕的。旋转的效果就像在平面内原地转圈。 

- 沿X轴旋转90°
```TypeScript
    tween(this.node)
    .to(0.1,{eulerAngles : new Vec3(90,0,0)});
```
&emsp;&emsp;Rotation属性在代码中使用的欧拉坐标，用eulerAngles表示。旋转90°后，此时btn_middle和屏幕垂直，从玩家的视觉角度是看不见它的或者只能看见一条线。在此时可以利用.call来实现btn_middle背景的变换（根据玩家猜测的字母是否正确切换为对应的背景图）。
- 再旋转180°也就是到达270°
```TypeScript
        //旋转动画2
        tween(this.node)
        .to(0.2,{eulerAngles : new Vec3(270,0,0)})
        .call(function () {
            //sprite遮住label后 转完180度，调换sprite和label层级
            let indexSprite = self.node.getChildByName('Sprite').getSiblingIndex();
            let indexLabel = self.node.getChildByName('Label').getSiblingIndex();
            if (indexSprite > indexLabel) {
                //如果Sprite 的层级大于于 Label的层级则需要调换，让label在sprite前面，以显示字体
                self.node.getChildByName('Sprite').setSiblingIndex(indexLabel);
                self.node.getChildByName('Label').setSiblingIndex(indexSprite);
            }           
            //最后转回来
            self.tweenObjRotate3.start();           
        });   
        //翻动动画3
        this.tweenObjRotate3 = tween(this.node)
        .to(0.1,{eulerAngles : new Vec3(360,0,0)})
        .call(function () {
            self.node.eulerAngles = new Vec3(0,0,0);
        });     
```
当旋转到270°位置时，此时btn_middle依然和屏幕垂直，用户不可见。此时就需要调整一下Label和Sprite的层级关系，要让label在Sprite上才能显示出Label得内容。
- 最后再旋转90°到达360°。也就是转了一圈。转完了再将Ratation属性还原即可。
&emsp;&emsp;之所以这样设计是因为，如果单纯旋转360°的话，会出现一些偶然的bug，就是Sprite和Label的层级会错位。Label和Sprite的初始层级位置是固定的，旋转次数多了以后，偶尔会出现Label的层级在Sprite的层级下面，也就是旋转完了之后Sprite遮住了Label，经过多次测试以后最终确定在旋转到270°的时候动态判断一下Label和Sprite的层级，确保Label的层级始终在Sprite之上。这样才算解决了这个bug。

以上代码只是实现了相应的动画效果，对于在游戏中调用来说，还需要完成以下步骤：
- 由于tween函数会返回一个缓动对象，如果在游戏中直接调用的话会一直产生的缓动对象，我不清楚typeScripte是否会像Java一样有垃圾回收机制。所以，在btn_middle加载的时候就预先初始好缓动对象，后续在游戏中直接调用.start()即可，确保不会产生过多对象垃圾。
- 旋转动画使用了3个缓动对象，封装在一个函数runRotation里面方面调用。
- 创建click函数，实现动画启动。即调用tween对象的.start()方法。此方法是挂载到btn_middle的按钮点击事件上。
最终代码如下：
```TypeScript
 
import { _decorator, Component,Vec3, Sprite,tween, UIOpacity, Label, color } from 'cc';
import { gamemanager } from './gamemanager';
const { ccclass ,property} = _decorator;
 
 
@ccclass('btn_middle')
export class btn_middle extends Component {
 
    public tweenObjOpacity = null;//“空格”背景透明动画
    public tweenObjNode = null;  //“空格”抖动动画
    public tweenObjLabelInput = null;//“空格”输入动画
    public tweenObjClear = null;//“空格”清空动画
    public tweenObjRotate = null;//“空格”翻转动画1
    public tweenObjRotate2 = null;//“空格”翻转动画2
    public tweenObjRotate3 = null;//“空格”翻转动画3
    
    onLoad () {
        this.initTween ();
    }
 
    initTween () {//定义动画
        let self = this;
        //选中动画1
        this.tweenObjNode = tween(this.node)
        .to(0.05,{scale : new Vec3(1.03,1.03,1)},{easing : 'backOut'})
        .to(0.05,{scale : new Vec3(1,1,1)})       
        .union()
        .repeat(2)
        .call(function() {
            self.tweenObjOpacity.start();          
        });
        //选中动画2
        let spriteNode = this.node.getChildByName('Sprite');
        this.tweenObjOpacity = tween(spriteNode.getComponent(UIOpacity))
        .to(0.5,{opacity : 100})
        .to(0.5,{opacity : 255})
        .to(0.5,{opacity : 100})
        .union()
        .call(function () {
            spriteNode.getComponent(UIOpacity).opacity = 255;
            let spriteName = spriteNode.getComponent(Sprite).spriteFrame.name;
            if(self.node.getChildByName('Label').getComponent(Label).string) {
                spriteNode.getComponent(Sprite).spriteFrame = spriteNode.getComponent(Sprite).spriteAtlas.getSpriteFrame('btn_border_black'); 
            }
            else {
                spriteNode.getComponent(Sprite).spriteFrame = spriteNode.getComponent(Sprite).spriteAtlas.getSpriteFrame('btn_border');
            } 
        });    
        //输入动画
        this.tweenObjLabelInput = tween(this.node)
        .to(0.1,{scale : new Vec3(1.05,1.05,1)},{easing : 'backOut'})
        .to(0.1,{scale : new Vec3(1,1,1)})
        .union();
        //清空动画
        this.tweenObjClear = tween(this.node)
        .to(0.1,{scale : new Vec3(0.95,0.95,1)},{easing : 'backIn'})
        .to(0.1,{scale : new Vec3(1,1,1)})
        .union();
        //翻转动画1  旋转90度，
        this.tweenObjRotate = tween(this.node)
        .to(0.1,{eulerAngles : new Vec3(90,0,0)});
        //翻转动画2
        this.tweenObjRotate2 = tween(this.node)
        .to(0.2,{eulerAngles : new Vec3(270,0,0)})
        .call(function () {
            //sprite遮住label后 转完180度，调换sprite和label层级
            let indexSprite = self.node.getChildByName('Sprite').getSiblingIndex();
            let indexLabel = self.node.getChildByName('Label').getSiblingIndex();
            if (indexSprite > indexLabel) {
                //如果Sprite 的层级大于于 Label的层级则需要调换，让label在sprite前面，以显示字体
                self.node.getChildByName('Sprite').setSiblingIndex(indexLabel);
                self.node.getChildByName('Label').setSiblingIndex(indexSprite);
            }           
            //最后转回来
            self.tweenObjRotate3.start();           
        });   
        //翻动动画3
        this.tweenObjRotate3 = tween(this.node)
        .to(0.1,{eulerAngles : new Vec3(360,0,0)})
        .call(function () {
            self.node.eulerAngles = new Vec3(0,0,0);
        });     
    }
 
    onClick () {       
        let spriteNode = this.node.getChildByName('Sprite');
        spriteNode.getComponent(Sprite).spriteFrame = spriteNode.getComponent(Sprite).spriteAtlas.getSpriteFrame('btn_border_black'); 
        let layoutnode = gamemanager.instance.getCurrentLayoutNode();
        if(layoutnode) {//停止其他节点的动画
            for (let i = 0;i < layoutnode.children.length;i++){
                if (layoutnode.children[i].name != this.node.name) {
                    gamemanager.instance.stopNodeAllAction(layoutnode.children[i]);
                }
            }
        }
        this.tweenObjNode.start();
        //点击后设置当前btn_middle为选中的方格
        gamemanager.instance.setCurrentBtnNode(this.node);
    }
 
    runRotation(spriteName) {
        let self = this;
        this.tweenObjRotate
        .call(function() {
            //转完后，此时牌面与屏幕垂直，看不见。调换sprite和label的层级，让sprite遮住label
            let indexSprite = self.node.getChildByName('Sprite').getSiblingIndex();
            let indexLabel = self.node.getChildByName('Label').getSiblingIndex();
            if (indexSprite < indexLabel) {
                //如果Sprite 的层级小于 Label的层级则需要调换，让sprite遮住label
                self.node.getChildByName('Sprite').setSiblingIndex(indexLabel);
                self.node.getChildByName('Label').setSiblingIndex(indexSprite);
            }
            //设置sprite背景和label字体颜色，
            self.setBackgroundSprite(self.node.getChildByName('Sprite'),spriteName);
            self.node.getChildByName('Label').getComponent(Label).color = color(255,255,255,255);
            self.tweenObjRotate2.start();
        }).start();
    }
 
    setBackgroundSprite(spriteNode,spriteName){
        spriteNode.getComponent(Sprite).spriteFrame = 
        spriteNode.getComponent(Sprite).spriteAtlas.getSpriteFrame(spriteName);
    }
 
}
```
## 关联脚本
完成btn_middle.ts脚本后，就需要将该脚本挂载到btn_middle上面，并且绑定button的点击事件。在Cocos creator中的配置如下：
<p align="center"><img src="/blogimage/wordle/4/4.png"></p>

## 键盘按钮点击效果实现
- 在Cocos creator的资源管理器的Scripts文件夹中，创建btn_keyborde.ts脚本，删除多余的注释代码，创建onClick函数。双击prefab文件夹下btn_keyborde进入prefab的编辑页面，将btn_keyborde.ts脚本文件绑定到btn_keyborde节点上，并且将onClick函数挂载到button上，方法同上，这里就不再累述了。
- onClick函数中，获取当前选中的btn_middle，将btn_middle的Label设置为当前键盘按钮的Label的内容。切换btn_middle的Sprite背景为深色边框，调用btn_middle的输入动画。
```TypeScript
import { _decorator, Component, Button, Label, Sprite } from 'cc';
import { gamemanager } from './gamemanager';
import { Util } from './Util';
const { ccclass } = _decorator;
 
@ccclass('btn_keyborde')
export class btn_keyborde extends Component {
 
    onClick () {
        let layoutNode = gamemanager.instance.getCurrentLayoutNode();
        let btnNode = gamemanager.instance.getCurrentBtnNode();
        if (btnNode) {
            let labelNode = btnNode.getChildByName('Label');
            btnNode.getChildByName('Sprite').getComponent(Sprite).spriteFrame = 
            btnNode.getChildByName('Sprite').getComponent(Sprite).spriteAtlas.getSpriteFrame('btn_border_black');
            labelNode.getComponent(Label).string = this.node.name;
            gamemanager.instance.showBtnInputTween(btnNode);
            this.chooseNextBtn(btnNode,layoutNode);
        }
    }
 
}
```
- 调用btn_middle的输入动画是在gamemanager中实现的，需要在gamemanager中添加如下代码：
```TypeScript
    showBtnInputTween (currentBtnNode) {
        currentBtnNode.getComponent('btn_middle').tweenObjLabelInput.start();
    }
```
- 至此键盘按钮的点击效果就已经实现了，为了将输入效果人性化一点，我增加了一个 chooseNextBtn函数，用于在玩家输入了一个字母后，自动选择剩下未填写的“方格”进行选中。玩家就不要选中一个“方格”填写一个字母，只需要一次性输入5个字母即可。代码如下：
```TypeScript
chooseNextBtn(btnNode,layoutNode) {
        //向右边寻找未填写的空格，进行自动选择，
        //寻找逻辑，当前空格填完以后，向右移动一格进行选中
        let lastChar = Util.getLastChar(btnNode.name);
        let currentIndex = parseInt(lastChar);
        let forwardIndex = currentIndex;
        let iChildren = layoutNode.children.length;
        let newLastChar = ''; 
        let newBtnNodeName = '';
        let newBtnNode = null;
        let bisFind = false;
 
        forwardIndex++;//下标移动一位
        if (forwardIndex > iChildren) {//超出边界则取余，从头检测为空的空格进行选中，若从头检测没有则停止
            forwardIndex = forwardIndex % iChildren;
            while (forwardIndex <= iChildren) {
                newLastChar = forwardIndex.toString();
                newBtnNodeName = layoutNode.name + '_' + newLastChar;
                newBtnNode = layoutNode.getChildByName(newBtnNodeName);
                if (Util.isEmpty(newBtnNode.getChildByName('Label').getComponent(Label).string)) {
                    bisFind = true;//模拟点击事件
                    newBtnNode.getComponent(Button).clickEvents[0].emit(['click']);
                    break;                 
                }  
                forwardIndex++;                  
            }
            if (!bisFind) {
                gamemanager.instance.setCurrentBtnNode(null);
            }
        }
        else {
            newLastChar = forwardIndex.toString();
            newBtnNodeName = layoutNode.name + '_' + newLastChar;
            newBtnNode = layoutNode.getChildByName(newBtnNodeName);//模拟点击事件
            newBtnNode.getComponent(Button).clickEvents[0].emit(['click']);                
        }        
    }
```
**PS:**util是另外一个脚本文件。在这个脚本文件里面，我封装了一些常用的功能，后续会做详细介绍。代码逻辑为：从输入的当前btn_middle向右查找下一个还没有输入的“空格”，我是根据btn_middle的名称来进行遍历的。因为btn_middle在加载时，名称是根据Layout节点的名称 + 顺序号来组合的，所以很自然的就采用截取名称最后一位作为遍历的下标。在写这篇教程的时候我发现直接采用Layout节点的children属性来遍历会方便很多。由于该游戏已经完成就不再做修改了。

## 运行调试
```TypeScript
newBtnNode.getComponent(Button).clickEvents[0].emit(['click']);
```
上述代码，模拟了button的点击效果，和用手点击的效果一样。此时可以先运行一下，看看“方块”的选中和输入效果并且做一些调试。如果你完成了教程一中的环境配置，在Cocos creator双击某个脚本文件就会在VS Code中打开该文件，并且可以看到调试运行中已经有了Cocos creator的调试选项，如下图所示：
<p align="center"><img src="/blogimage/wordle/4/5.png"></p>
此时，你可以不需用在Cocos creator中运行游戏，可以直接在VS Code中按F5运行程序并且可以在代码处设置断点进行调试了。下一篇教程中，我们将完成整个游戏流程的实现。