# Changelog

## [1.7.2](https://github.com/LinLin00000000/usbuild/compare/v1.7.1...v1.7.2) (2023-12-07)


### Bug Fixes

* 修复多层 outdir 下的文件夹不存在的问题 ([5193a7d](https://github.com/LinLin00000000/usbuild/commit/5193a7ddd4fe701ceeba4ea744c516bfc74eba14))

## [1.7.1](https://github.com/LinLin00000000/usbuild/compare/v1.7.0...v1.7.1) (2023-12-06)


### Bug Fixes

* 修复可能出现的 GM_API 未定义的问题 ([18d4bfe](https://github.com/LinLin00000000/usbuild/commit/18d4bfe5b40fe759506607febc78d24713f35567))

## [1.7.0](https://github.com/LinLin00000000/usbuild/compare/v1.6.0...v1.7.0) (2023-12-06)


### Features

* 支持顶层 await ([7310870](https://github.com/LinLin00000000/usbuild/commit/7310870ed41e8c4ceeb248cd37fea670e19bc103))

## [1.6.0](https://github.com/LinLin00000000/usbuild/compare/v1.5.0...v1.6.0) (2023-12-04)


### Features

* 支持 grant 属性自动生成 ([1f5d46e](https://github.com/LinLin00000000/usbuild/commit/1f5d46eae0013ec1963e5399569a61bc9332acfc))


### Bug Fixes

* 修复 dev 模式下 GM_API 无效的问题 ([1f5d46e](https://github.com/LinLin00000000/usbuild/commit/1f5d46eae0013ec1963e5399569a61bc9332acfc))

## [1.5.0](https://github.com/LinLin00000000/usbuild/compare/v1.4.0...v1.5.0) (2023-12-04)


### Features

* **removeImportUsbuildPlugin:** 优化 babel 移除 usbuild 相关语句的流程 ([02d54a0](https://github.com/LinLin00000000/usbuild/commit/02d54a0fe32a3613fff5d2155c8e0153e6a70e12))

## [1.4.0](https://github.com/LinLin00000000/usbuild/compare/v1.3.0...v1.4.0) (2023-12-03)


### Features

* 改用使用 babel 删除调用 usbuild 的语句 ([257dbb5](https://github.com/LinLin00000000/usbuild/commit/257dbb5f67e90ea6ab17a61c82139b39124a136e))

## [1.3.0](https://github.com/LinLin00000000/usbuild/compare/v1.2.0...v1.3.0) (2023-12-02)


### Features

* 改进引用脚本的方式, 可以免去 usbuild 标记的麻烦啦 ([e4392bf](https://github.com/LinLin00000000/usbuild/commit/e4392bfd3cc8839990977e42523581753fc47c23))

## [1.2.0](https://github.com/LinLin00000000/usbuild/compare/v1.1.1...v1.2.0) (2023-12-02)


### Features

* 增加实时热重载的功能 ([830a057](https://github.com/LinLin00000000/usbuild/commit/830a0572c1baa696c43c714616359144ed783ada))

## [1.1.1](https://github.com/LinLin00000000/usbuild/compare/v1.1.0...v1.1.1) (2023-12-02)


### Bug Fixes

* 修复 dev 模式下可能的 no such file or directory 问题 ([4f09a64](https://github.com/LinLin00000000/usbuild/commit/4f09a64d29b5815a930873d95c3f4ab8e3d93b72))

## [1.1.0](https://github.com/LinLin00000000/usbuild/compare/v1.0.2...v1.1.0) (2023-12-01)


### Features

* 优化安装脚本的过程, 使本地开发不用打开插件"访问本地文件"权限 ([04f078e](https://github.com/LinLin00000000/usbuild/commit/04f078ef01f6bf8806693563764c512b36c8ab18))
* 增加了对 ScriptCat 的本地开发支持 ([d4b0eed](https://github.com/LinLin00000000/usbuild/commit/d4b0eed08f8e51448b47b922b9e5e5f54a1a53b5))


### Bug Fixes

* 增加配置中 version 字段的默认值, 防止ScriptCat检测不出脚本 ([d8dce05](https://github.com/LinLin00000000/usbuild/commit/d8dce05b9ec6578299f7f8354ad5b945d9ca58ed))

## [1.0.2](https://github.com/LinLin00000000/usbuild/compare/v1.0.1...v1.0.2) (2023-12-01)


### Bug Fixes

* **bannerBuilder:** 修复在油猴编辑器中可能出现的bug ([f8bd895](https://github.com/LinLin00000000/usbuild/commit/f8bd895fee340f2495496e4a6b6bf5f11292f172))

## [1.0.1](https://github.com/LinLin00000000/usbuild/compare/v1.0.0...v1.0.1) (2023-11-30)


### Bug Fixes

* **package.json:** 增加main 字段以防止出现警告 ([92d2e79](https://github.com/LinLin00000000/usbuild/commit/92d2e79292c11b389447383eef721b2e11c4da21))

## 1.0.0 (2023-11-29)


### ⚠ BREAKING CHANGES

* 发布第一版

### Features

* 发布第一版 ([efa55bb](https://github.com/LinLin00000000/usbuild/commit/efa55bb79eed98b75b6de375c89bc5494b54353c))
