# MySQL8.0.28安装配置教程
## 下载并配置安装文件

### 进入官网下载mysql安装包
<p align="center"><img src="/blogimage/MySQL/1.png"></p> 

### 解压安装包，如下图所示
<p align="center"><img src="/blogimage/MySQL/2.png"></p> 

### 添加配置文件my.ini

新建一个文本文件，将下列内容复制到文件中，并将文件另存为.ini格式
```ini
[mysqld]
# 设置3306端口
port=3306
# 设置mysql的安装目录
basedir=D:\\Program Files\\MySQL
# 允许最大连接数
max_connections=200
# 允许连接失败的次数。
max_connect_errors=10
# 服务端使用的字符集默认为utf8mb4
character-set-server=utf8mb4
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
# 默认使用“mysql_native_password”插件认证
#mysql_native_password
default_authentication_plugin=mysql_native_password
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8mb4
[client]
# 设置mysql客户端连接服务端时默认使用的端口
port=3306
default-character-set=utf8mb4
```
**注意**： basedir 为mysql的安装目录，根据自己的喜好可以自行设定

### 创建mysql安装目录

&emsp;&emsp;此处创建的安装目录就是在my.ini中配置的 basedir的路径，如果配置的目录已经存在则无需再创建了，若没有则需要创建。

### 将之前下载的MYSQL文件和新添加的my.ini文件复制到此文件夹下。

## 配置环境变量

### 打开控制面板，并选择系统，如下图所示

<p align="center"><img src="/blogimage/MySQL/3.png"></p> 

### 选择高级选项，打开环境变量

<p align="center"><img src="/blogimage/MySQL/4.png"></p> 

### 在Path环境变量中 增加MYSQL安装目录的bin目录，如下图所示
<p align="center"><img src="/blogimage/MySQL/5.png"></p> 


## 安装并初始化MYSQL

### 进入C:\Windows\System32目录下，找到cmd.exe，右键选择“以管理员身份运行”

<p align="center"><img src="/blogimage/MySQL/6.png"></p> 

### 输入以下命令，进入到安装文件的bin目录下
```shell
cd /d D:\Program Files\MySQL\bin
```

<p align="center"><img src="/blogimage/MySQL/7.png"></p> 

### 执行初始化命令 mysqld --initialize --console，如下图所示
<p align="center"><img src="/blogimage/MySQL/8.png"></p> 

### 执行安装命令  
```shell
mysqld –install
```
<p align="center"><img src="/blogimage/MySQL/9.png"></p> 

### 执行启动MySQL服务命令
```shell
net start mysql
```

<p align="center"><img src="/blogimage/MySQL/10.png"></p> 

## 更改初始化密码

### 使用Navicat连接mysql
<p align="center"><img src="/blogimage/MySQL/11.png"></p> 

### 新建连接
<p align="center"><img src="/blogimage/MySQL/12.png"></p> 


### 连接成功以后，会提示密码过期，输入新密码即可
<p align="center"><img src="/blogimage/MySQL/13.png"></p> 


