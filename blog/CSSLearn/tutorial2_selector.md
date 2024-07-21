# CSS选择器详解

CSS选择器是前端开发中不可或缺的工具，它们使我们能够精确地定位HTML文档中的元素并为其应用样式。本文将深入探讨各种CSS选择器，包括它们的语法、用途和实际应用示例。

## 基本选择器

基本选择器是CSS中最常用的选择器类型，它们直接针对HTML元素的基本特征进行选择。

### 通用选择器 (*)

通用选择器匹配文档中的所有元素。它通常用于重置样式或应用全局样式。

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

这段代码将为所有元素设置`border-box`盒模型，并重置默认的外边距和内边距。

### 元素选择器

元素选择器直接匹配HTML标签名。

```css
p {
  line-height: 1.6;
  margin-bottom: 15px;
}

h1 {
  font-size: 2.5em;
  color: #333;
}
```

这里，我们为所有段落设置了行高和下边距，同时为一级标题设置了字体大小和颜色。

### 类选择器 (.)

类选择器匹配具有特定class属性的元素。

```css
.highlight {
  background-color: yellow;
  padding: 5px;
}

.btn {
  display: inline-block;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
```

这段代码定义了一个高亮类和一个按钮类，可以应用于任何需要这些样式的元素。

### ID选择器 (#)

ID选择器匹配具有特定id属性的元素。

```css
#header {
  background-color: #f8f9fa;
  padding: 20px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

#main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
```

这里我们为页面头部和主要内容区域定义了样式。

## 组合选择器

组合选择器允许我们基于元素之间的关系来选择元素。

### 后代选择器 (空格)

选择某个元素的所有后代元素。

```css
article p {
  text-indent: 1em;
  color: #333;
}

nav ul li {
  display: inline-block;
  margin-right: 10px;
}
```

这段代码为文章中的段落添加了首行缩进，并设置了导航菜单项的显示方式。

### 子选择器 (>)

选择某个元素的直接子元素。

```css
ul > li {
  list-style-type: square;
  margin-bottom: 5px;
}

.dropdown > .dropdown-menu {
  display: none;
  position: absolute;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
```

这里我们为无序列表的直接子项设置了样式，并定义了下拉菜单的基本结构。

### 相邻兄弟选择器 (+)

选择紧接在某个元素后的兄弟元素。

```css
h1 + p {
  font-size: 1.2em;
  font-weight: bold;
}

label + input {
  margin-left: 10px;
}
```

这段代码为紧跟在一级标题后的段落设置了特殊样式，并为标签后的输入框添加了左边距。

### 通用兄弟选择器 (~)

选择某个元素后的所有兄弟元素。

```css
h2 ~ p {
  margin-left: 20px;
  border-left: 3px solid #007bff;
  padding-left: 10px;
}
```

这里我们为二级标题后的所有段落添加了左边距和左边框。

## 属性选择器

属性选择器基于元素的属性或属性值来选择元素。

### 存在和值属性选择器

```css
[type] {
  border: 1px solid #ccc;
  padding: 5px;
}

[type="text"] {
  border-radius: 4px;
}

[lang="en"] {
  font-family: 'Arial', sans-serif;
}
```

这段代码为所有具有type属性的元素添加了边框和内边距，为文本输入框添加了圆角，并为英文内容设置了字体。

### 子串值属性选择器

```css
/* 选择href属性值以"https"开头的元素 */
[href^="https"] {
  color: green;
  padding-left: 20px;
  background: url('lock-icon.png') no-repeat left center;
}

/* 选择src属性值以".jpg"结尾的元素 */
[src$=".jpg"] {
  border: 2px solid #ddd;
  padding: 5px;
}

/* 选择title属性值包含"info"的元素 */
[title*="info"] {
  cursor: help;
  border-bottom: 1px dotted #999;
}
```

这里我们为安全链接添加了图标，为JPG图片添加了边框，并为包含信息的元素添加了提示样式。

## 伪类选择器

伪类选择器用于选择处于特定状态的元素。

### 链接和用户行为伪类

```css
a:link {
  color: #007bff;
  text-decoration: none;
}

a:visited {
  color: #6610f2;
}

a:hover {
  text-decoration: underline;
}

a:active {
  color: #dc3545;
}

input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}
```

这段代码定义了链接在不同状态下的样式，以及输入框在获得焦点时的样式。

### 结构伪类

```css
/* 选择第一个子元素 */
li:first-child {
  font-weight: bold;
}

/* 选择最后一个子元素 */
li:last-child {
  margin-bottom: 0;
}

/* 选择奇数位置的子元素 */
tr:nth-child(odd) {
  background-color: #f8f9fa;
}

/* 选择第3个子元素 */
.grid-item:nth-child(3) {
  grid-column: span 2;
}
```

这里我们为列表的第一项和最后一项设置了特殊样式，为表格的奇数行添加了背景色，并为网格布局中的第三个项目设置了跨列。

## 伪元素选择器

伪元素选择器用于创建一些不在文档树中的元素，并为其添加样式。

```css
/* 为段落的第一行添加样式 */
p::first-line {
  font-variant: small-caps;
  color: #6c757d;
}

/* 为段落的第一个字母添加样式 */
p::first-letter {
  font-size: 2em;
  float: left;
  margin-right: 5px;
  color: #007bff;
}

/* 在引用前后添加引号 */
blockquote::before,
blockquote::after {
  content: '"';
  font-size: 2em;
  color: #6c757d;
}

/* 为外部链接添加图标 */
a[href^="http"]::after {
  content: " ↗";
  font-size: 0.8em;
  vertical-align: super;
}
```

这段代码为段落的首行和首字母添加了特殊样式，为引用添加了引号，并为外部链接添加了一个小图标。

## 选择器优先级

了解选择器优先级对于解决样式冲突至关重要。优先级从高到低排序：

1. 内联样式
2. ID选择器
3. 类选择器、属性选择器、伪类
4. 元素选择器、伪元素

```css
/* 优先级: 0-0-1-0 */
p {
  color: blue;
}

/* 优先级: 0-0-1-1 */
p.highlight {
  color: yellow;
}

/* 优先级: 0-1-0-0 */
#content p {
  color: green;
}

/* 优先级: 1-0-0-0 (内联样式) */
<p style="color: red;">This is a paragraph.</p>
```

在这个例子中，内联样式会覆盖所有其他样式，段落最终会显示为红色。

## 总结

CSS选择器是构建灵活、可维护的样式表的关键。通过掌握各种选择器及其用法，你可以精确控制网页的外观，创建更加动态和响应式的设计。随着实践的增加，你会发现选择器的强大之处，它们能够帮助你编写更简洁、更高效的CSS代码。

继续探索和实验不同的选择器组合，你将能够解决更复杂的样式问题，成为一名出色的前端开发者！