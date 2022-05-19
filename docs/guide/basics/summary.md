---
prev: /guide/configure.html
---

# 概述

## 基本结构图

![elux静态结构图](/images/static-structure.svg)

## 基本逻辑图

![elux动态逻辑图](/images/dynamic-structure.svg)

## 工程结构举例

```text
├── env //可以定义多套不同的配置方案
│    ├── local //该目录中的内容可以覆盖../public和../elux.config.js
│    ├── test //该目录中的内容可以覆盖../public和../elux.config.js
│    └── online //该目录中的内容可以覆盖../public和../elux.config.js
├── dist //编译输出目录，按不同环境存放
│    ├── local 
│    ├── test 
│    └── online
├── mock //模拟API假数据
├── public //该目录下的文件将直接copy到dist
├── src
│    ├── assets //公用的图片等静态资源
│    ├── components //公用的UI组件
│    ├── modules
│    │      ├──  ModuleA
│    │      │     ├── assets //ModuleA专用的图片等静态资源
│    │      │     ├── components //ModuleA中用到的UI组件
│    │      │     ├── views //ModuleA中的业务视图
│    │      │     ├── entity.ts //ModuleA中用到的业务实体定义
│    │      │     ├── model.ts //ModuleA的业务模型
│    │      │     └── index.ts //ModuleA对外封装与导出
│    │      ├── ModuleB
│    │      └── ModuleC
│    ├── Global.ts //将一些常用方法和变量导出
│    ├── Project.ts //项目设置
│    └── index.ts //项目入口文件
├── elux.config.js //elux配置
├── package.json
```
