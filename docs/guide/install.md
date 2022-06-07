# 安装与配置

Elux 项目基于 node，推荐使用较新的 node 环境（>=14.0.0）

## 采用Cli命令安装

### 安装 @elux/cli-init

首先，你需要使用 npm 或者 npx 全局安装 @elux/cli-init

```bash
npm install -g @elux/cli-init
```

### 初始化新工程

在终端中执行 `elux-init` 即可开始新建工程向导

```bash
elux-init
```

### 安装依赖注意事项

- 推荐使用Gitee源，Github源在国内不是很稳定，可能需要翻墙。
- 由于模版中使用了`npm-workspace`，推荐使用yarn安装依赖，如果使用npm，请保证版本>=7
- 模版默认会拉取`lock文件`，这样会锁定各依赖版本，如果你比较激进，可以不使用它们。
- @types/react 类型文件最好只安装一个版本，多版本可能冲突。

## 关于Taro项目

模版中的Taro项目基于`Taro特定版本`制作，开箱即用，但可能版本滞后。如果想使用官方**最新版本**，也可以自己在Taro项目中安装Elux，参见[Taro小程序
](/guide/platform/taro.html#手动安装Elux)
