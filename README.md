# usbuild

一个基于 esbuild 的油猴脚本(UserScript)构建工具

## Feature

- 由代码生成 UserScript 头部注释
- 本地开发, dev 模式会监听源文件变化, 浏览器刷新即可重载脚本, 无需反复安装
- 轻量化, 代码精简, 实现简单, 注释丰富, 方便有能力的同学魔改

## Install

```shell
npm i -D @linlin00/usbuild
```

## Usage

```javascript
// 本段需要放在你的正式代码的前面
// 脚本写完之后直接运行本文件即可构建
// 需要使用 usbuild 标记, 这可以在打包时把这段内容去掉
usbuild: {
    // import 语句只能在顶层使用, 标记里只能使用动态 import()
    const { build } = await import('@linlin00/usbuild')

    // 需要 await 关键字, 这样可以让程序不往下运行, 防止 node 运行到只有在浏览器里才有的函数(如 alert)发生报错
    await build(
        {
            // build 的第一个参数是你的 UserScript 的配置, 可参考 https://www.tampermonkey.net/documentation.php
            // 键名为配置的字段名, 值可以是一个字符串也可以是一个字符串数组
            name: 'bilibili helper', // name 字段可以省略, 如果省略会自动从文件名生成
            match: ['https://*.bilibili.com/*', 'https://*.hdslb.com/*'],
            grant: ['unsafeWindow', 'GM_setClipboard']
        },
        {
            // 第二个参数也是一个对象, 是构建的额外选项
            dev: false, // dev 模式会监听源文件的变化以实现简单热重载, 如为 false 则直接安装最终脚本, 默认为 false
            outdir: 'dist' // outdir 会在当前目录下的 'dist' 目录放构建后的文件, 可省略, 默认为 'dist'
        }
    )
}

// 你的脚本内容
alert('QAQ')

```

## 已知问题

- 目前仅支持 ES module
- 如果想开发复杂 UI 或者具有很多资源的大型项目, 本项目可能不适合, 可以看看 [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey), 一个重量级解决方案

## 闲聊

无聊建了一个 QQ 交流群, 欢迎来玩QAQ

群号: 733165997

(有机会一起联机 文明6 啊!)
