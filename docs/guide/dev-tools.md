# DevTools

## UI框架

Elux并没有魔改各UI框架，所以各UI框架原来的开发习惯和DevTools仍然可以正常使用：

- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Vue DevTools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)

## 状态管理

Elux内置的状态管理与Redux类似，所以可以使用：

- [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

![elux dev-tools](/images/dev-tools.png)

由于Elux中增加了一些新概念，所以它的显示信息与Redux有所不同：

- 左边区域每一条记录表示发生了一次State的修改：
  - 第一个数字表示该Store的ID。
  - *表示该Store已经Inactive，变成了历史快照。
  - 最后的(数字)表示，有多少个ActionHander在监听它(包括reducer+effect)。
- 右边区别对应相关数据，其中第一项为Action:
  - priority：ActionHandler的优先级
  - hanndlers：哪些模块监听了该Action
  - effects：引起这条修改的effect记录
