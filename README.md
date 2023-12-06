# usbuild

🚀 一个基于 [esbuild](https://esbuild.github.io/) 的 [油猴](https://www.tampermonkey.net/) 脚本（UserScript）构建工具，让你的脚本开发像坐火箭一样快！

## Feature

- 🧙‍♂️ 由代码自动变戏法般生成 UserScript [头部注释](https://www.tampermonkey.net/documentation.php)，再也不用头疼这些小细节啦！
- 🔍 智能侦探！构建时自动检测代码中的 GM_API，神奇地生成 [grant](https://www.tampermonkey.net/documentation.php#meta:grant) 属性，让配置变得智能又便捷。
- 🏠 本地开发，dev 模式就像个忍者，悄无声息地监听源文件变化，~~浏览器一刷新~~(加了热重载 feature，告别手动刷新的老旧时代)，脚本就灵活跳跃，无需烦恼反复安装。

## Install

🔮 在 01 世界里敲入这个神秘的咒语，神奇的工具就到手啦！

```shell
npm i -D @linlin00/usbuild
```

## Usage

```javascript
// 🎬 嘿，伙计们！在你的油猴神作之前，别忘了放上这段小小的预备代码哦！
// ⚒️ 脚本一写完，跑一下这个文件，咱们的构建就大功告成了！

import { build } from '@linlin00/usbuild'

// 🚦 别忘了 await 关键词，它就像个红绿灯，让程序乖乖等待，防止冲到浏览器专属函数（比如 alert）那边去，引发一阵混乱。
await build(
    {
        // 🎭 第一个参数是你的 UserScript 配置，就像给你的脚本穿上华丽的戏服。详情可瞄一眼 https://www.tampermonkey.net/documentation.php
        // 🔑 配置的键名是字段名，值可以是潇洒的字符串，或者是风趣的字符串数组。
        name: '圣嘉然警告', // 🎩 name 字段可以选择性消失，如果消失，它会像魔术师一样从文件名中变出来。
        match: ['https://*.bilibili.com/*'],

        // 🕵️‍♂️ 在非 dev 模式下，grant 属性会像智能侦探一样自动进行检测并生成，免去了手动配置的繁琐。
        // 🚀 而在 dev 模式下，为了让开发更加方便快捷，我们直接授予所有权限，就像给开发者提供了一把万能钥匙！
        // grant: ['unsafeWindow', 'GM_setClipboard'],
    },
    {
        // ⚙️ 第二个参数也是个对象，它是构建的小小附加选项。整个对象都可以省略，以下列出的都是默认值。
        dev: false, // 🌆 dev 模式就像是间谍黄昏，会偷偷监听源文件的变动，实现神奇的热重载。
        outdir: 'dist', // 🏠 outdir 会在你的当前目录下的 'dist' 目录里藏起构建后的文件。
        host: '127.0.0.1', // 🏡 host 设定了我们的服务地址，就像定下了我们神秘小屋的地点，确保它既安全又容易找到。
        port: 7100, // 🚪 port 就像是我们小屋的门牌号，指定了访客应该敲哪扇门来找到我们的宝藏。
        autoReload: true, // 🔄 控制是否开启自动刷新的魔法开关（也就是实时热重载）。当源文件变化时，它就像灵巧的小精灵，自动更新网页，让变化瞬间呈现，免去了手动刷新的麻烦！
    }
)

// 🌟 大功告成，这里是你的脚本大显身手的地方！
const 超大声 = alert
超大声('番茄炒蛋拳!')

```

## Community

💬 建了一个 QQ 交流群, 欢迎来玩QAQ

群号: 733165997
