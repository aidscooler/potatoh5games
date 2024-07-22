import{_ as a,c as s,o as n,a5 as e,bT as p,bU as l,bV as i}from"./chunks/framework.C1oSJDt2.js";const f=JSON.parse('{"title":"2048","description":"","frontmatter":{},"headers":[],"relativePath":"blog/codeLearn/y2048.md","filePath":"blog/codeLearn/y2048.md","lastUpdated":1721491738000}'),t={name:"blog/codeLearn/y2048.md"},c=e('<h1 id="_2048" tabindex="-1">2048 <a class="header-anchor" href="#_2048" aria-label="Permalink to &quot;2048&quot;">​</a></h1><p align="center"><img src="'+p+'"></p><blockquote><p>经典2048小游戏，基于JS、Html5改写版</p></blockquote><h2 id="效果预览" tabindex="-1">效果预览 <a class="header-anchor" href="#效果预览" aria-label="Permalink to &quot;效果预览&quot;">​</a></h2><p align="center"><img src="'+l+'"></p><h2 id="游戏规则" tabindex="-1">游戏规则 <a class="header-anchor" href="#游戏规则" aria-label="Permalink to &quot;游戏规则&quot;">​</a></h2><p>以下为游戏默认规则，若需要修改规则请修改代码。</p><ul><li>移动箭头键来移动方块，当两个相同数字的方块碰撞时会合并成一个方块。每次移动后，会在随机位置生成一个新的方块。</li><li>成功合并方块得分为两个方块的数字之后。</li><li>当方块填满时使用箭头键就不能再移动方块，此时游戏结束</li></ul><p align="center"><img src="'+i+`"></p><h2 id="个性化定制" tabindex="-1">个性化定制 <a class="header-anchor" href="#个性化定制" aria-label="Permalink to &quot;个性化定制&quot;">​</a></h2><ul><li>可以替换meta文件夹中的图片，但需要注意保持尺寸大小与原图一致。</li><li>核心样式在style文件中的main.css定义，可修改此文件来定制自己的个性化样式。</li><li>游戏逻辑核心代码在js文件夹下的game_manager.js中，可修改此文件来定制自己的个性化规则。</li></ul><p>以下为game_manager.js中核心逻辑控制代码</p><h4 id="restart" tabindex="-1">restart <a class="header-anchor" href="#restart" aria-label="Permalink to &quot;restart&quot;">​</a></h4><p>启动游戏 清除当前游戏状态，初始化相关参数并启动游戏</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Restart the game</span></span>
<span class="line"><span>GameManager.prototype.restart = function () {</span></span>
<span class="line"><span>  this.storageManager.clearGameState();</span></span>
<span class="line"><span>  this.actuator.continueGame(); // Clear the game won/lost message</span></span>
<span class="line"><span>  this.setup();</span></span>
<span class="line"><span>};</span></span></code></pre></div><h4 id="keepplaying" tabindex="-1">keepPlaying <a class="header-anchor" href="#keepplaying" aria-label="Permalink to &quot;keepPlaying&quot;">​</a></h4><p>继续游戏 当玩家达到2048时，允许继续挑战最高记录。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Keep playing after winning (allows going over 2048)</span></span>
<span class="line"><span>GameManager.prototype.keepPlaying = function () {</span></span>
<span class="line"><span>  this.keepPlaying = true;</span></span>
<span class="line"><span>  this.actuator.continueGame(); // Clear the game won/lost message</span></span>
<span class="line"><span>};</span></span></code></pre></div><h4 id="setup" tabindex="-1">setup <a class="header-anchor" href="#setup" aria-label="Permalink to &quot;setup&quot;">​</a></h4><p>游戏开始时初始化游戏相关参数 本游戏将玩家的游戏数据保存在浏览器本地存储中，游戏开始时会判断上一次游戏是否未结束，若没结束读取上一次的游戏数据。若结束则开始全新的游戏。所以，在游戏没有结束时你关闭了浏览器，重新打开游戏后依然会继续上一次的游戏。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>GameManager.prototype.setup = function () {</span></span>
<span class="line"><span>  var previousState = this.storageManager.getGameState();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // Reload the game from a previous game if present</span></span>
<span class="line"><span>  if (previousState) {</span></span>
<span class="line"><span>    this.grid        = new Grid(previousState.grid.size,</span></span>
<span class="line"><span>                                previousState.grid.cells); // Reload grid</span></span>
<span class="line"><span>    this.score       = previousState.score;</span></span>
<span class="line"><span>    this.over        = previousState.over;</span></span>
<span class="line"><span>    this.won         = previousState.won;</span></span>
<span class="line"><span>    this.keepPlaying = previousState.keepPlaying;</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    this.grid        = new Grid(this.size);</span></span>
<span class="line"><span>    this.score       = 0;</span></span>
<span class="line"><span>    this.over        = false;</span></span>
<span class="line"><span>    this.won         = false;</span></span>
<span class="line"><span>    this.keepPlaying = false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // Add the initial tiles</span></span>
<span class="line"><span>    this.addStartTiles();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // Update the actuator</span></span>
<span class="line"><span>  this.actuate();</span></span>
<span class="line"><span>};</span></span></code></pre></div><h4 id="addstarttiles" tabindex="-1">addStartTiles <a class="header-anchor" href="#addstarttiles" aria-label="Permalink to &quot;addStartTiles&quot;">​</a></h4><p>添加游戏开局时的方块 游戏开始时在随机位置产生方块，方块数量为startTiles，可修改此参数来控制游戏开始时产生的方块数量</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Set up the initial tiles to start the game with</span></span>
<span class="line"><span>GameManager.prototype.addStartTiles = function () {</span></span>
<span class="line"><span>  for (var i = 0; i &lt; this.startTiles; i++) {</span></span>
<span class="line"><span>    this.addRandomTile();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span></code></pre></div><h4 id="addrandomtile" tabindex="-1">addRandomTile <a class="header-anchor" href="#addrandomtile" aria-label="Permalink to &quot;addRandomTile&quot;">​</a></h4><p>在随机位置生成新的方块 每次移动后，在剩余没有方块的地方随机产生一个新的方块，方块数字为2的概率为90%，为4的概率为10%。可修改此方法的逻辑来实现自己的生成规则。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Adds a tile in a random position</span></span>
<span class="line"><span>GameManager.prototype.addRandomTile = function () {</span></span>
<span class="line"><span>  if (this.grid.cellsAvailable()) {</span></span>
<span class="line"><span>    var value = Math.random() &lt; 0.9 ? 2 : 4;</span></span>
<span class="line"><span>    var tile = new Tile(this.grid.randomAvailableCell(), value);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.grid.insertTile(tile);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span></code></pre></div><h4 id="tilematchesavailable" tabindex="-1">tileMatchesAvailable <a class="header-anchor" href="#tilematchesavailable" aria-label="Permalink to &quot;tileMatchesAvailable&quot;">​</a></h4><p>判断方块是否能够合并 判断在移动方向上的两个方块数字是否相等，若相等则可合并。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Check for available matches between tiles (more expensive check)</span></span>
<span class="line"><span>GameManager.prototype.tileMatchesAvailable = function () {</span></span>
<span class="line"><span>  var self = this;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  var tile;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  for (var x = 0; x &lt; this.size; x++) {</span></span>
<span class="line"><span>    for (var y = 0; y &lt; this.size; y++) {</span></span>
<span class="line"><span>      tile = this.grid.cellContent({ x: x, y: y });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      if (tile) {</span></span>
<span class="line"><span>        for (var direction = 0; direction &lt; 4; direction++) {</span></span>
<span class="line"><span>          var vector = self.getVector(direction);</span></span>
<span class="line"><span>          var cell   = { x: x + vector.x, y: y + vector.y };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          var other  = self.grid.cellContent(cell);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          if (other &amp;&amp; other.value === tile.value) {</span></span>
<span class="line"><span>            return true; // These two tiles can be merged</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return false;</span></span>
<span class="line"><span>};</span></span></code></pre></div>`,30),r=[c];function o(d,h,u,g,m,v){return n(),s("div",null,r)}const k=a(t,[["render",o]]);export{f as __pageData,k as default};
