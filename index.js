import path from 'path'
import open from 'open'
import fs from 'fs/promises'
import esbuild from 'esbuild'

export async function build(
    userScriptConfig = {},
    { dev = false, outdir = 'dist' } = {}
) {
    const filePath = getCallerFilePath()

    const { name: fileName, dir: fileDir } = path.parse(filePath)

    // UserScript 有一个必需的 name 字段, 如果用户没有给出, 则自动使用文件名作为脚本名字
    userScriptConfig.name =
        userScriptConfig.name ?? fileName.replace(/[-_]/g, ' ')

    const finalOutdir = path.join(fileDir, outdir)

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

    if (dev) {
        await ctx.watch()

        // 开发模式下需要监听源文件的变化, 但为了不重复安装脚本, 使用一个中间脚本通过 @require file://**** 来引用打包后的文件
        // 中间脚本只需要安装一次, 其中仅包含脚本元数据, 不包含任何代码, 浏览器通过刷新即可看到源文件更改后的效果
        generateMetaFile: {
            const extraRequire = `file://${path.join(
                finalOutdir,
                fileName + '.user.js'
            )}`

            const originRequire = userScriptConfig.require
            const require = Array.isArray(originRequire)
                ? [...originRequire, extraRequire]
                : isEmptyString(originRequire)
                ? extraRequire
                : [originRequire, extraRequire]

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

        console.log('✨ watching...')
    } else {
        console.log('🚀 building...')
        await ctx.rebuild()
        console.log('✨ build done!')
    }

    installScript: {
        const outScriptFileName =
            fileName + (dev ? '.meta.user.js' : '.user.js')
        const tmpFileName = fileName + '.html'
        const tmpFilePath = path.join(finalOutdir, tmpFileName)
        const htmlContent = `<script>location.href = './${outScriptFileName}'; window.close()</script>`
        await fs.writeFile(tmpFilePath, htmlContent)
        await open(tmpFilePath)

        await new Promise(resolve => {
            setTimeout(async () => {
                await fs.unlink(tmpFilePath)
                if (!dev) {
                    process.exit(0)
                }
            }, 2000)
        })
    }
}

// 黑魔法, 好孩子不要学
function getCallerFilePath() {
    // 创建一个 Error 对象以获取堆栈跟踪
    const err = new Error()
    const stack = err.stack

    // 将堆栈字符串分割成多行，以便进行分析
    const stackLines = stack.split('\n')

    // 第一行通常是 'Error', 第二行是当前函数的调用, 第三行是 usbuild 函数的调用
    // 所以我们需要第四行来找到实际的调用者
    const callerLine = stackLines[3]

    // 匹配 file:/// 或 ( 后面的路径部分，直到遇到由冒号、数字、冒号和数字组成的序列（例如 :3:1）为止
    const match = callerLine.match(/(?:file:\/\/\/|[(])([^]+?):\d+:\d+/)

    if (match && match[1]) {
        return match[1]
    } else {
        throw new Error('无法获取文件路径: ' + callerLine)
    }
}

/**
 * @param {{[key: string]: string | string[]}} config
 */
function bannerBuilder(config) {
    const separator = '\n'
    const spaceNum = 2

    // 计算长度是为了格式美化, 对齐所有值
    const maxLen = Math.max(...Object.keys(config).map(s => s.length))

    const fields = Object.entries(config).map(([key, value]) => {
        const space = ' '.repeat(maxLen - key.length + spaceNum)
        const keyString = `// @${key}${space}`

        return Array.isArray(value)
            ? value.map(e => keyString + e).join(separator)
            : keyString + value
    })

    const header = `// ==UserScript==`
    const footer = `// ==/UserScript==`
    return [header, ...fields, footer].join(separator)
}

function isNil(value) {
    return value === undefined || value === null
}

function isEmptyString(str) {
    return isNil(str) || str === ''
}
