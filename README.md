# Ink - 水墨诗集排版系统

基于浏览器的中文诗集排版工具，搭配程序化生成的水墨背景。用纯文本 **InkScript** 脚本描述版式，渲染为精美的 A5 书页，可直接打印或导出 PDF——无需构建工具、无需安装、零依赖。

A browser-based Chinese poetry typesetting tool with procedurally generated ink-wash backgrounds. Write plain-text **InkScript** scripts, render elegant A5 book pages, and print or export to PDF — no build tools, no dependencies, no installation.

> *"你只需要像写信一样写下你的配置，剩下的，交给水墨去渲染。"*
>
> *"Just write your layout like a letter — let the ink do the rest."*

---

## 特性 / Features

- **InkScript DSL** — 人类可读的纯文本排版标记语言，同时支持中英文字段名 / Human-readable plain-text markup for book layout, supporting both Chinese and English field names
- **程序化水墨画 / Procedural ink-wash art** — 种子随机数 + SVG 滤镜生成独特的水墨背景；相同种子 = 相同画面 / Seeded RNG + SVG filters generate unique ink backgrounds; same seed = same art, every time
- **6 套配色主题 / 6 color themes** — `classic` (黑灰)、`cyan` (花青)、`ochre` (赭石)、`peach` (桃源)、`bamboo` (竹韵)、`aurora` (极光)
- **跨页水墨 / Cross-page ink bleed** — 相邻两页共享一幅连续水墨，横跨书脊 / Adjacent pages share a continuous ink-wash that visually spans the book spine
- **3 种页面类型 / 3 page types** — 封面 (cover)、诗歌 (poem)、合集 (collection) / Cover, poem, and collection (anthology with multiple poems per page)
- **竖排文字 / Vertical text** — 标题与日期以传统竖排呈现，自动转换标点符号 / Titles and dates rendered in traditional vertical right-to-left writing with automatic punctuation remapping
- **紧凑模式 / Tight/prose mode** — 合并换行、首行缩进，适合词、散文 / Collapses line breaks with first-line indent; supports ci-poetry formatting
- **序言与脚注 / Preamble & footnotes** — 样式化的序言块，双模式脚注（块级或行内） / Styled preface blocks and dual-mode footnotes (block or inline)
- **诗集管理 / Collection management** — 多个命名诗集存于 localStorage；新建、重命名、删除、导入导出 `.ink` 文件 / Multiple named poem books in localStorage; create, rename, delete, import/export `.ink` files
- **诗歌数据库 / Poem database** — 通过 ID 引用 `poems.json` 中的诗歌，无需重复输入 / Reference poems by ID from `poems.json` instead of retyping
- **打印/PDF / Print/PDF** — `@media print` CSS 输出干净的 A5 页面 / Clean A5 pages via print CSS; `Ctrl+P` to print or save as PDF
- **零构建 / Zero build step** — 纯 HTML/CSS/JS，任意静态服务器或 `file://` 即可运行 / Pure HTML/CSS/JS, runs from any static file server or `file://`

---

## 快速开始 / Quick Start

```bash
# 方式一：Python 服务器 / Option 1: Python server
python server.py
# → http://127.0.0.1:8000

# 方式二：任意静态服务器 / Option 2: Any static file server
npx serve .
```

打开应用，在左侧面板编写 InkScript，按 `Ctrl+Enter` 渲染预览。

Open the app, write InkScript in the left panel, and press `Ctrl+Enter` to render.

---

## InkScript 语法 / InkScript Syntax

### 基本结构 / Structure

用 `===` 分隔页面。第一个 `===` 之前为全局配置，之后每块定义一页。`#` 或 `//` 开头为注释。

Pages are separated by `===`. The block before the first `===` is global config; each subsequent block defines a page. Lines starting with `#` or `//` are comments.

```
# 全局配置 / Global config
名称: 晚枫集
作者: 林雨夜

===
# 封面 / Cover
类型: cover
标题: 晚枫集
副标题: 林雨夜 著
主题: ochre

===
# 诗歌页 / Poem page
标题: 偶得
日期: 二〇二五 · 夏
正文:
代码如诗行行写，
逻辑似水细细流。

===
# 合集页 / Collection page
类型: collection
标题: 第一辑
列表: 01002, 01007[紧凑|!显示作者], 01009
```

### 字段一览 / Fields

| 中文字段 | English Alias | 说明 / Description |
|---------|---------------|-------------------|
| `类型` | `Type` | 页面类型：`cover`、`poem`、`collection` / Page type |
| `标题` | `Title` | 页面标题 / Page title |
| `副标题` | `Subtitle` | 封面副标题 / Cover subtitle |
| `作者` | `Author` | 作者名 / Author name |
| `日期` | `Date` | 日期 / Date string |
| `正文` | `Content` | 正文内容（多行）；设为 `none` 可留空 / Body text (multi-line); `none` for blank pages |
| `序言` | `Pre` | 正文前的引言 / Preamble block above body |
| `脚注` | `Foot` | 页面底部注释 / Footnote at page bottom |
| `主题` | `Theme` | 水墨配色主题名 / Ink theme name |
| `种子` | `Seed` | 固定水墨随机图案 / Fixed seed for reproducible ink background |
| `ID` | `id` | 引用 `poems.json` 中的诗歌 / Reference a poem from `poems.json` |
| `列表` | `List` | 逗号分隔的诗歌 ID（合集页用） / Comma-separated poem IDs for `collection` type |

### 显示控制 / Display Controls

直接写关键词开启，加 `!` 前缀关闭。

Toggle with bare keywords or `!` prefix:

```
紧凑              # 开启散文排版 / enable prose/tight mode
显示子标题         # 合集页显示每首诗标题 / show per-poem subtitles
!显示标题          # 隐藏标题 / hide title
!显示作者          # 隐藏作者 / hide author
!显示日期          # 隐藏日期 / hide date
!显示脚注          # 隐藏脚注 / hide footnote
```

### 列表内覆盖 / Collection List Overrides

在列表中用 `[key:value|key2:value2]` 对单首诗进行属性覆盖：

Override individual poem properties inline:

```
列表: 01001, 01002[标题:新标题|!显示作者], 01003[content:none|foot:致读者]
```

---

## 水墨引擎 / Ink Engine

水墨渲染引擎（`ink.js` + `ink.css`）是独立组件，可在任意项目中使用：

The ink-wash rendering engine is a standalone component usable in any project:

```html
<link rel="stylesheet" href="ink.css">
<script src="ink.js"></script>

<div class="ink-container"
     data-ink-theme="cyan"
     data-ink-seed="my-seed">
</div>
```

### 工作原理 / How It Works

1. 种子 PRNG (LCG) 生成 8–12 个墨点，随机大小、位置、颜色、旋转 / A seeded PRNG generates 8-12 ink blobs with random size, position, color, and rotation
2. 墨点使用 CSS `radial-gradient` + `mix-blend-mode: multiply` / Blobs use CSS `radial-gradient` with `mix-blend-mode: multiply`
3. SVG 滤镜链将圆形墨点扭曲为有机的水墨形状 / An SVG filter chain (`feTurbulence` → `feDisplacementMap` → `feGaussianBlur` → `feComponentTransfer`) distorts blobs into organic ink-wash shapes
4. `FilterManager` 去重 SVG 滤镜定义——相同种子绝不重复创建 DOM 节点 / `FilterManager` deduplicates SVG filter definitions — same seed never creates duplicate DOM nodes
5. CSS `@keyframes ink-breathe` 提供微妙的呼吸动画 / Animated with subtle pulsing via CSS keyframes

### 跨页布局 / Split Layout (Cross-page Bleed)

```html
<!-- 左页 / Left page -->
<div class="ink-container" data-split="left" data-ink-seed="shared-seed"></div>

<!-- 右页 / Right page -->
<div class="ink-container" data-split="right" data-ink-seed="shared-seed"></div>
```

两个容器渲染同一幅 200% 宽的水墨，各显示一半，形成跨页连续效果。

Both containers render the same 200%-width ink artwork; each shows its half.

### 主题配色 / Themes

| Key | 中文名 | Palette |
|-----|--------|---------|
| `classic` | 黑灰 | `#1a1a1a` `#2b2b2b` `#4a4a4a` `#2d3436` |
| `cyan` | 花青 | `#1a1a1a` `#2f3640` `#273c75` `#40739e` |
| `ochre` | 赭石 | `#2d3436` `#1e272e` `#cd6133` `#e17055` |
| `peach` | 桃源 | `#6D214F` `#B33771` `#FD7272` `#fab1a0` |
| `bamboo` | 竹韵 | `#083025` `#144835` `#2ecc71` `#7bed9f` |
| `aurora` | 极光 | `#130f40` `#30336b` `#7ed6df` `#e056fd` |

---

## 项目结构 / Project Structure

```
ink/
├── index.html          # 主应用（编辑器 + 阅读器） / Main application
├── ink.js              # 水墨渲染引擎 / Ink-wash rendering engine (standalone IIFE)
├── ink.css             # 水墨组件样式 / Ink-wash component styles
├── poems.json          # 诗歌数据库（按 ID 索引） / Poem database (keyed by ID)
├── server.py           # FastAPI 开发服务器 / FastAPI dev server
├── tailwind.min.js     # 本地 Tailwind CSS 运行时 / Bundled Tailwind CSS runtime
├── collections/        # 预设 .ink 文件（首次启动加载） / Preset .ink files
│   ├── 示例诗集.ink
│   ├── 晚枫集删存.ink
│   └── 沐雨集.ink
├── ink_demo.html       # 组件集成演示 / Component integration demo
└── ink.html            # 独立水墨生成器 / Standalone ink art generator
```

---

## 快捷键 / Keyboard Shortcuts

| 快捷键 / Shortcut | 功能 / Action |
|-------------------|--------------|
| `Ctrl+Enter` / `Cmd+Enter` | 渲染预览 / Render preview |

## 浏览器支持 / Browser Support

推荐 Chrome / Edge。应用依赖 SVG 滤镜渲染和 CSS `mix-blend-mode: multiply`。

Chrome/Edge recommended. The app relies on SVG filter rendering and CSS `mix-blend-mode: multiply`.

## 许可证 / License

MIT
