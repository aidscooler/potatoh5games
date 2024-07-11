# cocos creator实现wordle游戏（三）

&emsp;&emsp;接着上篇教程 微信小游戏实战--cocos creator实现wordle游戏（二）我们继续游戏界面的设计，准确的说上篇教程只是完成了游戏界面的基础设置，同时也介绍了节点创建的步骤。这篇教程才算是正式进入了游戏的界面设计。
先在“Canvas”节点下创建一个“home”空节点并且挂载widget组件，操作方式在上篇教程中已经介绍，这里不再累述。“home”空节点的高宽，widget配置和bg背景节点一样。
## 布局分析
&emsp;&emsp;在最开始时，我将界面分解为3部分：顶部的用户头像，昵称显示区域。中间的单词输入区域。底部的键盘区域。对顶部区域做了适配顶端配置，顶部区域做了适配底部的配置，中间区域设置和顶部和底部边距，都是通过widget组件实现的。按照该设计思路，层级管理器中的结构如下：
<p align="center"><img src="/blogimage/wordle/3/1.png"></p>
home，top，midlle，bottom均为空节点并挂载widget组件，它们的widget配置如下：

- top: 宽720，高200（打算放两排组件，第一排是用户头像，第二排是其余功能按钮。一排100像素应该够了）
<p align="center"><img src="/blogimage/wordle/3/2.png"></p>
该配置可保证top始终会展示的屏幕的上方。

- bottom:宽720，高400 （一个键盘按钮的高度设计为80，4行按钮差320，算上行间距400应该够了）
<p align="center"><img src="/blogimage/wordle/3/3.png"></p>
该配置可以保证bottom始终展示在屏幕的最下方。
设置好这些后，middle的widget组件会默认计算好上下边距：
<p align="center"><img src="/blogimage/wordle/3/4.png"></p>
修改middle的高度，这两项边距也会发生对应的变化。
对于这款游戏来说，这样的设计思路有点问题。对于Iphone 5这种小屏幕的手机还比较适合，在iphone X,12这样的大屏幕下，顶部，底部和中间的距离就会被拉大，显的不那么紧凑不好看。最终我放弃了这个思路，把中间字母输入的控件和底部按钮控件全塞到了top中。最终如下所示：
<p align="center"><img src="/blogimage/wordle/3/5.png"></p>
top的高宽属性和widget的配置还是保持和上面的一致，这样界面基本上就可以适配绝大部分机型了，但是对于iphone 12这种刘海屏还是有点点问题，后面会在代码中做些处理。

## 用户头像，昵称布局
在top节点下再创建一个空节点“head”和一个Label控件“name”，然后再在head空节点下创建两个精灵控件“headimage”，“headborder”。Label控件和精灵控件都在2D对象下。headimage用于显示用户的头像，name用于显示用户的昵称。层级管理器中结构如下：
<p align="center"><img src="/blogimage/wordle/3/6.png"></p>

之所以要将headimage嵌套在空节点head下是因为，Cococs Creator中精灵都是矩形的，而我们要实现的是一个圆圈，所以需要将headimage嵌套在head下，并且再增加一个headborder精灵给头像套一个圈圈。具体的设置步骤如下：
- head：高宽为100像素，添加一个MASK遮罩组件，设置遮罩类型为Ellipse椭圆，Segments 64
<p align="center"><img src="/blogimage/wordle/3/7.png"></p>

通过这个配置就可以将head下的headimage精灵的四角遮住，并且呈圆角切割，看上去矩形的图像就被切割为圆形了，但是还是还能看出锯齿。所以headborder精灵就派上用场了，先通过图片处理软件生成一个100 X 100的圆圈图片，然后利用抠图软件将背景扣掉，剩下圆圈即可。还记得上篇教程介绍的资源管理器吗？生成好的图片就需要放在资源管理器中resources->Texture文件夹下，只需要在资源管理器中右键点击Texture文件夹，选择“在资源管理器中”打开这个文件夹了，然后将生成好的图片复制到该文件夹下即可，推荐使用这种方式，因为如果随着你的项目多了起来，每个项目下都有Textrue文件夹，你直接在电脑上去找的话，可能会找到别的项目下的这个文件夹。在Cocos Creator的资源管理器中打开文件夹就不会出现这种问题了。抠图软件网上很多，但是要收费的，这里给大家推荐一个免费的，而且是网页版的不需要安装，[点我](https://www.remove.bg/zh/upload)。这个游戏中用到的图片都很简单，用windows自带的画图软件就可以实现，具体步骤就不再介绍了，比较简单。

headimage和headborder的高宽都是 100，其他属性使用默认的即可，但要注意在层级管理器中顺序，headborder是在headimage下面，这样的话在显示的时候headborder会在headimage上面，这样才能显示出圆圈，当然你也可以在代码里面设置他们的层级来达到这个效果。

headboder中，设置图片为刚才制作好的圆圈图片，设置如下：
<p align="center"><img src="/blogimage/wordle/3/8.png"></p>
资源管理器中，我已经将需要的图片全都制作好了，如下所示：
<p align="center"><img src="/blogimage/wordle/3/9.png"></p>
你也可以直接左键选中“headborder”，拖拽到headborder的Sprite Frame属性中。这里还需要再介绍一下.plist文件，在游戏中可以将一类图片打包成plist文件，达到压缩游戏包大小的目的。同时，plist文件可以加载到精灵控件的 SptiteAtlas属性中，后续在代码里面可以很方便的实现图片切换。上图中的btn_keyborde，btn_middle就是plist文件，看字面意思你应该能猜到btn_keyborde就是键盘按钮上的一组图片，btn_middle就是中间字母输入区域，方块显示的背景图了。
<p align="center"><img src="/blogimage/wordle/3/10.png"></p>
点开plist文件就可以看到里面的图片，你也可以直接拖拽其中一个图片到精灵控件的Sprite Frame属性中实现图片的加载。制作plist文件需要用到 Textrue Packer这个软件[官网地址](https://www.codeandweb.com/texturepacker)，虽然是收费的，但是可以免费试用。操作很简单，将需要打包的图片拖拽进去，点击发布精灵表就可以了，唯一需要注意的就是，数据文件和纹理文件是配套的，都需要存放在Texture文件夹下：
<p align="center"><img src="/blogimage/wordle/3/11.png"></p>
回到头像控件，到现在基本的设置已经完成了，在场景编辑器中就可以设置它的位置了。在层级管理器中左键点击head节点，在场景编辑器中可以看到如下画面：
<p align="center"><img src="/blogimage/wordle/3/12.png"></p>
但是，我倾向于在属性检查器中来设置它的位置，因为这样更准确。设置它的位置有两种方式，第一种是通过设置Position属性来设置它的位置。第二种是通过widget组件。下面分别来说明这两种方式：

- 通过Position属性：我们要实现的效果就是，头像显示在左上角，上边距5像素，左边距5像素。具体的属性设置如下
<p align="center"><img src="/blogimage/wordle/3/13.png"></p>
这里要先介绍一下锚点，锚点就是节点的原点位置，Position中的x，y的数值都需要根据锚点来计算，可以看到系统默认的锚点是0.5和0.5，表示锚点是位于节点的中间，如果设置为0和0，锚点就会移动到节点的左下方。Position的位置也是相对于父节点的，上图中head的Position设置为X:-305，Y:45。这个是怎么计算出来的呢？head的父节点是top，top的锚点属性也是0.5和0.5，处于top节点的中间位置。top的高度是200，宽度是720，也就是说从锚点向左移动 720 * 0.5 = 360 就到达了top的最左边，这里的到达最左边是指top的子节点head的锚点到达最左边，由于head的锚点处于head的中心，设置X:-360后，head的锚点左边部分就超出了top的范围，也就是只显示了一半。head的宽度是100，一半就是50，所以得再向右移动50才能显示完全，-360 + 50 = -310。由于我们要求左边距为5像素，所以再向右移动5像素 -310 + 5 = -305。同理，head 向上移动 200 * 0.5 = 100，锚点到达top的最上边，但是head锚点上半部分也就超出了top的范围，所以得再向下移动 100 * 0.5 = 50，同时上边距为5，还要再向下移动5，最后100 - 50 - 5 = 45。

- 通过widget组件：
在head节点上添加widget组件，设置如下：
<p align="center"><img src="/blogimage/wordle/3/14.png"></p>
可以看出，通过widget组件来设置节点的位置会更简单方便。但是为什么还需要通过锚点和父节点的高宽来计算子节点的位置呢？那是因为并不是所有控件都必须通过widget组件来布局并且如果widget过度使用的话，若果界面出现了布局问题很难查。我的理解是可以通过widget组件布局大体位置，就像最开始我们设计游戏界面分顶部，中间，底部三个部分时，可以通过widget组件将三个部分的位置布局好，然后顶部，中间，底部的内的控件可以通过Position来布局，这样更灵活。掌握这两种布局方法以后，基本上任何布局都可以在属性检查器中来操作，不需要在场景编辑器中用鼠标来拖拽。

继续用户昵称 name（类型是Label）的设置，如下：
<p align="center"><img src="/blogimage/wordle/3/15.png"></p>
主要用到的就是上图所示4个地方：

- 字体颜色，设置为黑色也就是RGB（0,0,0）

- 清空默认自带的“Label”字符

- 字体大小，根据自己的喜好来设置

- 内容显示方式：有4种分别为none:效果就是内容超出Label宽度了就看不到超出部分。Clamp:内容超出Label宽度了会自动换行。Shrink:内容超出Label宽度后会自动缩小以完全显示。Resiz_height:内容超出Label宽度后自动换行，并配合EnableWrap属性自动调整高度。需要注意一下的是，刚创建的Label默认显示方式为none，这个时候是无法改变Label的大小的，这个坑了我好久才发现······

宽度和高度就根据自己的喜好来设置了，我设置的是宽100高50.再根据刚才介绍的布局方法设置Position位置。最后在场景编辑器中的效果如下：
<p align="center"><img src="/blogimage/wordle/3/16.png"></p>

## 功能按钮和答案提示区域布局 
在用户头像的下方，摆放一些功能按钮和答案提示区域，这里我们会用到Layout控件，右键点击top节点，选择“创建”-->“UI组件”-->“Layout（布局）”，命名为“Layout_top”，然后在Layout_top下“创建”-->“UI组件”-->“Button（按钮）”，依次创建“how”，“score”，“rank”，“btn_blank”，“btn_blank”5个按钮，层级管理器中显示结构如下:

<p align="center"><img src="/blogimage/wordle/3/17.png"></p>
how用来显示玩法介绍页面，score用来显示玩家得分页面，rank展示世界排名和好友排名，后面两个btn_blank暂时用来占位用的，后面如果注册用户数量达到了可以开通广告。虽然Cocos Creator中支持节点名称相同（它是通过uuid来区分节点的 ），但是建议不要将不同节点命名相同的名称。按钮的设置如下：
<p align="center"><img src="/blogimage/wordle/3/18.png"></p>
Layout_top设置如下：
<p align="center"><img src="/blogimage/wordle/3/19.png"></p>

- 只需要设置高度60，和子节点的按钮高度一样。
- 设置显示方式为HORIZONTAL（水平）。
- 设置ResizeMode为CONTAINER（容器）
- 子节点的间距
- 设置排列方式为LEFT_TO_RIGHT从左至右

做好如上配置后，Layout_top的大小会自动调整好宽度为320，子节点也会按照间距5像素，从左至右排列好。然后，在层级管理器中可以先鼠标左键点击head，然后按住Ctrl键，再鼠标左键点击Layout_top，再点击上方的左对齐按钮，可快速将Layout_top在水平位置设置为和head一样，最后再设置一下Y轴位置，可以按照前面介绍的根据Position位置设置，也可以拖动那个绿色的箭头来设置。如下所示：
<p align="center"><img src="/blogimage/wordle/3/20.png"></p>

接着再右键点击top节点，创建一个名为“Layout_topright”的Layout控件，设置如下：
<p align="center"><img src="/blogimage/wordle/3/21.png"></p>

- 高度还是设置为60，因为它的子节点的高度也是60
- 展示方式还是水平。
- ResizeMode设置为Container（容器）
- 左边距设置为5，保持和Layout_top有一定的间隙。
- 子节点排列方式还是从左到右。
在Layout_topright节点下，创建5个Button（按钮），名称规则为Layout_topright_ + index，按钮高宽均为60，设置好按钮图标，如下所示：
<p align="center"><img src="/blogimage/wordle/3/22.png"></p>
这里我们在按钮的SpriteAtlas属性中配置了一个plist文件，这个是为了后面在代码中方便切换按钮图标。这个设计的思路是，初始状态下，按钮的SpriteFrame加载的图片btn_top其实只是一个遮罩，罩住按钮节点下的Label，当玩家猜中某得字母时，我们就去掉该遮罩，用于显示按钮节点下的Label的内容，即正确答案。最后将Layout_topright位置配置好就行了，由于Layout_top节点的位置已经配置好，Layout_topright的位置就很好配置了，在Layout_topright的Position属性中，X设置为Layout_top的X值再加上320（Layout_top的宽度是320），Y设置为Layout_top的Y值即可。最终在场景编辑器中效果如下：
<p align="center"><img src="/blogimage/wordle/3/23.png"></p>

## 中间字母输入区域布局
游戏中字母输入区域就是一个5 X 6 的格子区域，如果只是单纯从布局上来说，完全可以利用一个Layout控件就可以实现，配置如下：
<p align="center"><img src="/blogimage/wordle/3/24.png"></p>

- 设置显示模式为：GRID
- ResizMode：Container（容器）
- 起始排列方式：HORIZONTAL（水平）
- 水平间距：5
- 纵向间距：5
- 纵向排列顺序：TOP_TO_BOTTOM（从上到下）
- 水平排列顺序：LEFT_TO_RIGHT
- 固定方式：FIXED_COL（列）
- 固定列数：5
这样的配置，在使用代码为Layout组件生成30个子节点时，就会按照从左到右，从上到下的顺序，一次生成并排列好30个子节点。但是，我没有采用这个设计思路，WTF？没采用还写出来干嘛？额，这里说点题外话，由于我一直坚信能够快速上手一门技术的最好方式就是去实践，去完成一个小而完整的例子。在实践过程中，会遇到很多问题，这些问题的产生也是验证自己对功能实现的设计，而写这个教程也是记录学习的过程。所以，虽然有些内容跟实现这个游戏无关，但是对于掌握一门技术，一个工具来说还是值得记录的。

因为游戏的进程是一个单词一个单词的猜测，一排5个格子输入完成后，会步入下一排，所以前一排就必须锁定，让玩家不能再操作了。为了方便程序的控制，最终打算还是采用创建6个水平布局的Layout控件来实现。操作也很简单：

右键点击top节点，选择“创建”-->“UI组件”-->“Layout（布局）”，命名为“Layout_middle1”。配置如下：
<p align="center"><img src="/blogimage/wordle/3/25.png"></p>

- 展示方式：HORIZONTAL（水平）
- ResizMode：CONTAINER（容器）
- 左边距：10
- 右边距：10
- 子节点间距：10
- 排列方式：LEFT_TORIGHT（从左到右）
高度设置100，因为后续通过代码加载的子节点为边长100的正方形，宽度不用设置，设置ResiMode为CONTAINER后会自动匹配宽度。创建好后，默认位置在场景编辑器中处于水平中央，此时可以通过Ctrl + C，Ctrl + V的形式复制另外5个Layout出来，如上图所示。此时在场景编辑器中他们将会处在同一位置，只需要调整他们的Position即可，X不需要设置，因为已经在水平中央了，只需要根据父节点的高度和锚点计算各个Layout的Y值即可。最终如下图所示：

<p align="center"><img src="/blogimage/wordle/3/26.png"></p>

## 底部键盘按钮布局
底部键盘按钮的布局方式同上，创建一个Layou命名为“Layot_bottom1”，设置如下：
<p align="center"><img src="/blogimage/wordle/3/27.png"></p>
具体设置不再详述，和中间布局的Layout一样，只是高度变为了80，按钮设计为61 X 80的大小。同样也是再复制另外三个Layout出来。按照同样的方式设置好Position中的Y值，前面三个Layout_bottom放置26个字母按键，设计为通过代码动态加载。在最后一个Layout_bottom4中再创建3个Button（按钮）：“ENTER”，“SPACE”和“DEL”键，设置按钮大小，背景图片（方法在前面已经介绍过了就不再累述），在按钮节点下的Label设置按钮显示的名称，如下：
<p align="center"><img src="/blogimage/wordle/3/28.png"></p>
如果一切顺利，在完成上述设置后，最终我们在场景编辑器中的样子是这样的：
<p align="center"><img src="/blogimage/wordle/3/29.png"></p>

## 制作Prefab
这里先对Prefab做个简单介绍。Prefab也可以视为一个节点，在场景中，如果某一部分会被重复使用多次，就可以将该部分设计为一个Prefab，通过代码动态调用来达到简化页面设计的目的。在这个游戏中字母输入框就可以被设计为一个Prefab，如果Cocos Creator中Label控件可以设置边框的话，就不用这么麻烦了。由于Label控件不能设置边框，我们需要再添加一个精灵来实现一个带边框的Label，具体思路就是Label设计大小为 95 X 95，精灵设计大小为 100 X 100，Label显示在精灵上面，精灵的背景图为一个矩形方框图（需要扣掉背景），方框的线条宽度为5。这样就可以显示出一个边框为5像素的Label了。接下来我们就开始制作这个prefab:
- 首先，我们在Layout_middle1 下创建一个空节点命名为“btn_middle”，大小设置100 X 100，然后在属性检查器中点击添加组件，添加一个Button组件，这个是为了后续实现点击事件。
- 然后，在该空节点下创建一个精灵和一个Label。精灵设置大小100 X 100，Label大小95 X 95。在层级管理器中，它们的结构如下：

<p align="center"><img src="/blogimage/wordle/3/30.png"></p>
精灵的设置：
<p align="center"><img src="/blogimage/wordle/3/31.png"></p>

- 加载plist文件，方便在代码中控制背景图的切换。
- 设置初始状态的背景图。
- 通过添加组件按钮，添加一个UIOpacity组件，用于后续实现闪烁动画效果。 

Label的设置：
<p align="center"><img src="/blogimage/wordle/3/32.png"></p>

- 设置字体颜色为黑色
- 清空默认的字符“Label” 
- 字体大小设置为60
- 显示方式为SHRINK，默认为none，此时不能设置Label大小
- 加粗

根据个人的喜好和页面美观要求可做不同的设置。
- 完成以上设置以后，我们左键点击“btn_middle”节点，将它拖拽到下方资源管理器中resuorces-->prefab文件夹中，就完成了一个prefab的创建。如下图所示，可以看到prefab是绿色的。
<p align="center"><img src="/blogimage/wordle/3/33.png"></p>
后续如果需要对prefab做修改，可以双击资源管理器中的prefab，进入prefab的编辑页面进行修改。

- 最后我们将Layout_middle1下的btn_middle删除掉，因为我们是通过代码来动态加载这个prefab就不需要在设计期出现了。
- 按照同样的方式制作键盘按钮的prefab，名称为btn_keyborde，制作方式一样就不再累述了。只是大小不一样而已。键盘按钮的大小设置为61 X 80

## 动态加载Prefab
创建脚本文件：右键点击资源管理器中scripts文件夹，选择“创建”-->“脚本（Typescript）”，命名为home，之所以这样命名是为了和home节点保持一致。然后左键点击层级管理器中的home节点，将home脚本文件拖拽到home节点的属性检查器中，完成脚本文件的挂载，
<p align="center"><img src="/blogimage/wordle/3/34.png"></p>
完成挂载以后，可在属性检查器里看到该脚本文件：
<p align="center"><img src="/blogimage/wordle/3/35.png"></p>
如果你已在第一篇教程中完成了环境配置，那么在资源管理器中双击home脚本文件，即可在VS Code中打开。
创建gamemanager。所有代码都写在一个地方，显然不太合适。这里做一下简单的分工，home.ts脚本文件实现一些流程的控制和基本校验，具体的功能，如页面布局，动画显示，得分计算那些我们将它交给gamemanager来实现。以同样方式在scripts文件夹下创建一个gamemanager.ts脚本文件，在gamemanger脚本中我们实现一个gamemanager类来操作游戏相关逻辑，由于它将一个裁判的身份出现，所以设计为单例类。
代码如下：

```TypeScript
import { _decorator, Component,tween,Sprite,ImageAsset, Node, Label,Button,Tween, instantiate,assetManager, UIOpacity, Vec3, Color, SpriteFrame } from 'cc';
 
export class gamemanager extends Component {
    // [1]
    private homeNode : Node;
    private static _instance : gamemanager;
 
    static get instance () {
        if (this._instance) {
            return this._instance
        }
        else {
            this._instance = new gamemanager();
            return this._instance;
        }
    }
 
    init(aNode) {//初始化场景home节点
        gamemanager.instance.homeNode = aNode;
    }
}
```
在gamemanager中实现prefab的加载，代码如下：
```TypeScript
    //添加prefab组件，layout组件上设置了布局,只需要添加到对应的layout下即可完成布局
    addNode (prefab,parentNode,icount,keybordeArray) {
        for (let i = 0 ; i < icount; i++) {
            let newNode = instantiate(prefab);
            if (keybordeArray) {
                newNode.name = keybordeArray[i];
                newNode.getChildByName('Label').getComponent(Label).string = keybordeArray[i];
            }
            else {
                newNode.name = parentNode.name + '_' + (i + 1).toString();                     
            }
            parentNode.addChild(newNode); 
        }
    }
```
参数说明:
- prefab：要加载的prefab
- parentNode：添加到哪个节点下，就是前面创建的Layout节点
- icount：需要添加多少个prefab，字母如数区域一排添加5个，键盘按钮区域第一排10，第二排9个，第三排7个
- keybordeArray：键盘按钮的显示内容如“A” 。
代码逻辑：使用instantiate函数将Prefab初始化为节点，如果keybordeArray不为null则说明是在键盘区域加载prefab，需要获取到键盘按钮节点下的Label控件，来显示对应的字母。最后在parentNode下添加该节点完成prefab的动态加载。
在gamemanager中实现，页面布局。代码如下：
```TypeScript
    init_layout (btn_iddle,btn_keyborde) {
        let homeNode = gamemanager.instance.homeNode;
        //中间按钮布局
        let topnode = homeNode.getChildByName('top');
        let layoutnodename = '';
        for (let i = 0; i < 6; i++){
            layoutnodename = 'Layout_middle' + (i + 1).toString();
            const layoutnode = topnode.getChildByName(layoutnodename);
            gamemanager.instance.addNode(btn_iddle,layoutnode,5,null);
        }
        //底部键盘布局
        let layout1 = topnode.getChildByName('Layout_bottom1');
        let layout2 = topnode.getChildByName('Layout_bottom2');
        let layout3 = topnode.getChildByName('Layout_bottom3');
        let keybordearray1 = ['Q','W','E','R','T','Y','U','I','O','P'];
        let keybordearray2 = ['A','S','D','F','G','H','J','K','L'];
        let keybordearray3 = ['Z','X','C','V','B','N','M'];
        gamemanager.instance.addNode(btn_keyborde,layout1,10,keybordearray1);
        gamemanager.instance.addNode(btn_keyborde,layout2,9,keybordearray2);
        gamemanager.instance.addNode(btn_keyborde,layout3,7,keybordearray3);      
    }
```
参数说明：
- btn_middle，btn_keborde分别为中间字母输入框和键盘按钮prefab 
  代码逻辑：根据home节点，通过Layout节点的名称获取到Layout控件的节点，在Layout节点下加载prefab
在home.ts脚本文件中，添加prefab属性，代码如下:
```TypeScript
import { _decorator, Component,Prefab,Button,Color,Label,Sprite, Widget, UITransform, VideoPlayer } from 'cc';
import { gamemanager } from './gamemanager';
 
const { ccclass, property } = _decorator;
 
@ccclass('home')
export class home extends Component {
 
    @property({type : Prefab,visible : true})
    private btn_middle = null;
    @property({type : Prefab,visible : true})
    private btn_keyborde = null;
 
    onLoad () {
 
    }
 
    onEnable () {  
 
    } 
 
    start () {
 
    }
}
```
代码保存后 ，切换到Cocos Creator中，在home节点的属性检查器中就可以看到，prefab属性了
<p align="center"><img src="/blogimage/wordle/3/36.png"></p>
此时，需要将btn_middle，btn_keyborde拖拽到对应的属性下，实现关联。在程序运行时，home节点初始化时便将prefab加载进来了。顺带再介绍一下onLoad，onEnable，start函数，脚本绑定到节点以后，节点在加载的时候，会顺序触发onLoad，onEnable，start函数，onLoad是在节点刚开始加载时触发，onEnale是在节点加载完毕后触发，此时节点下的内容对于用户来说还不可见，start是在节点加载完毕并且状态为active=true后，也就是玩家看到节点中的内容后触发。

在home.ts脚本的onLoad调用gamemanager实现动态加载prefab完成布局。在onLoad中调用gamemanager的布局函数，实现布局。代码如下：
```TypeScript
import { _decorator, Component,Prefab,Button,Color,Label,Sprite, Widget, UITransform, VideoPlayer } from 'cc';
import { gamemanager } from './gamemanager';
 
 
const { ccclass, property } = _decorator;
 
@ccclass('home')
export class home extends Component {
 
    @property({type : Prefab,visible : true})
    private btn_middle = null;
    @property({type : Prefab,visible : true})
    private btn_keyborde = null;
 
    onLoad () {
        //获取home节点
        gamemanager.instance.init(this.node);
        //初始化游戏界面
        gamemanager.instance.init_layout(this.btn_middle,this.btn_keyborde);           
    }
 
    onEnable () {  
 
    } 
 
    start () {
    }
}
```
由于home.ts脚本文件挂载到了home节点下，在home.ts中，this.node即代表home节点，this.btn_middle，this.btn_keyborde是通过在Cocos Creator中关联加载的。完成这些代码后，运行程序，
<p align="center"><img src="/blogimage/wordle/3/37.png"></p>
一切顺利的话，就可以在Chrome里面看到我们的游戏界面了：
<p align="center"><img src="/blogimage/wordle/3/38.png"></p>
至此，游戏界面就算搭建完成了，接下来就继续实现相关功能了。