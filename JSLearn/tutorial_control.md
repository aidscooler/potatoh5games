# JavaScript流程控制语法
&emsp;&emsp;JavaScript是一种广泛应用于Web开发的脚本语言，控制流程是编写JavaScript程序时至关重要的一部分。掌握各种控制流程语句可以让你的代码更具逻辑性和灵活性。本文将介绍JavaScript中常用的控制流程语句，包括条件语句（if、else if、else）、循环语句（for、while、do-while）、分支语句（switch、case、break）

# 条件语句
条件语句用于根据不同的条件执行不同的代码块。

- if语句：根据条件的真假来执行相应的代码块。
```js
let num = 10;
if (num > 0) {
  console.log("Number > 0");
}
```
- else if语句：用于在if条件不满足的情况下，检查额外的条件并执行相应的代码块。
```js
let num = -5;
if (num > 0) {
  console.log("Number > 0");
} else if (num < 0) {
  console.log("Number < 0");
} else {
  console.log("Number == 0");
}
```
- else语句：在if和else if条件都不满足时执行相应的代码块。
```js
let num = 0;
if (num > 0) {
  console.log("Number > 0");
} else if (num < 0) {
  console.log("Number < 0");
} else {
  console.log("Number == 0");
}
```
# 循环语句
循环语句用于重复执行一段代码，直到满足特定条件为止。

- for循环：通过指定初始条件、终止条件和每次迭代的操作来重复执行代码块。
```js
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```
- while循环：在指定条件为真时重复执行代码块。
```js
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
```
- do-while循环：先执行一次代码块，然后在指定条件为真时重复执行。
```js
let i = 0;
do {
  console.log(i);
  i++;
} while (i < 5);
```
# 分支语句
分支语句用于根据不同的情况执行相应的代码块。

- switch语句：根据表达式的值选择要执行的代码块。
```js
let num = 3;
switch (num) {
  case 1:
    console.log("No 1");
    break;
  case 2:
    console.log("No 2");
    break;
  case 3:
    console.log("No 3");
    break;
  default:
    console.log("Invalid num");
}
```