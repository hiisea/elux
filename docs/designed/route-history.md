# 路由与历史

我们最熟悉的路由与历史的管理方案是浏览器的HistoryAPI，几个简单的`push/replace/back/go`方法就已经能够完成所有路由功能，但有时候有没有感觉到它们不够用呢？

来举个例子，某应用有3个页面：

- 首页 /home
- 商品列表 /goodsList
- 我的购物车 /shoppingCart

## 我们需要保存历史快照的能力

假设用户依次浏览了：

1. 首页 /home
2. 商品列表 /goodsList `<-`

此时用户想回到首页home，有二种路由方法让他到达:`push('/home')`或者`back()`,这二种方法有什么样的不同呢？

- 历史记录栈的结果不同：push应当保持当前记录，然后新建一条访问记录；而back应当销毁当前记录，回到前一条记录。

- 目标页面的呈现结果不同：push应当给用户重建home页面，包括最新的数据和清空之前的行为结果（如滚动位置、展开的面板等）；而back应当保持原来home页面的所有元素及行为结果（包括滚动位置、展开的面板等）。

可见要实现友好的`back()`方案，就需要在离开页面时将它作为一个历史快照完整的保存下来，包括其中的各种数据、界面元素和行为信息等，而不仅仅只是一条URL记录。但是浏览器没提供这种快照保存的能力，而我们往往简单粗暴的统一处理为`刷新重建`，这也WebApp用户体验被人诟病的原因之一。

## 我们需要二维的历史栈

假设用户依次浏览了：

1. 首页 /home
2. 商品列表 /goodsList
3. 商品列表-第2页 /goodsList?page=2
4. 商品列表-第3页 /goodsList?page=3 `<-`

此时用户想回到首页home，并保持之前home页面所有的行为结果（如滚动位置、展开的面板等）,那他是否得点击3次后退才能到达？这显然不是一个好的用户体验。

或者你会说可以使用`back(3)`来直接后退3步，可是其一：你如何动态的计算出3这个的步数？其二：如果用户看了50页，超过了你历史栈的最大长度，`/home`这条记录直接被冲走了怎么办？

或者你又想出了一个办法，在商品列表翻页时使用路由的`replace()`方法不产生新的历史记录，可假如此时用户又想回到`第2页`去看一看呢？作为产品设计者你应当考虑用户所有可能的意图。

那应当怎么做呢？

> 一维的历史栈已经满足不了我们的场景，我们需要设计二维的历史栈。

假设我们在进入`/goodsList`时开启一个全新的历史栈，后面的翻页跳转都基于这个新的历史栈来记录：

1. 首页 /home
   1. 商品列表 /goodsList
   2. 商品列表-第2页 /goodsList?page=2
   3. 商品列表-第3页 /goodsList?page=3 `<-`

这样我们调用子栈的`back()`就是回到`商品列表第2页`，而调用父栈的`back()`就是回到`首页`，而且在子栈内翻页再多也不会把父栈的记录溢出了。

## 我们需要访问栈内记录的能力

假设`商品列表`页面有链接指向`我的购物车`，而`我的购物车`页面又有链接指向`商品列表`，这样就可能形成“循环跳转”，比如：

1. 首页 /home
2. 商品列表 /goodsList
3. 我的购物车 /shoppingCart
4. 商品列表 /goodsList
5. 我的购物车 /shoppingCart `<-`

此时用户想回到首页home，并保持之前home页面所有的行为结果（如滚动位置、展开的面板等）,那他得点击4次后退才能到达。

如果我们拥有访问栈内记录的能力，那么在打开`商品列表`页面之前，我们可以先查找一下当前的历史栈中是否存在`商品列表`记录，如果没有则`push('/goodsList')`，如果有则`back(2)`

## 我们需要清空历史栈的能力

过多的历史记录不仅会占用大量内存空间，还可能造成用户对自己行为的迷糊。及时清空无用的历史栈，科学合理的记录用户的访问历史，也是产品设计的一部分。

## 我们需要兼顾体验和性能的策略

保存历史记录需要占用存储资源，不同保存方案差别很大，比如：

- 仅保存URL记录。占用空间最小，但是回退时需要：获取数据 > 重构UI（丢失原来的行为结果）
- 保存数据状态。占用空间较小，回退时免去了获取数据这一步，直接重构UI（丢失原来的行为结果）
- 保存数据状态和界面元素。占用空间很大，回退时无需任何重构，用户体验好（保持原来的行为结果）

以上三种方案各有优劣，如果我们单一的选择其中的任何一种方案，都不是聪明的抉择。而最佳的做法是：找到`某种策略`将它们有机的结合起来，有规则和节制的使用重资产，在用户体验和性能之间得到一种妥协的平衡。

## Elux中的双栈单链虚拟路由

Elux为了实现以上诉求，没有依赖任何平台的原生路由系统，而是自己创建了一个带二维历史记录栈的虚拟路由，它有点类似于浏览器：

![elux虚拟路由示意图1](/images/router-browser.svg)

### 双栈

- PageHistoryStack - 类似于我们Web开发中常用的window.history，每`push(...)`一条url都会产生一条历史记录
- WindowHistoryStack - 类似于浏览器的TabStack，也就是说在某个时间点，我们可以选择开启一个新的窗口，从而创建一条新的PageHistoryStack

### 单链

于浏览器不同的是，浏览器中的Tab窗口可以任意切换，而Elux中的WindowHistoryStack是一条根据时间排序的历史栈。
虽然可以存在多条PageHistoryStack，但我们简化方案，只允许操作其中最近的一条栈，这就是Elux创新的`双栈单链`方案。

### 虚拟多页

PageHistoryStack中保存的只是一条简单的URL，这意味着如果发生回退，它需要重构页面，丢失原来的行为结果（类似于SPA单页）；同时也意味着它占用最小的内存空间。

WindowHistoryStack中保存的是界面元素和数据，这意味着如果发生回退，它可以完整的呈现历史快照，而且可以做到漂亮的转场动画效果；同时也意味着它将消耗很大的内存空间，正因为如此，所以限制了它的栈数最大为`10`。

这便是前面我们提到的找到体验和性能之间的平衡策略。

### 路由动作

也许你会说，WindowHistoryStack用户体验很好，可是最多只能打开10层，够用吗？

如果你还是以传统的网页思维来设计和开发应用，遇到路由跳转就是`push()`，那肯定再多层级都不够用，别忘了我们还有其它几个动作可以跳转：

- push 保持当前历史记录，增加一条新记录
- replace 替换当前历史记录
- relaunch 清空当前历史记录，增加一条新记录
- back 回退历史记录

如果你能充分利用这几个不同的路由动作，用巧妙的交互设计引导用户维护好自己历史记录栈，那么它是够用的。