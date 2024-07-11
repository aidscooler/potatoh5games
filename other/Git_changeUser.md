# Git账户切换
## 查看当前用户配置
```shell
git config --global user.name 
git config --global user.email 
```
## 设置账号
设置你的名字和邮箱
```shell
git config --global user.name “大宝贱”
git config --global user.email “12@git.com”
```

## 清除上一个账户的信息
当clone仓库出现403无权限时
你需要密码的设置
先要清除上一个账户的信息，复制出现403无权限的   session,执行以下命令
```shell
git config --system --unset credential.helper
```
然后clone仓库时就会提示输入你的密码了，

## 记住git密码
```shell
git config --global credential.helper store
```

到这里就完成的git账号的切换
