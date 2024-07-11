# JavaScript变量的使用
&emsp;&emsp;在JavaScript中，变量是存储和操作数据的基本单元。通过变量，我们可以在程序中保存和修改数据。本文将介绍JavaScript中的变量和声明的知识点，包括使用var、let或const关键字声明变量，变量名遵循的标识符命名规则。

## 变量的申明
&emsp;&emsp;在JavaScript中，我们可以使用var、let或const关键字声明变量。这些关键字有不同的作用域和声明方式。
使用var关键字声明的变量具有函数作用域。这意味着它们在声明它们的函数内部是可见的，并且在函数外部是不可见的。var关键字声明的变量可以被重新赋值。
```js
function example() {
  var x = 10;
  if (true) {
    var y = 20;
    console.log(x); // 输出 10
    console.log(y); // 输出 20
  }
  console.log(x); // 输出 10
  console.log(y); // 输出 20
}
 
example();
```
&emsp;&emsp;使用let关键字声明的变量具有块级作用域。块级作用域是指变量在声明它们的块（例如，if语句块或循环块）内部可见，并在块外部不可见。let关键字声明的变量可以被重新赋值。
```js
function example() {
  let x = 10;
  if (true) {
    let y = 20;
    console.log(x); // 输出 10
    console.log(y); // 输出 20
  }
  console.log(x); // 输出 10
  console.log(y); // 报错：y未定义
}
 
example();
```
&emsp;&emsp;使用const关键字声明的变量也具有块级作用域，但是它们是常量，一旦被赋值就不能再被修改。
```js
function example() {
  const x = 10;
  if (true) {
    const y = 20;
    console.log(x); // 输出 10
    console.log(y); // 输出 20
  }
  console.log(x); // 输出 10
  console.log(y); // 报错：y未定义
}
 
example();
```
## 变量名遵循标识符命名规则
&emsp;&emsp;在JavaScript中，变量名必须遵循标识符命名规则。标识符是用于标识变量、函数、属性或参数的名称。
- 标识符可以包含字母、数字、下划线（_）和美元符号（$）。
- 标识符必须以字母、下划线或美元符号开头，不能以数字开头。
- 标识符区分大小写，例如，myVariable和myvariable是不同的变量名。
示例代码：
```js
let myVariable = 10;
let _privateVariable = "private";
let $specialVariable = true;
```
## 变量的类型是动态的       
&emsp;&emsp;在JavaScript中，变量可以存储不同类型的值，例如数字、字符串、布尔值、数组、对象等。可以通过赋值操作来修改变量的类型和值。
```js
let x = 10; // 数字
let message = "Hello, world!"; // 字符串
let isActive = true; // 布尔值
let numbers = [1, 2, 3, 4, 5]; // 数组
let person = { name: "John", age: 30 }; // 对象
 
x = "20"; // 数字类型的变量变成字符串类型
message = 30; //字符串类型的变量变成数字类型

```