# JavaScript异常处理
&emsp;&emsp;在JavaScript中，异常是指在代码执行过程中发生的错误或意外情况。异常处理是一种机制，用于捕获和处理这些异常，以避免程序崩溃或产生意外结果。JavaScript提供了一些关键字和语句，用于实现异常处理。

## try-catch-finally块
try-catch-finally块是JavaScript中异常处理的核心部分。它由三个关键字组成：

- try：在try块中编写可能引发异常的代码。
- catch：在catch块中定义异常处理逻辑，用于捕获并处理异常。
- finally：在finally块中编写无论是否发生异常都要执行的代码。
以下是try-catch-finally块的基本语法：
```js
try {
  // 可能引发异常的代码
} catch (error) {
  // 异常处理逻辑
} finally {
  // 最终执行的代码
}
```
## 抛出异常
&emsp;&emsp;在JavaScript中，我们可以使用throw语句手动抛出异常。throw语句接受一个异常对象作为参数，可以是内置的Error对象或自定义的对象。抛出异常后，代码的执行将立即停止，并跳转到最近的catch块。

以下是抛出异常的示例代码：
```js
function divide(a, b) {
  if (b === 0) {
    throw new Error("除数不能为零");
  }
  return a / b;
}
 
try {
  var result = divide(10, 0);
  console.log(result);
} catch (error) {
  console.log("捕获到异常：" + error.message);
}
```
## 捕获异常
&emsp;&emsp;在catch块中，我们可以访问捕获到的异常对象，并根据需要执行适当的处理逻辑。异常对象包含有关异常的信息，例如错误消息和堆栈跟踪。

以下是捕获异常的示例代码：
```js
try {
  var result = divide(10, 0);
  console.log(result);
} catch (error) {
  console.log("捕获到异常：" + error.message);
}
```
## 其他相关知识点
- 多重catch块
多重catch块允许我们根据不同类型的异常来执行不同的处理逻辑。在try块中，我们可以使用多个catch块来捕获不同类型的异常，并分别处理它们。
```js
try {
  // 可能会引发异常的代码
} catch (error1) {
  // 处理 error1 类型的异常
} catch (error2) {
  // 处理 error2 类型的异常
} catch (error3) {
  // 处理 error3 类型的异常
} finally {
  // 无论是否发生异常，都会执行的代码
}
```
&emsp;&emsp;在上面的示例中，如果try块中的代码引发了异常，JavaScript会按照catch块的顺序检查异常类型，并执行与匹配的catch块关联的代码块。如果没有匹配的catch块，异常将被传递到上一级的异常处理程序。

- 全局异常处理
&emsp;&emsp;全局异常处理是一种在应用程序的整个范围内捕获和处理异常的方法。通过在window对象上注册一个全局的错误处理函数，我们可以捕获未被任何try-catch块处理的异常，并执行相应的处理逻辑。
```js
window.onerror = function(message, url, line, column, error) {
  // 处理全局异常的代码
};
```
&emsp;&emsp;在上面的示例中，当发生未被捕获的异常时，onerror函数将被调用，并传递异常的相关信息。我们可以在该函数中编写逻辑来记录错误、发送错误报告或执行其他自定义操作。

- 自定义异常类型
&emsp;&emsp;在JavaScript中，我们可以通过创建自定义异常类型来表示特定的错误或异常情况。通过继承Error对象，我们可以定义自己的异常类型，并添加自定义的属性和方法。
```js
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CustomError';
  }
 
  // 自定义方法
  customMethod() {
    // 执行自定义逻辑
  }
}
 
// 抛出自定义异常
throw new CustomError('This is a custom error');
```