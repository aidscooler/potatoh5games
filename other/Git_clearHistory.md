# Git清除提交记录
&emsp;&emsp;Git仓库的历史提交记录是无法删除的，但是某些情况下我们可能需要将提交记录清除，让所有文件变为首次提交。可以通过复制master分支，然后删除master，将新的分支覆盖到master。从而实现清除历史提交记录。下面是操作步骤。

## 检出新的分支
使用Checkout命令来创建一个新的分支
其中 orphan参数用于创建没有commit记录的分支
```shell
$ git checkout --orphan latest_branch
```
## 将所有文件添加到新的分支
```shell
$ git add -A
```
## commit 并且添加描述
```shell
$ git commit -am "第一次提交"
```
## 删除之前的主分支
```shell
$ git branch -D master
```
## 将当前分支重命名为master
```shell
$ git branch -m master
```
## 强制更新到主分支
```shell
$ git push -f origin master
```
## 查看日志
```shell
$ git log
```

