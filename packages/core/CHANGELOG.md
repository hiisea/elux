# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.6.1](https://github.com/hiisea/elux/compare/v2.6.0...v2.6.1) (2022-08-09)


### Bug Fixes

* 小程序中路由back(1,'page')时，会通知原生路由 ([086c100](https://github.com/hiisea/elux/commit/086c100c08d78aff31a1b8b2e04076198281b0e2))





# [2.6.0](https://github.com/hiisea/elux/compare/v2.6.0-alpha.4...v2.6.0) (2022-08-02)

### Features

- 拆分与UI框架无关的model专用包 ([b2a2809](https://github.com/hiisea/elux/commit/b2a2809ea10f29af24fb70d4a3a83d82564ddbef))
- 支持无UI、纯Model ([3c6c083](https://github.com/hiisea/elux/commit/3c6c0832626e92277d214b4e6633e79d9b13d03c))
- 不再打包react-redux，项目请自行安装

# [2.4.0](https://github.com/hiisea/elux/compare/v2.3.4...v2.4.0) (2022-07-16)

### Features

- 支持router.back('')传空值表示退出本站 ([987cbc3](https://github.com/hiisea/elux/commit/987cbc3800eb0c0296ad4488427bfa3abce7f3db))

## [2.3.3](https://github.com/hiisea/elux/compare/v2.3.2...v2.3.3) (2022-07-16)

### Bug Fixes

- 无法强制退出应用 ([acad73c](https://github.com/hiisea/elux/commit/acad73cd9c9b618ae7bd03a52e45a8e6851aca69))

## [2.3.2](https://github.com/hiisea/elux/compare/v2.3.1...v2.3.2) (2022-07-16)

### Bug Fixes

- vue路由切换时被强制刷新 ([d7a28ca](https://github.com/hiisea/elux/commit/d7a28cac20f3febd8592d68d4eca71c666798b41))

# [2.3.0](https://github.com/hiisea/elux/compare/v2.2.1...v2.3.0) (2022-07-11)

### Bug Fixes

- react中不能复用Fiber ([6da83b9](https://github.com/hiisea/elux/commit/6da83b96d132d07e96d0eb3cdf882dd94a459bb1))

### Features

- 1.框架不自动处理路由back时的溢出|2.路由跳转如果不指定classname，将沿用当前window的classname ([307ea2a](https://github.com/hiisea/elux/commit/307ea2afac2ef7b7c3c41524417408b3c520c660))
- 路由location中增加state存放任何数据，以替代原来路由跳转方法中的payload参数 ([6a0e423](https://github.com/hiisea/elux/commit/6a0e42383cf9f86740e75521d9dde9e9a3c9bcba))

### BREAKING CHANGES

- 原来router.push({url:'/login'},'page',{data:111}) =>
现在router.push({url:'/login',state:{data:111}},'page')

# [2.2.0](https://github.com/hiisea/elux/compare/v2.1.0...v2.2.0) (2022-06-03)

### Bug Fixes

- 动态设置documentTitle有时出现错误 ([2e6a91a](https://github.com/hiisea/elux/commit/2e6a91a8a76af2452c5cae5d210b58ad29feeaea))
- 修复demote兼容IE时的私有Action错误 ([defb0f6](https://github.com/hiisea/elux/commit/defb0f6d791d3dd536ef1e98531b52b4efb28f95))

### Features

- 新增方法moduleExists用于探测模块是否存在 ([910940a](https://github.com/hiisea/elux/commit/910940aedc5729328cb34e2f06dc2f481a650790))
- 支持路由中断 ([c0de305](https://github.com/hiisea/elux/commit/c0de305b8db416ff701637848aee5f1750c803b8))
- 支持以Dialog的方式跳转路由 ([a53d0de](https://github.com/hiisea/elux/commit/a53d0de41353cdb865d6b61ff1864dd5f1c36c54))

# [2.1.0](https://github.com/hiisea/elux/compare/v2.0.1...v2.1.0) (2022-05-17)

### Bug Fixes

- 修正RouterInitOptions类型定义错误 ([54b2406](https://github.com/hiisea/elux/commit/54b2406fa328f690cde45094c9e20f5d114b2694)), closes [#7](https://github.com/hiisea/elux/issues/7)

### Features

- 补充部分API ([4ae5479](https://github.com/hiisea/elux/commit/4ae5479380f13d88e8a6686c9eefbafbea1c81b4))

## [2.0.1](https://github.com/hiisea/elux/compare/v2.0.0...v2.0.1) (2022-05-04)

### Bug Fixes

- 某些小程序启动时不能同步获取launchOptions ([63a023b](https://github.com/hiisea/elux/commit/63a023b5ac9afc6b8c936042d4c7773de80c3d45)), closes [#4](https://github.com/hiisea/elux/issues/4)

# [2.0.0](https://github.com/hiisea/elux/compare/v1.2.1...v2.0.0) (2022-04-25)

### Features

- 2.0重构启动 ([1d99a48](https://github.com/hiisea/elux/commit/1d99a486fb57975d6e6f5b130141547f3337ca2d))
- 去除app module ([51986d2](https://github.com/hiisea/elux/commit/51986d26b1bda8ade6f1698578379061952c1d54))
- 支持taro ([01f0890](https://github.com/hiisea/elux/commit/01f0890a9ae365b615d5c07b82515b86ac349555))
- vue支持taro ([d6acd86](https://github.com/hiisea/elux/commit/d6acd864a42b9e3a6964786d6778251efce13ed2))
- vue支持taro ([7cb2cbc](https://github.com/hiisea/elux/commit/7cb2cbc7153c4ac6d1ec15f15265439094a5a259))
