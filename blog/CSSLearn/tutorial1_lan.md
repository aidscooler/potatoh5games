# CSS语法基础

CSS（层叠样式表）是用于描述网页样式的语言。掌握CSS语法基础是成为优秀前端开发者的关键一步。本文将详细介绍CSS的基本语法结构、选择器、属性和值的使用方法。

## CSS规则集结构

CSS规则集由选择器和声明块组成。声明块包含一个或多个声明，每个声明由属性和值组成。

```css
selector {
  property: value;
}
```

例如：

```css
h1 {
  color: blue;
  font-size: 24px;
}
```

## 选择器基础

选择器用于指定要应用样式的HTML元素。

### 元素选择器

```css
p {
  color: red;
}
```

### 类选择器

```css
.highlight {
  background-color: yellow;
}
```

### ID选择器

```css
#header {
  font-weight: bold;
}
```

## 属性和值

属性定义了要改变的样式特征，值指定了属性的新样式。

```css
body {
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}
```

## 注释

CSS注释用`/* */`包裹，可以跨多行。

```css
/* 这是一个CSS注释 */
p {
  color: green; /* 这是行内注释 */
}
```

## 简写属性

某些属性可以使用简写形式，以减少代码量。

```css
/* 分开写法 */
margin-top: 10px;
margin-right: 15px;
margin-bottom: 10px;
margin-left: 15px;

/* 简写形式 */
margin: 10px 15px;
```

## 多重声明

可以在一个规则集中应用多个声明，用分号分隔。

```css
h2 {
  color: navy;
  font-size: 20px;
  text-decoration: underline;
}
```

## CSS引入方式

### 内联样式

直接在HTML元素中使用`style`属性。

```html
<p style="color: purple; font-size: 18px;">这是内联样式的段落。</p>
```

### 内部样式表

在HTML文档的`<head>`部分使用`<style>`标签。

```html
<head>
  <style>
    body {
      background-color: lightyellow;
    }
  </style>
</head>
```

### 外部样式表

创建单独的CSS文件，并在HTML文档中引用。

```html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
```

## 总结

掌握CSS语法基础是构建漂亮网页的第一步。通过理解选择器、属性、值以及各种CSS规则，你将能够更有效地控制网页的外观和布局。随着实践的增加，你会发现CSS是一个强大而灵活的工具，能够帮助你创造出令人惊叹的web设计。

继续学习和实践，你将逐步掌握更多高级CSS技巧，成为一名出色的前端开发者！