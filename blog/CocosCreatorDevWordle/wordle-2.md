# cocos creator实现wordle游戏（二）
## 熟悉Cocos Creator
&emsp;&emsp;工欲善其事必先利其器，首先我们需要熟悉一下开发工具的使用。打开Cocos Creator进入到我们之前创建的项目，新建的2D项目大概如下图所示：
<p align="center"><img src="/blogimage/wordle/2/1.png"></p>

- 层级管理器：创建和管理游戏的内容节点。在Cocos Creator中所有的控件都被视为节点(node)，在层级管理器中可以清晰的查看场景下的节点，以树形结构展示。

- 资源管理器：创建和管理游戏所用到资源。通常一个游戏所用到的资源就是脚本文件(typescript文件)，音视频，图片，预制体（这个后续详细介绍），场景文件。这里简单介绍一下场景：所谓场景就是承载内容节点的容器，玩家所看到的界面。一个游戏必须要有一个场景，复杂的游戏可能会有多个场景。

- 属性检查器：通常配合层级管理器使用。在层级管理器中选中某个节点后，可以在属性检查器里面查看选中节点的属性，也可以修改该节点的属性。

- 场景编辑器：制作场景，通常配合层级管理器使用。在层级管理器中创建可视化节点（如Label）后，可在场景编辑器中看到该控件，并且可以通过鼠标拖拽的方式设置它的位置。

接下来，我们就开始逐步构建wordle游戏的界面。
## 必要的基础设置
点击“项目”-->"项目设置"，进入项目设置页面。
<p align="center"><img src="/blogimage/wordle/2/2.png"></p> 

### 高宽设置
&emsp;&emsp;在项目数据中将“设计宽度”设置为“720”，“设计高度”设置为“1280”，勾选“适配屏幕宽度”。因为这个游戏是竖屏游戏也就是设计高度大于设计宽度，所以需要勾选“适配屏幕宽度”，后续在设计游戏界面时配合widget组件基本就可以适配绝大部分手机屏幕了，如下图所示：
<p align="center"><img src="/blogimage/wordle/2/3.png"></p> 

### 引擎选择 
&emsp;&emsp;在“功能剪裁”中将不需要的引擎功能去掉，为项目瘦身。因为微信小游戏首包大小需要限制在4M以内，超过4M就需要分包了，总游戏大小也不能超过20M。我们开发的这款游戏是2D游戏，首先就需要去掉3D引擎，然后2D引擎只保留最低配置，如下图所示：
<p align="center"><img src="/blogimage/wordle/2/4.png"></p>

### 目录创建 
&emsp;&emsp;在资源管理器中创建对应游戏资源的存放目录，右键点击“assets”,选择“创建”-->“文件夹”，创建名称为“resources”（注意名称不要写错，因为所有需要被动态加载的资源都必须存放在该文件夹下）。然后右键点击创建好的resources文件夹，在该文件夹下依次创建“prefab”，“scripts”，“sound”，“Texture”文件夹，prefab用于存放预制体文件，scripts用于存放typescript脚本文件，sound用于存放音频文件，Texture用于存放图片文件。文件夹的名称可以根据自己喜好来自行设置，但是为了遵循业界的规范还是建议取以上名称便于识别。最后右键点击“assets”，创建“scene”文件夹，用于存放场景文件。最后创建好的结构如下图所示：
<p align="center"><img src="/blogimage/wordle/2/5.png"></p>

### 保存场景 
&emsp;&emsp;在层级管理器中，右键点击默认创建好的“Main Camera”，选择“删除”将它删除。再 Crtrl + S，将场景文件保存，在保存时将场景名称更改为“game”（你也可以取别的名称），保存的路径就是刚才创建的“scene”文件夹下。如果一切顺利的话，应该会如下图所示：
<p align="center"><img src="/blogimage/wordle/2/6.png"></p> 
完成上述配置以后，终于可以开始创建游戏界面了。

## 游戏界面制作
### 创建空节点 
在层级管理器中右键点击场景“game”，选择“创建”-->"空节点"，如下图所示：
<p align="center"><img src="/blogimage/wordle/2/7.png"></p> 
将其命名为“gameRoot”，空节点在场景编辑器中不可见，但是为什么要创建它呢？这里要引入“常驻节点”的概念，在Cocos Creator中，场景下的第一个节点可以设置为“常驻节点”。在多场景游戏中，场景的切换会将场景中的节点释放掉，但是不会释放“常驻节点”。由此可以在此节点上挂载脚本用于实现所有场景都需要的功能，比如说音效播放功能。虽然该游戏只用到了一个场景，但是从长远来说建议还是遵循该设计模式，方便后续的扩展。

### 新建场景
右键点击场景“game”，选择“创建”-->"UI组件"-->"画布"，如下图所示：
<p align="center"><img src="/blogimage/wordle/2/8.png"></p> 

### 新建画布
右键点击创建好的“Canvas”，选择“创建”-->“2D对象”-->“SpriteSplash(单色)”，创建一个单色的精灵组件，（精灵其实就是图片控件，也不知道为什么会叫精灵，既然业界都是这么叫的我们也就入乡随俗吧）将其命名为“bg”，因为它将作为这个游戏的背景图。创建好后的结构如下：那个Camera是Canvas组件自带的，如果删除它以后将看不到游戏界面了。
<p align="center"><img src="/blogimage/wordle/2/9.png"></p> 

### 创建Camera
左键点击“Camera”，在场景编辑器中可看到大致的画面是这样的：
<p align="center"><img src="/blogimage/wordle/2/10.png"></p> 

### 设置属性
现在我们需要做一些设置，左键点击“bg”，此时在“属性检查器”中就可以看到对应的属性了，设置“ContentSize”宽为720，高为1280，也就是项目设置中的宽和高（单位是像素），如下图所示：
<p align="center"><img src="/blogimage/wordle/2/11.png"></p> 
组件默认的颜色是白色，我习惯于将它调整为保护眼睛的“豆沙绿”，点击“Color”右边的白色区域，设置如下：（你也可以设置为其它颜色）
<p align="center"><img src="/blogimage/wordle/2/12.png"></p> 

颜色采用RGB方式设置，这里推荐一个[拾色器](https://www.w3cschool.cn/tools/index?name=cpicker)，免费的也不需要安装。
<p align="center"><img src="/blogimage/wordle/2/13.png"></p> 
点击那个画笔图标，再点击你看上的颜色就行了。

然后在“属性检查器”最后会有一个“添加组件”按钮，左键点击它：
<p align="center"><img src="/blogimage/wordle/2/14.png"></p> 
搜索“widget”组件并添加，做如下配置：
<p align="center"><img src="/blogimage/wordle/2/15.png"></p>
这个配置就会使得bg组件能够在宽度和高度上去自适应目标分辨率，Left，Right可以设置左右边距，Top，Buttom可以设置上下边距。全部设置为0就可以让bg能够全面平铺渲染整个背景了。
&emsp;&emsp;最后还需要设置一下“Camera”的大小，顾名思义Camera就是摄像机，它所显示的区域就是我们最终看到的区域，如果它的大小小于bg的大小，那么我们看到的界面就是局部的不完整的。如果它的大小大于bg的大小，我们就会看到黑边。所以需要将Camera的大小设置为bg的大小，但是在“属性检查器中”没有对应的高宽设置，我们只能在“场景编辑器”中以拖拽的形式来设置它的大小，这对于有强迫症的我来说确实很难受，但是没办法。
在“层级管理器”中左键点击“Camera”，此时在“场景编辑器”看到画面如下：
<p align="center"><img src="/blogimage/wordle/2/16.png"></p>
选中左边那个小白点，慢慢的向左拖就会看到Camera的大小在不断变大了，一直拖到和bg大小相等或者差不多为止。一定要慢点，不然很难卡到那个点。