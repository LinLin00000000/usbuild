import path from 'path'
import open from 'open'
import fs from 'fs/promises'
import esbuild from 'esbuild'

// 🚀 构建函数，让你的油猴脚本起飞！
export async function build(
    userScriptConfig = {},
    { dev = false, outdir = 'dist' } = {}
) {
    // 🌟 获取调用这个函数的文件的路径，就像一名神秘的探险家寻找宝藏地图。
    const filePath = getCallerFilePath()

    // 🧭 分析文件路径，提取出文件名和目录，就像解开一个古老的谜题。
    const { name: fileName, dir: fileDir } = path.parse(filePath)

    // 📝 如果用户没有指定脚本名，我们就从文件名中获取，就像从石头中雕刻出雕像。
    userScriptConfig.name =
        userScriptConfig.name ?? fileName.replace(/[-_]/g, ' ')

    // 🏠 确定最终的输出目录，给我们的脚本一个温馨的家。
    const finalOutdir = path.join(fileDir, outdir)

    // 📦 配置 esbuild，让你的代码像魔法一样自动转化并打包。
    const ctx = await esbuild.context({
        entryPoints: [filePath],
        bundle: true,
        outdir: finalOutdir,
        charset: 'utf8',
        outExtension: { '.js': '.user.js' },
        banner: {
            js: bannerBuilder(userScriptConfig),
        },
        dropLabels: ['usbuild'],
    })

    // 🔍 如果是开发模式，我们会像侦探一样密切关注代码的每一个变化。
    if (dev) {
        await ctx.watch()

        /**
         * 📑 为了避免反复像洗衣机一样安装脚本，我们施展了一个小小的魔法：创建一个中间脚本。
         * 这个中间脚本就像是一个神奇的桥梁，它通过 @require file://**** 这样一条神秘的路径，巧妙地连接到我们打包后的文件。
         * 这样的好处是显而易见的——你只需安装这个中间脚本一次，它就会永远忠诚地为你服务，同时保持轻巧，因为它只包含了必要的脚本元数据，而没有一丁点代码的负担。
         * 每当你的源文件有所变动，只需要让你的浏览器做个伸展操般的刷新，变化就会立刻展现在你眼前，就像变魔术一样神奇又有趣！
         */

        generateMetaFile: {
            const extraRequire = `file://${path.join(
                finalOutdir,
                fileName + '.user.js'
            )}`

            // 📚 处理 require 字段，确保它能够包含所有必要的依赖。
            const originRequire = userScriptConfig.require
            const require = Array.isArray(originRequire)
                ? [...originRequire, extraRequire]
                : isEmptyString(originRequire)
                ? extraRequire
                : [originRequire, extraRequire]

            // 📖 生成只包含元数据的文件，轻巧而又不失精确。
            const metaContent = bannerBuilder({
                ...userScriptConfig,
                require,
            })
            const metaFilePath = path.join(
                finalOutdir,
                fileName + '.meta.user.js'
            )
            await fs.writeFile(metaFilePath, metaContent)
        }

        console.log('👀 watching...')
    } else {
        // 🚚 在非开发模式下，我们一举完成构建，一切都准备就绪！
        console.log('🚀 building...')
        await ctx.rebuild()
        console.log('🌈 build done!')
    }

    // 🎁 安装脚本的过程就像是向用户赠送一份精心准备的礼物。
    installScript: {
        // 📄 首先，确定最终脚本的文件名。如果是开发模式，我们使用带有“.meta.user.js”的中间文件。
        const outScriptFileName =
            fileName + (dev ? '.meta.user.js' : '.user.js')

        // 🌐 接着，创建一个临时的 HTML 文件，作为脚本安装的启动器。这就像是准备一张邀请函，邀请用户体验我们的脚本。
        const tmpFileName = fileName + '.html'
        const tmpFilePath = path.join(finalOutdir, tmpFileName)

        // ✍️ 然后，写入 HTML 内容。这段简单的脚本会引导浏览器自动打开并安装我们的油猴脚本，就像魔法一样！
        const htmlContent = `<script>location.href = './${outScriptFileName}'; window.close()</script>`
        await fs.writeFile(tmpFilePath, htmlContent)

        // 🚀 打开这个临时 HTML 文件，开始安装过程。这就像按下启动按钮，开始我们的脚本安装之旅。
        await open(tmpFilePath)

        // ⏱️ 给系统一点时间处理文件，就像沏一壶好茶静静等待其慢慢酝酿。
        await new Promise(resolve => {
            setTimeout(async () => {
                // 🧹 安装完毕后，清理临时文件，保持我们的环境整洁如新。
                await fs.unlink(tmpFilePath)
                
                // 💥 当我们不在开发模式下，就给系统来一个小小的“停机震撼”，优雅地退出进程。
                if (!dev) {
                    // Mission completed!
                    process.exit(0)
                }
            }, 2000)
        })
    }
}

// 🧙‍♂️ 使用一点黑魔法来获取调用者文件的路径，但别忘了，魔法总是神秘莫测哒！
function getCallerFilePath() {
    // 🕵️‍♂️ 创建一个错误对象，它会揭示调用堆栈的秘密。
    const err = new Error()
    const stack = err.stack

    // 🧩 将堆栈信息切割成多行，从中找出我们需要的线索。
    const stackLines = stack.split('\n')

    // 🕵️‍♂️ 在堆栈的迷宫中，第一行通常是 'Error'，它像是一个告示牌，告诉我们出现了错误。
    // 第二行是当前函数的呼唤，就像是留下的脚印。第三行则是 usbuild 函数的召唤，它标志着我们的起点。
    // 所以，第四行才是我们真正的宝藏——实际的调用者，就像是藏宝图上标记的X。
    const callerLine = stackLines[3]

    // 🔗 捕获文件路径，就像取得了宝藏。
    const match = callerLine.match(/(?:file:\/\/\/|[(])([^]+?):\d+:\d+/)

    if (match && match[1]) {
        // 🌟 如果我们成功地捕捉到了文件路径，就像一名优秀的宝藏猎人发现了藏宝图的秘密位置，那么就愉快地返回它！
        return match[1]
    } else {
        // 🚨 呀！路径没找到？这就像在密林中迷了路立即发送SOS信号：抛出一个寻求帮助的错误，告诉世界我们需要帮助！
        throw new Error('无法获取文件路径: ' + callerLine)
    }
}

// 🎨 构建 UserScript 头部注释的工具，就像一个艺术家在画布上绘制画作。
function bannerBuilder(config) {
    const separator = '\n'
    const spaceNum = 2

    // 📏 精心计算每个字段的长度，确保整齐对齐，就像是在进行一场精确的排列。
    const maxLen = Math.max(...Object.keys(config).map(s => s.length))

    // 🖋️ 为每个配置项创建一个独特的注释行。就像是在画布上细心地勾勒出每一个重要的元素。
    const fields = Object.entries(config).map(([key, value]) => {
        // 📐 为了美观，我们在每个键和值之间加上恰到好处的空格。就像是在文字和文字之间留下呼吸的空间。
        const space = ' '.repeat(maxLen - key.length + spaceNum)
        const keyString = `// @${key}${space}`

        // 🌈 如果值是数组，我们就为数组中的每个元素都创建一个注释行。这就像是在画布上添加多彩的细节。
        // 🖋️ 如果不是数组，那就简单地连接键和值，完成这一行的绘制。
        return Array.isArray(value)
            ? value.map(e => keyString + e).join(separator)
            : keyString + value
    })

    // 📜 组合头部和尾部注释，完成这部 UserScript 的序幕。
    const header = `// ==UserScript==`
    const footer = `// ==/UserScript==`
    return [header, ...fields, footer].join(separator)
}

// 🤔 检查一个值是否为空，就像是探索一个神秘空间是否有宝藏。
function isNil(value) {
    return value === undefined || value === null
}

// 📃 判断字符串是否为空，就像是在寻找一个故事中的隐藏信息。
function isEmptyString(str) {
    return isNil(str) || str === ''
}
