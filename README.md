### webpack 热更新开发+接口代理

1.  思路很简单就是利用 webpack 直接复制资源从源文件到打包目录下 dist,这样就可以保证原生开发的一切效果

2.  页面模板还是 src/index.html,所有的资源文件 src/assets 会被直接复制到 dist 目录下，包括 index.html

3.  这种其实可以说是相当于直接把 src 下的东西复制的一份到 dist 下，这样保证开发是的各种资源引入都是和打包后的是一致的

4.  虽然没有利用到 webpack 强大的资源打包特性，简化了开发流程，保证后续的部署是很方便的

5.  output 输出端的 bundle.js 意义不大，源码中是直接引入 index.js 的方式，所以部署的时候可以直接删除掉，同时要避免处理下 dist 目录下
    打包的 index.html 中自动添加了 bundle.js 的引用，需要删掉

6.  使用 webpack 主要还是利用了 devServer 以及开发时的热更新，方便快速调样式

7.  存在的问题：打包后会有 bundle.js 文件输出，这个需要处理一下，一个是删除，另一个是 dist 下 index.html 中 bundle.js 的引用要删除

### 兼容性问题

1. webpack-dev-server@3.x 不兼容 webpack-cli@4.x, 请降级 webpack-cli

2. ttf格式的字体文件兼容性有问题，转为woff  https://segmentfault.com/q/1010000014798074

