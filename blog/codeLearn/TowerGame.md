# 盖楼游戏
<p align="center">
<img src="/blogimage/TowerGame/1.gif"/>
</p>

> 一个基于JavaScrtipt、Html5 的盖楼游戏

## 效果预览
<p align="center">
<img src="/blogimage/TowerGame/2.gif"/>
</p>

## 游戏规则

以下为默认游戏规则，也可参照下节自定义游戏参数

- 每局游戏生命值为3，掉落一块楼层生命值减1，掉落3块后游戏结束，单局游戏无时间限制

- 成功盖楼加25分，完美盖楼加50分，连续完美盖楼额外加25分，楼层掉落扣除生命值1，单局游戏共有3次掉落机会

比如：第一块完美盖楼加50分，第二块连续完美盖楼加75分，第三块连续完美盖楼加100分，依此类推……

<p align="center">
  <img src="/blogimage/TowerGame/3.jpeg" />
</p>

## 自定义
- 图片、音频资源可以直接替换 `assets` 目录下对应的资源文件
- 游戏规则可以修改 `index.html` 文件 的 `option` 对象

## 自定义选项

可以使用以下 `option` 表格里的参数，完成游戏自定义，**所有参数都是非必填项**
**PS**: utils.js中可以查看如下参数的默认设置，可以参照默认设置，在index.html中的option对象中做个性化修改。

| Option | Type | Description |
|---------|--------|-------------|
| width          | number | 游戏主画面宽度 |
| height         | number | 游戏主画面高度 |
| canvasId       | string | Canvas 的 DOM ID |
| soundOn        | boolean | 是否开启声音 |
| successScore   | number | 成功盖楼分数 |
| perfectScore   | number | 完美盖楼额外奖励分数 |
| <a href="#hookspeed">hookSpeed</a> | function | 钩子平移速度 |
| <a href="#hookangle">hookAngle</a> | function | 钩子摆动角度 |
| <a href="#landblockspeed">landBlockSpeed</a> | function | 下方楼房横向速度 |
| <a href="#setgamescore">setGameScore</a> | function | 当前游戏分数hook |
| <a href="#setgamesuccess">setGameSuccess</a> | function | 当前游戏成功次数hook |
| <a href="#setgamefailed">setGameFailed</a> | function | 当前游戏失败次数hook |

#### hookSpeed
钩子平移速度
函数接收两个参数，当前成功楼层和当前分数，返回速度数值
```
function(currentFloor, currentScore) {
  return number
}
```

#### hookAngle
钩子摆动角度
函数接收两个参数，当前成功楼层和当前分数，返回角度数值
```
function(currentFloor, currentScore) {
  return number
}
```

#### landBlockSpeed
下方楼房平移速度
函数接收两个参数，当前成功楼层和当前分数，返回速度数值
```
function(currentFloor, currentScore) {
  return number
}
```

#### setGameScore
当前游戏分数hook
函数接收一个参数，当前游戏分数
```
function(score) {
  // your logic
}
```

#### setGameSuccess
当前游戏成功次数hook
函数接收一个参数，当前游戏成功次数
```
function(successCount) {
  // your logic
}
```

#### setGameFailed
当前游戏失败次数hook
函数接收一个参数，当前游戏失败次数
```
function(failedCount) {
  // your logic
}
```


