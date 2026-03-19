/**
 * ink.js - 水墨生成引擎
 * 负责解析 HTML 中的 data-ink 属性并生成对应的 DOM 和 SVG
 */

(function() {
    // 预设配色方案
    const THEMES = {
        classic: ["#1a1a1a", "#2b2b2b", "#4a4a4a", "#2d3436"], // 黑灰
        cyan:    ["#1a1a1a", "#2f3640", "#273c75", "#40739e"], // 花青
        ochre:   ["#2d3436", "#1e272e", "#cd6133", "#e17055"], // 赭石
        peach:   ["#6D214F", "#B33771", "#FD7272", "#fab1a0"], // 桃源
        bamboo:  ["#083025", "#144835", "#2ecc71", "#7bed9f"], // 竹韵
        aurora:  ["#130f40", "#30336b", "#7ed6df", "#e056fd"]  // 极光
    };

    // 伪随机数生成器 (Linear Congruential Generator)
    // 保证同样的 seed 产生同样的随机序列
    class SeededRandom {
        constructor(seed) {
            // 如果 seed 是字符串，转为数字 hash
            this.seed = typeof seed === 'number' ? seed : this.hashString(seed);
        }

        hashString(str) {
            let hash = 0;
            if (str.length === 0) return hash;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash);
        }

        // 返回 0 ~ 1 之间的小数
        next() {
            this.seed = (this.seed * 9301 + 49297) % 233280;
            return this.seed / 233280;
        }

        // 返回 min ~ max 之间的数
        range(min, max) {
            return this.next() * (max - min) + min;
        }
        
        // 从数组中随机选一个
        pick(arr) {
            return arr[Math.floor(this.next() * arr.length)];
        }
    }

    // SVG 滤镜管理器：防止生成重复的 SVG 定义
    const FilterManager = {
        defsContainer: null,
        createdSeeds: new Set(),

        init() {
            if (!this.defsContainer) {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.style.position = 'absolute';
                svg.style.width = '0';
                svg.style.height = '0';
                svg.style.overflow = 'hidden';
                this.defsContainer = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                svg.appendChild(this.defsContainer);
                document.body.appendChild(svg);
            }
        },

        createFilter(seedId, turbulenceSeed) {
            if (this.createdSeeds.has(seedId)) return;
            
            // 构建 SVG Filter 字符串
            // 注意：这里 id 必须唯一，供 CSS 引用
            const filterId = `ink-filter-${seedId}`;
            const filterXML = `
                <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="4" result="noise" seed="${turbulenceSeed}" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="90" xChannelSelector="R" yChannelSelector="G" />
                    <feGaussianBlur stdDeviation="1.5" />
                    <feComponentTransfer><feFuncA type="linear" slope="1.1"/></feComponentTransfer>
                </filter>
            `;
            
            // 插入 DOM
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `<svg>${filterXML}</svg>`;
            this.defsContainer.appendChild(wrapper.querySelector('filter'));
            this.createdSeeds.add(seedId);
            return filterId;
        }
    };

    // 主渲染逻辑
    function initInk(element) {
        // 读取配置
        const themeKey = element.dataset.inkTheme || 'classic';
        const rawSeed = element.dataset.inkSeed || Math.random().toString();
        // 如果是 split 布局，左右两边的 seed 必须一致，这里由用户保证传入相同的 seed
        
        // 初始化随机种子
        const rng = new SeededRandom(rawSeed);
        const palette = THEMES[themeKey] || THEMES['classic'];

        // 1. 生成或获取对应的 SVG 滤镜
        // 使用 seed 的 hash 作为 ID，确保两个使用相同 seed 的 div 共享同一个滤镜
        const seedHash = rng.hashString(String(rawSeed)); 
        // 这里的 seedHash 既做 DOM ID，也做 SVG 内部 noise 的 seed
        // 注意：svg seed 属性需要是一个数字，我们取 hash 的一部分
        const turbulenceSeed = seedHash % 1000; 
        
        FilterManager.init();
        const filterId = `ink-filter-${seedHash}`;
        FilterManager.createFilter(seedHash, turbulenceSeed);

        // 2. 构建内部结构
        // 清空容器（防止重复初始化）
        element.innerHTML = '';
        
        // 创建纹理层
        const texture = document.createElement('div');
        texture.className = 'ink-texture-overlay';
        element.appendChild(texture);

        // 创建画纸层
        const paper = document.createElement('div');
        paper.className = 'ink-paper';
        paper.style.filter = `url(#${filterId})`;
        element.appendChild(paper);

        // 3. 生成墨点 (Blob Generation)
        // 数量随机 8-12 个
        const blobCount = Math.floor(rng.range(8, 13));

        for (let i = 0; i < blobCount; i++) {
            const blob = document.createElement('div');
            blob.classList.add('ink-blob');
            
            // 随机大小 (相对父级百分比)
            const size = rng.range(20, 60); 
            // 随机位置 (允许稍微出界)
            const x = rng.range(-10, 90);
            const y = rng.range(-10, 90);
            
            const color = rng.pick(palette);
            
            blob.style.width = `${size}%`;
            blob.style.height = `${size}%`; // 保持大致圆形比例，实际渲染会被拉伸
            blob.style.left = `${x}%`;
            blob.style.top = `${y}%`;
            blob.style.setProperty('--ink-color', color);
            
            // 随机形变和旋转
            blob.style.transform = `scale(${rng.range(0.8, 1.5)}) rotate(${rng.range(0, 360)}deg)`;
            
            // 随机动画时长
            blob.style.animationDuration = `${rng.range(6, 12)}s`;

            paper.appendChild(blob);
        }
    }

    // 自动扫描并初始化所有带 .ink-container 的元素
    document.addEventListener('DOMContentLoaded', () => {
        const containers = document.querySelectorAll('.ink-container');
        containers.forEach(initInk);
    });

    // 暴露全局 API 供手动调用
    window.InkArt = { init: initInk };

})();
