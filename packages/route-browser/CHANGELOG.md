# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.6.1](https://github.com/hiisea/elux/compare/v2.6.0...v2.6.1) (2022-08-09)

**Note:** Version bump only for package @elux/route-browser





# [2.6.0](https://github.com/hiisea/elux/compare/v2.6.0-alpha.4...v2.6.0) (2022-08-02)

### Features

- 拆分与UI框架无关的model专用包 ([b2a2809](https://github.com/hiisea/elux/commit/b2a2809ea10f29af24fb70d4a3a83d82564ddbef))
- 支持无UI、纯Model ([3c6c083](https://github.com/hiisea/elux/commit/3c6c0832626e92277d214b4e6633e79d9b13d03c))
- 不再打包react-redux，项目请自行安装

## [2.5.1](https://github.com/hiisea/elux/compare/v2.5.0...v2.5.1) (2022-07-20)

### Bug Fixes

- 在SSR时调用了env.addEventListener ([7c163b4](https://github.com/hiisea/elux/commit/7c163b475d9b0f642f092f4a50ae08f818b42c04))

# [2.4.0](https://github.com/hiisea/elux/compare/v2.3.4...v2.4.0) (2022-07-16)

### Features

- 支持router.back('')传空值表示退出本站 ([987cbc3](https://github.com/hiisea/elux/commit/987cbc3800eb0c0296ad4488427bfa3abce7f3db))

## [2.3.4](https://github.com/hiisea/elux/compare/v2.3.3...v2.3.4) (2022-07-16)

### Bug Fixes

- 去除history依赖引起的bug ([3ccc192](https://github.com/hiisea/elux/commit/3ccc192dc04f33194d8b374f768dc1e61e86e469))

## [2.3.3](https://github.com/hiisea/elux/compare/v2.3.2...v2.3.3) (2022-07-16)

### Bug Fixes

- 无法强制退出应用 ([acad73c](https://github.com/hiisea/elux/commit/acad73cd9c9b618ae7bd03a52e45a8e6851aca69))

## [2.3.2](https://github.com/hiisea/elux/compare/v2.3.1...v2.3.2) (2022-07-16)

**Note:** Version bump only for package @elux/route-browser

## [2.3.1](https://github.com/hiisea/elux/compare/v2.3.0...v2.3.1) (2022-07-12)

**Note:** Version bump only for package @elux/route-browser

# [2.3.0](https://github.com/hiisea/elux/compare/v2.2.1...v2.3.0) (2022-07-11)

### Features

- 1.框架不自动处理路由back时的溢出|2.路由跳转如果不指定classname，将沿用当前window的classname ([307ea2a](https://github.com/hiisea/elux/commit/307ea2afac2ef7b7c3c41524417408b3c520c660))

# [2.2.0](https://github.com/hiisea/elux/compare/v2.1.0...v2.2.0) (2022-06-03)

### Features

- 支持以Dialog的方式跳转路由 ([a53d0de](https://github.com/hiisea/elux/commit/a53d0de41353cdb865d6b61ff1864dd5f1c36c54))

# [2.1.0](https://github.com/hiisea/elux/compare/v2.0.1...v2.1.0) (2022-05-17)

**Note:** Version bump only for package @elux/route-browser

## [2.0.1](https://github.com/hiisea/elux/compare/v2.0.0...v2.0.1) (2022-05-04)

### Bug Fixes

- 某些小程序启动时不能同步获取launchOptions ([63a023b](https://github.com/hiisea/elux/commit/63a023b5ac9afc6b8c936042d4c7773de80c3d45)), closes [#4](https://github.com/hiisea/elux/issues/4)

# [2.0.0](https://github.com/hiisea/elux/compare/v1.2.1...v2.0.0) (2022-04-25)

### Features

- 2.0重构启动 ([1d99a48](https://github.com/hiisea/elux/commit/1d99a486fb57975d6e6f5b130141547f3337ca2d))
- 去除app module ([51986d2](https://github.com/hiisea/elux/commit/51986d26b1bda8ade6f1698578379061952c1d54))
- 支持taro ([01f0890](https://github.com/hiisea/elux/commit/01f0890a9ae365b615d5c07b82515b86ac349555))
- vue支持taro ([7cb2cbc](https://github.com/hiisea/elux/commit/7cb2cbc7153c4ac6d1ec15f15265439094a5a259))

## [1.2.1](https://github.com/hiisea/elux/compare/v1.2.0...v1.2.1) (2022-02-24)

**Note:** Version bump only for package @elux/route-browser

# [1.2.0](https://github.com/hiisea/elux/compare/v1.1.0...v1.2.0) (2022-02-24)

**Note:** Version bump only for package @elux/route-browser

# [1.1.0](https://github.com/hiisea/elux/compare/v1.0.1...v1.1.0) (2022-02-16)

**Note:** Version bump only for package @elux/route-browser

## [1.0.1](https://github.com/hiisea/elux/compare/v1.0.0...v1.0.1) (2021-12-12)

**Note:** Version bump only for package @elux/route-browser
