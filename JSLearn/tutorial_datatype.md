# JavaScript数据类型
&emsp;&emsp;JavaScript是一门动态类型的编程语言，它支持多种数据类型。了解JavaScript的数据类型对于编写高质量的代码至关重要。本文将介绍JavaScript中的各种数据类型，包括原始数据类型和引用数据类型，并提供相关示例代码，帮助读者更好地理解和应用这些数据类型。

## 原始数据类型
- 数字（Number）：数字类型用于表示数值。它可以是整数或浮点数。在JavaScript中，数字类型没有区分整数和浮点数的概念，所有数字都是以64位浮点数的形式存储。
```js
let num1 = 10; // 整数
let num2 = 3.14; // 浮点数
```
- 字符串（String）：
字符串类型用于表示文本数据。字符串由一系列字符组成，可以使用单引号或双引号来定义。
```js
let str1 = 'Hello'; // 使用单引号定义字符串
let str2 = "World"; // 使用双引号定义字符串
```
- 布尔值（Boolean）：
布尔值类型用于表示逻辑值，只有两个可能的取值：true（真）和false（假）。
```js
let isTrue = true;
let isFalse = false;
```
- 空值（Null）：
空值类型用于表示一个空的或不存在的值。
```js
let emptyValue = null;
```
- 未定义（Undefined）：
未定义类型用于表示一个未初始化的变量或缺少值的变量。
```js
let undefinedValue;
```
## 引用数据类型
- 对象（Object）：对象类型用于表示复杂的数据结构，它由一组键值对（属性和对应的值）组成。
```js
let person = {
  name: 'Ken',
  age: 35,
  address: 'NO118. LiYuan Road'
};
```
- 数组（Array）：数组类型用于表示一组有序的数据，可以存储多个值。
```js
let numbers = [1, 2, 3, 4, 5];
let fruits = ['apple', 'banana', 'orange'];
```
- 函数（Function）：函数类型用于封装可重用的代码块，可以接收参数并返回值。
```js
function add(a, b) {
  return a + b;
}
```
## 其他数据类型
- 日期（Date）：日期类型用于表示日期和时间。
```js
// 获取当前日期和时间
const currentDate = new Date();
console.log(currentDate);
 
// 获取特定日期和时间
const specificDate = new Date('2023-11-07T09:32:44');
console.log(specificDate);
 
// 获取日期的各个部分
const year = specificDate.getFullYear();
const month = specificDate.getMonth() + 1; // 月份从0开始，需要加1
const day = specificDate.getDate();
const hours = specificDate.getHours();
const minutes = specificDate.getMinutes();
const seconds = specificDate.getSeconds();
console.log(year, month, day, hours, minutes, seconds);
```
- 正则表达式（RegExp）：正则表达式类型用于匹配和处理文本。
```js
// 使用正则表达式匹配字符串
const pattern = /hello/i; // i表示不区分大小写
const str = 'Hello, World!';
const result = pattern.test(str);
console.log(result); // true
 
// 使用正则表达式替换字符串
const pattern2 = /apple/g; // g表示全局匹配
const str2 = 'I have an apple. The apple is red.';
const newStr = str2.replace(pattern2, 'orange');
console.log(newStr); // I have an orange. The orange is red.
 
// 使用正则表达式提取匹配的部分
const pattern3 = /\d+/g; // 匹配连续的数字
const str3 = 'Today is November 7, 2023.';
const matches = str3.match(pattern3);
console.log(matches); // [ '7', '2023' ]
```

