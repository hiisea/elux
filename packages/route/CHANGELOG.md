# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.1](https://github.com/hiisea/elux/compare/v2.3.0...v2.3.1) (2022-07-12)


### Bug Fixes

* 路由跳转继承当前classname ([fcec6fc](https://github.com/hiisea/elux/commit/fcec6fce15d2d69b5f57715db535d46c3dfd0a6d))





# [2.3.0](https://github.com/hiisea/elux/compare/v2.2.1...v2.3.0) (2022-07-11)


### Bug Fixes

* react中不能复用Fiber ([6da83b9](https://github.com/hiisea/elux/commit/6da83b96d132d07e96d0eb3cdf882dd94a459bb1))


### Features

* 1.框架不自动处理路由back时的溢出|2.路由跳转如果不指定classname，将沿用当前window的classname ([307ea2a](https://github.com/hiisea/elux/commit/307ea2afac2ef7b7c3c41524417408b3c520c660))
* 路由location中增加state存放任何数据，以替代原来路由跳转方法中的payload参数 ([6a0e423](https://github.com/hiisea/elux/commit/6a0e42383cf9f86740e75521d9dde9e9a3c9bcba))


### BREAKING CHANGES

* 原来router.push({url:'/login'},'page',{data:111}) =>
现在router.push({url:'/login',state:{data:111}},'page')





# [2.2.0](https://github.com/hiisea/elux/compare/v2.1.0...v2.2.0) (2022-06-03)


### Bug Fixes

* 动态设置documentTitle有时出现错误 ([2e6a91a](https://github.com/hiisea/elux/commit/2e6a91a8a76af2452c5cae5d210b58ad29feeaea))


### Features

* 支持路由中断 ([c0de305](https://github.com/hiisea/elux/commit/c0de305b8db416ff701637848aee5f1750c803b8))
* 支持以Dialog的方式跳转路由 ([a53d0de](https://github.com/hiisea/elux/commit/a53d0de41353cdb865d6b61ff1864dd5f1c36c54))





# [2.1.0](https://github.com/hiisea/elux/compare/v2.0.1...v2.1.0) (2022-05-17)


### Features

* 补充部分API ([4ae5479](https://github.com/hiisea/elux/commit/4ae5479380f13d88e8a6686c9eefbafbea1c81b4))





## [2.0.1](https://github.com/hiisea/elux/compare/v2.0.0...v2.0.1) (2022-05-04)


### Bug Fixes

* 某些小程序启动时不能同步获取launchOptions ([63a023b](https://github.com/hiisea/elux/commit/63a023b5ac9afc6b8c936042d4c7773de80c3d45)), closes [#4](https://github.com/hiisea/elux/issues/4)





# [2.0.0](https://github.com/hiisea/elux/compare/v1.2.1...v2.0.0) (2022-04-25)


### Features

* 2.0重构启动 ([1d99a48](https://github.com/hiisea/elux/commit/1d99a486fb57975d6e6f5b130141547f3337ca2d))
* 去除app module ([51986d2](https://github.com/hiisea/elux/commit/51986d26b1bda8ade6f1698578379061952c1d54))
* 支持taro ([01f0890](https://github.com/hiisea/elux/commit/01f0890a9ae365b615d5c07b82515b86ac349555))
* vue支持taro ([d6acd86](https://github.com/hiisea/elux/commit/d6acd864a42b9e3a6964786d6778251efce13ed2))
* vue支持taro ([7cb2cbc](https://github.com/hiisea/elux/commit/7cb2cbc7153c4ac6d1ec15f15265439094a5a259))





## [1.2.1](https://github.com/hiisea/elux/compare/v1.2.0...v1.2.1) (2022-02-24)


### Bug Fixes

* 路由跳转错误 ([9d00945](https://github.com/hiisea/elux/commit/9d00945535dfbea5705011ac5ea1c4234e7c5d3d))





# [1.2.0](https://github.com/hiisea/elux/compare/v1.1.0...v1.2.0) (2022-02-24)

**Note:** Version bump only for package @elux/route





# [1.1.0](https://github.com/hiisea/elux/compare/v1.0.1...v1.1.0) (2022-02-16)


### Features

* 支持devTools ([64fe932](https://github.com/hiisea/elux/commit/64fe932b5a7a57332e2220dbe2acaadc20cff426))


### Performance Improvements

* 隐藏HistoryRecodrd多余导出细节 ([8c431dc](https://github.com/hiisea/elux/commit/8c431dc5594490f0e9fbc90790e5b4578c94bc9b))





## [1.0.1](https://github.com/hiisea/elux/compare/v1.0.0...v1.0.1) (2021-12-12)

**Note:** Version bump only for package @elux/route
