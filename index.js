import path from 'path'
import fs from 'fs'
import esbuild from 'esbuild'
import open, { apps } from 'open'
import portfinder from 'portfinder'
import babel from '@babel/core'

/**
 * 🚀 构建函数，让你的油猴脚本起飞！
 *
 * @param {Object} userScriptConfig - 用户脚本配置对象。
 * @param {Object} options - 可选的配置参数对象。
 * @param {boolean} [options.dev=false] - 是否为开发模式，默认为 false。
 * @param {string} [options.outdir='dist'] - 输出目录，默认为 'dist'。
 * @param {string} [options.host='127.0.0.1'] - 服务器主机地址，默认为 '127.0.0.1'。
 * @param {number} [options.port=7100] - 服务器端口，默认为 7100。
 * @param {boolean} [options.autoReload=true] - 是否自动重载，默认为 true。
 * @param {string} [options.autoReloadMode='refresh'] - 自动重载模式，值为'refresh' 或 'reinstall'。默认为 'refresh'。
 * @param {number} [options.autoReloadDelay=1000] - 自动重载延迟时间（毫秒），默认为 1000。
 * @param {boolean} [options.enableLocalFileRequireInDev=false] - 在开发模式下是否启用加载本地文件来绕过 CSP，默认为 false。如果启用该功能，需在浏览器扩展中同时设置油猴允许访问本地文件。
 * @returns {Promise<any>} 返回一个永不会产生结果的 Promise，以阻塞程序往下运行
 */
export async function build(
    userScriptConfig = {},
    {
        dev = false,
        outdir = 'dist',
        host = '127.0.0.1',
        port = 7100,
        autoReload = true,
        autoReloadMode = 'refresh',
        autoReloadDelay = 1000,
        enableLocalFileRequireInDev = false,
    } = {}
) {
    // 🌟 获取调用这个函数的文件的路径，就像一名神秘的探险家寻找宝藏地图。
    const filePath = getCallerFilePath()

    // 🧭 分析文件路径，提取出文件名和目录，就像解开一个古老的谜题。
    const { name: fileName, dir: fileDir } = path.parse(filePath)

    // 📝 如果用户没有指定脚本名，我们就从文件名中获取，就像从石头中雕刻出雕像。
    userScriptConfig.name ??= fileName.replace(/[-_]/g, ' ')
    userScriptConfig.version ??= '0.1.0'

    // 🏠 确定最终的输出目录，给我们的脚本一个温馨的家。
    const finalOutdir = path.join(fileDir, outdir)

    if (!fs.existsSync(finalOutdir)) {
        fs.mkdirSync(finalOutdir, {
            recursive: true,
        })
    }

    // 📦 配置 esbuild，让你的代码像魔法一样自动转化并打包。
    const esbuildOptions = {
        entryPoints: [filePath],
        bundle: true,
        outdir: finalOutdir,
        charset: 'utf8',
        outExtension: { '.js': '.user.js' },
        dropLabels: ['usbuild'], // 因为历史原因暂时保留
        plugins: [ignoreSelfPlugin],
        format: 'esm',
        banner: {
            js: '\n;(async function () {',
        },
        footer: {
            js: '\n})();',
        },
    }

    // 🕵️‍♂️ 我们用 portfinder 来获取一个可用的端口，就像找到一个没有人使用的秘密通道。
    const finalPort = await portfinder.getPortPromise({ port })

    const baseURL = `http://${host}:${finalPort}/`
    const targetFileName = fileName + '.user.js'
    const proxyFileName = fileName + '.proxy.user.js'

    const targetFileURL = baseURL + targetFileName
    const proxyFileURL = baseURL + proxyFileName
    const targetFilePath = path.join(finalOutdir, targetFileName)
    const proxyFilePath = path.join(finalOutdir, proxyFileName)

    let ctx

    // 🔍 如果是开发模式，我们会像侦探一样密切关注代码的每一个变化。
    if (dev) {
        /**
         * 📑 为了避免反复像洗衣机一样安装脚本，我们施展了一个小小的魔法：创建一个中间脚本。
         * 这个中间脚本就像是一个神奇的桥梁，它通过 js 动态插入指向真正脚本位置的 Script 元素，巧妙地连接到我们打包后的文件。
         * 这样的好处是显而易见的——你只需安装这个中间脚本一次，它就会永远忠诚地为你服务，同时保持轻巧，因为它只包含了必要的脚本元数据，而没有一丁点代码的负担。
         * 每当你的源文件有所变动，只需要让你的浏览器做个伸展操般的刷新，变化就会立刻展现在你眼前，就像变魔术一样神奇又有趣！
         */

        ctx = await esbuild.context(esbuildOptions)
        await ctx.watch()

        // 开发模式下默认申请所有权限
        userScriptConfig.grant = unique(
            mergeArrays(userScriptConfig.grant, grantFunctions)
        )

        if (enableLocalFileRequireInDev) {
            userScriptConfig.require = mergeArrays(
                userScriptConfig.require,
                `file://${targetFilePath}`
            )
        }

        const codes = [bannerBuilder(userScriptConfig)]

        if (!enableLocalFileRequireInDev) {
            codes.push(
                createAndInsertScript(targetFileURL),
                grantAccessToUnsafeWindow()
            )
        }

        if (autoReload) {
            // 自动刷新的来源, See https://esbuild.github.io/api/#live-reload
            codes.push(
                setupAutoReload(
                    baseURL + 'esbuild',
                    autoReloadMode,
                    autoReloadDelay
                )
            )
        }

        const proxyScriptContent = codes.join('\n')

        // ✍️ 将这个精心准备的中间脚本写入文件，就像在一个神秘的卷轴上写下了古老的咒语。
        fs.writeFileSync(proxyFilePath, proxyScriptContent)

        console.log(`👀 Watching...`)
    } else {
        // 🚚 在非开发模式下，我们一举完成构建，一切都准备就绪！
        console.log('🚀 building...')
        ctx = await esbuild.context({
            ...esbuildOptions,
            outExtension: {},
            write: false,
        })

        const result = await ctx.rebuild()
        const code = result.outputFiles[0].text
        const detectedGrant = detectGrantFunctions(code, grantFunctions)

        userScriptConfig.grant = unique(
            mergeArrays(userScriptConfig.grant, detectedGrant)
        )

        const finalContent = bannerBuilder(userScriptConfig) + code

        fs.writeFileSync(targetFilePath, finalContent)

        console.log('🌈 build done!')
    }

    // 🌍 我们让 esbuild 服务启动起来，在这个新发现的端口上展开我们的小世界。
    await ctx.serve({
        host,
        port: finalPort,
        servedir: finalOutdir,
    })

    await installScript(dev ? proxyFileURL : targetFileURL)

    return new Promise(resolve => {
        setTimeout(async () => {
            // 💥 当我们不在开发模式下，就给系统来一个小小的“停机震撼”，优雅地退出进程。
            if (!dev) {
                // Mission completed!
                process.exit(0)
            } else {
                fs.unlinkSync(proxyFilePath)
            }
        }, 2000)
    })
}

const grantFunctions = [
    'unsafeWindow',
    'window.close',
    'window.focus',
    'window.onurlchange',
    'GM_addStyle',
    'GM_addElement',
    'GM_deleteValue',
    'GM_listValues',
    'GM_addValueChangeListener',
    'GM_removeValueChangeListener',
    'GM_setValue',
    'GM_getValue',
    'GM_log',
    'GM_getResourceText',
    'GM_getResourceURL',
    'GM_registerMenuCommand',
    'GM_unregisterMenuCommand',
    'GM_openInTab',
    'GM_xmlhttpRequest',
    'GM_download',
    'GM_getTab',
    'GM_saveTab',
    'GM_getTabs',
    'GM_notification',
    'GM_setClipboard',
    'GM_info',
    'GM_cookie',
    'GM_webRequest',
]

// 🧙‍♂️ 使用一点黑魔法来获取调用者文件的路径，但别忘了，魔法总是神秘莫测哒！
function getCallerFilePath() {
    // 🕵️‍♂️ 创建一个错误对象，它会揭示调用堆栈的秘密。
    const err = new Error()
    const stack = err.stack

    // 🧩 将堆栈信息切割成多行，从中找出我们需要的线索。
    const stackLines = stack.split('\n')

    let result
    for (let i = 2; i < stackLines.length; i++) {
        const match = stackLines[i].match(
            /(?:at file:\/+)((?:[a-zA-Z]:|\/)[^]+?):\d+:\d+/
        )
        if (match && match[1]) {
            result = match[1]
        }
    }

    if (result === undefined) {
        throw new Error('无法获取文件路径: ' + callerLine)
    }
    return result
}

// 🎨 构建 UserScript 头部注释的工具，就像一个艺术家在画布上绘制画作。
function bannerBuilder(config) {
    const separator = '\n'
    const spaceNum = 2

    // 🛠️ 将 name 字段提前至配置对象的最前端。这不仅是礼貌，更是策略。
    // 它避免了在油猴编辑器中可能出现的那些小小的报错噩梦。
    const finalConfig = { name: config.name, ...config }

    // 📏 精心计算每个字段的长度，确保整齐对齐，就像是在进行一场精确的排列。
    const maxLen = Math.max(...Object.keys(finalConfig).map(s => s.length))

    // 🖋️ 为每个配置项创建一个独特的注释行。就像是在画布上细心地勾勒出每一个重要的元素。
    const fields = Object.entries(finalConfig)
        .map(([key, value]) => {
            // 📐 为了美观，我们在每个键和值之间加上恰到好处的空格。就像是在文字和文字之间留下呼吸的空间。
            const space = ' '.repeat(maxLen - key.length + spaceNum)
            const keyString = `// @${key}${space}`

            // 🌈 如果值是数组，我们就为数组中的每个元素都创建一个注释行。这就像是在画布上添加多彩的细节。
            // 🖋️ 如果不是数组，那就简单地连接键和值，完成这一行的绘制。
            return Array.isArray(value)
                ? value.map(e => keyString + e).join(separator)
                : keyString + value
        })
        .filter(Boolean)

    // 📜 组合头部和尾部注释，完成这部 UserScript 的序幕。
    const header = `// ==UserScript==`
    const footer = `// ==/UserScript==`
    return [header, ...fields, footer, separator].join(separator)
}

/**
 * 合并多个数组或单个元素。
 * @param {...(Array|Object)} xs - 任意数量的数组或单个元素。
 * @returns {Array} 合并后的数组。
 */
function mergeArrays(...xs) {
    return [].concat(...xs.map(x => (Array.isArray(x) ? x : x ? [x] : [])))
}

/**
 * 从任何可迭代对象中移除重复项并返回一个新的数组。
 * @template T - 可迭代对象中元素的类型。
 * @param {Iterable<T>} iterable - 任何可迭代对象。
 * @returns {T[]} 去重后的数组。
 */
function unique(iterable) {
    return [...new Set(iterable)]
}

function grantAccessToUnsafeWindow() {
    return grantFunctions
        .filter(name => !name.includes('.'))
        .concat('GM')
        .map(f => `if(window.${f}) unsafeWindow.${f} = ${f};`)
        .join('\n')
}

function createAndInsertScript(src) {
    return `
function insertScript() {
    // 🎭 创建一个崭新的 script 元素，就像是在舞台上准备一个新的表演道具。
    const script = document.createElement('script');

    // 🌐 设置 script 元素的源文件。这里我们将使用 '${src}' 作为我们神秘脚本的来源。
    script.src = '${src}';

    // 🕵️‍♂️ 获取文档的 head 元素，就像是找到了控制整个页面的大脑。
    const head = document.head;

    // 🚀 将 script 元素插入到 head 的最前端，确保它是第一个被执行的脚本，就像是开场的第一幕。
    head.insertBefore(script, head.firstChild);

    return () => head.removeChild(script);
}
`
}

function setupAutoReload(eventSourceURL, autoReloadMode, autoReloadDelay) {
    const autoReloadModeMap = {
        refresh: 'location.reload();',
        reinstall: 'remove(); remove = insertScript();',
    }

    return `
let remove = insertScript()
let debounceTimer;
new EventSource('${eventSourceURL}').addEventListener('change', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {${autoReloadModeMap[autoReloadMode]}}, ${autoReloadDelay});
})
`
}

function installScript(url) {
    const htmlContent = `<script>location.href = '${url}'; window.close()</script>`

    const base64Content = Buffer.from(htmlContent).toString('base64')

    const dataUrl = `data:text/html;base64,${base64Content}`

    return open(dataUrl, {
        app: { name: apps.browser },
    })
}

function detectGrantFunctions(code, functions) {
    const babelPluginDetectGrantFunctionsName = 'detect-grant-functions'
    const { metadata } = babel.transformSync(code, {
        plugins: [babelPluginDetectGrantFunctions(functions)],
    })

    return metadata[babelPluginDetectGrantFunctionsName]

    function babelPluginDetectGrantFunctions(functionNamesArray) {
        const functionNamesSet = new Set(functionNamesArray)
        const detectedFunctions = new Set()
        function check(s) {
            if (functionNamesSet.has(s)) {
                detectedFunctions.add(s)
            }
        }

        return {
            name: babelPluginDetectGrantFunctionsName,
            visitor: {
                Identifier(path) {
                    check(path.node.name)
                },
                MemberExpression(path) {
                    const memberName = `${path.node.object.name}.${path.node.property.name}`
                    check(memberName)
                },
            },
            post(state) {
                state.metadata[babelPluginDetectGrantFunctionsName] =
                    Array.from(detectedFunctions)
            },
        }
    }
}

const ignoreSelfPlugin = {
    name: 'ignoreSelfPlugin',
    setup(build) {
        const tip = '这是力量的代价，不可避免 '
        build.onResolve({ filter: /\/usbuild$/ }, args => {
            return {
                path: ')',
                namespace: tip,
            }
        })

        build.onLoad({ filter: /^\)$/, namespace: tip }, () => {
            return {
                contents: `function __usbuild(){} export { __usbuild as build }`,
                loader: 'js',
            }
        })
    },
}
