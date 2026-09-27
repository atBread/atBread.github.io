/* =========================================================
   主题强调色
   ========================================================= */
(function initAccentColor() {
    if (window.mdui && typeof mdui.setColorScheme === 'function') {
        mdui.setColorScheme('#006463');
    }
})();

/* =========================================================
   平台检测
   ========================================================= */
function isWindowsPlatform() {
    try {
        return /Windows/i.test(navigator.userAgent || '');
    } catch (_) {
        return false;
    }
}

/* =========================================================
   全局状态
   ========================================================= */
const state = {
    fontSize: 40,
    speed: 60,
    textColor: '#ffffff',
    guideColor: '#e53935',
    textWidth: 100,
    fontFamily: 'mono',
    customFontFamily: null,
    showGuide: true,
    mirror: false,
    firstLineIndent: false,
    autoExit: false,
    disableKeys: false
};

const FONT_STACKS = {
    mono:
        "Consolas, Menlo, Monaco, 'Courier New', 'Liberation Mono', " +
        "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Heiti SC', sans-serif",
    system:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', " +
        "'Hiragino Sans GB', 'Microsoft YaHei', 'Heiti SC', sans-serif",
    serif:
        "Georgia, 'Times New Roman', 'Songti SC', SimSun, " +
        "'Noto Serif SC', 'Source Han Serif SC', serif"
};

function getFontFamily() {
    if (state.fontFamily === 'custom' && state.customFontFamily) {
        return `'${state.customFontFamily}', ` + FONT_STACKS.mono;
    }
    return FONT_STACKS[state.fontFamily] || FONT_STACKS.mono;
}

let isFullscreen = false;
let currentView = 'home';

const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   DOM
   ========================================================= */
const navBar            = document.getElementById('navBar');
const viewHome          = document.getElementById('view-home');
const viewOptions       = document.getElementById('view-options');
const viewAbout         = document.getElementById('view-about');

const views = {
    home: viewHome,
    options: viewOptions,
    about: viewAbout
};

const editorField       = document.getElementById('editorField');

const previewPane       = document.getElementById('previewPane');
const previewViewport   = document.getElementById('previewViewport');
const previewText       = document.getElementById('previewText');
const previewResizer    = document.getElementById('previewResizer');
const previewScrollGlow = document.getElementById('previewScrollGlow');

const fsRoot            = document.getElementById('fsRoot');
const fsViewport        = document.getElementById('fsViewport');
const fsText            = document.getElementById('fsText');
const fsMenuBtn         = document.getElementById('fsMenuBtn');
const fsPanel           = document.getElementById('fsPanel');
const fsPanelCloseBtn   = document.getElementById('fsPanelCloseBtn');

const speedSlider       = document.getElementById('speedSlider');
const speedValue        = document.getElementById('speedValue');
const fontSlider        = document.getElementById('fontSlider');
const fontValue         = document.getElementById('fontValue');
const textColorInput    = document.getElementById('textColorInput');
const guideColorInput   = document.getElementById('guideColorInput');
const marginSlider      = document.getElementById('marginSlider');
const marginValue       = document.getElementById('marginValue');

const fontFamilySelect  = document.getElementById('fontFamilySelect');
const customFontOption  = fontFamilySelect.querySelector('mdui-menu-item[value="custom"]');

const chipGuide         = document.getElementById('chipGuide');
const chipMirror        = document.getElementById('chipMirror');
const chipIndent        = document.getElementById('chipIndent');
const chipAutoExit      = document.getElementById('chipAutoExit');
const chipNoKeys        = document.getElementById('chipNoKeys');

const fsSpeedSlider     = document.getElementById('fsSpeedSlider');
const fsSpeedValue      = document.getElementById('fsSpeedValue');
const fsFontSlider      = document.getElementById('fsFontSlider');
const fsFontValue       = document.getElementById('fsFontValue');
const fsMarginSlider    = document.getElementById('fsMarginSlider');
const fsMarginValue     = document.getElementById('fsMarginValue');
const fsTextColor       = document.getElementById('fsTextColor');
const fsGuideColor      = document.getElementById('fsGuideColor');
const fsExitBtn         = document.getElementById('fsExitBtn');

const endDialog         = document.getElementById('endDialog');
const endStayBtn        = document.getElementById('endStayBtn');
const endExitBtn        = document.getElementById('endExitBtn');

const startBtn          = document.getElementById('startBtn');
const importBtn         = document.getElementById('importBtn');
const fileInput         = document.getElementById('fileInput');

const dropRipple        = document.getElementById('dropRipple');
const dropRippleMask    = document.getElementById('dropRippleMask');
const dropCursorGlow    = document.getElementById('dropCursorGlow');

const guideOverlay      = document.getElementById('guideOverlay');
const guideGlow         = document.getElementById('guideGlow');
const guideArrow        = document.getElementById('guideArrow');
const guideText         = document.getElementById('guideText');

/* ============================================================
   全局自动滚动停止器集合
   ============================================================ */
const autoScrollStoppers = new Set();

function stopAllAutoScroll() {
    autoScrollStoppers.forEach(fn => {
        try { fn(); } catch (_) {}
    });
    autoScrollStoppers.clear();
}

/* =========================================================
   底部导航切换
   ========================================================= */
function switchView(name) {
    if (name === currentView) return;

    const targetView = views[name];
    if (!targetView) return;

    stopAllAutoScroll();

    Object.values(views).forEach(v => {
        v.classList.remove('active');
    });

    targetView.classList.add('active');

    const order = ['home', 'options', 'about'];
    const fromIdx = order.indexOf(currentView);
    const toIdx   = order.indexOf(name);
    const offset  = toIdx >= fromIdx ? 36 : -36;

    currentView = name;

    if (!prefersReducedMotion && typeof targetView.animate === 'function') {
        try {
            /* 动画不带 fill: 'both'，结束后元素回归 CSS 状态，
               transform 变回 none，避免影响 mdui-select 的 fixed 下拉菜单 */
            targetView.animate(
                [
                    { opacity: 0, transform: `translateX(${offset}px)` },
                    { opacity: 1, transform: 'translateX(0)' }
                ],
                {
                    duration: 340,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
                }
            );
        } catch (_) {}
    }

    requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });

        previewScroller.measure();
        mainScroller.measure();
        previewScroller.setPosition(previewScroller.position);
        mainScroller.setPosition(mainScroller.position);
    });
}

navBar.addEventListener('change', (e) => {
    switchView(e.target.value);
});

const isWideScreen = () => window.matchMedia('(min-width: 840px)').matches;

const bodyStyleObserver = new MutationObserver(() => {
    if (isWideScreen()) {
        if (document.body.style.paddingBottom && document.body.style.paddingBottom !== '0px') {
            document.body.style.paddingBottom = '0px';
        }
    }
});
bodyStyleObserver.observe(document.body, { attributes: true, attributeFilter: ['style'] });

/* =========================================================
   滚动器
   ========================================================= */
function createScroller(viewportEl, textEl, { loop = false, onEnd = null } = {}) {
    return {
        viewport: viewportEl,
        text: textEl,
        position: 0,
        playing: false,
        loop,
        onEnd,
        max: 0,

        apply() {
            const base = `translate3d(0, ${-this.position}px, 0)`;
            this.text.style.transform = state.mirror ? `${base} scaleX(-1)` : base;
        },

        measure() {
            const h = this.text.offsetHeight || 0;
            const cs = getComputedStyle(this.text);
            let lh = parseFloat(cs.lineHeight);
            if (!lh || Number.isNaN(lh)) lh = state.fontSize * 1.5;
            this.max = Math.max(0, h + lh * 3);
        },

        setPosition(p) {
            this.position = Math.max(0, Math.min(this.max, p));
            this.apply();
        },

        nudge(px) { this.setPosition(this.position + px); },
        reset() { this.position = 0; this.apply(); },

        step(dt) {
            if (this.max <= 0) return;
            this.position += state.speed * dt;
            if (this.position >= this.max) {
                if (this.loop) {
                    this.position = 0;
                } else {
                    this.position = this.max;
                    this.playing = false;
                    if (typeof this.onEnd === 'function') {
                        const cb = this.onEnd;
                        requestAnimationFrame(() => cb());
                    }
                }
            }
            this.apply();
        }
    };
}

const previewScroller = createScroller(previewViewport, previewText, { loop: true });
const mainScroller    = createScroller(fsViewport, fsText, {
    loop: false,
    onEnd: handlePromptEnd
});

/* =========================================================
   播放结束处理
   ========================================================= */
function handlePromptEnd() {
    if (!isFullscreen) return;
    closeFsPanel();
    if (state.autoExit) { exitFullscreen(); return; }
    endDialog.open = true;
}

endStayBtn.addEventListener('click', () => { endDialog.open = false; });
endExitBtn.addEventListener('click', () => { endDialog.open = false; exitFullscreen(); });

/* =========================================================
   主循环
   ========================================================= */
let lastTs = 0;

function rafLoop(ts) {
    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.1) : 0;
    lastTs = ts;

    if (mainScroller.playing)    mainScroller.step(dt);
    if (previewScroller.playing) previewScroller.step(dt);

    requestAnimationFrame(rafLoop);
}
requestAnimationFrame(rafLoop);

/* =========================================================
   文本 & 样式同步
   ========================================================= */
let textTimer = null;
function scheduleTextUpdate() {
    clearTimeout(textTimer);
    textTimer = setTimeout(updateText, 120);
}

function updateText() {
    const text = editorField.value || '';
    previewScroller.text.textContent = text;
    mainScroller.text.textContent = text;

    requestAnimationFrame(() => {
        previewScroller.measure();
        mainScroller.measure();
        previewScroller.setPosition(previewScroller.position);
        mainScroller.setPosition(mainScroller.position);
    });
}

function getPreviewMinHeight() { return state.fontSize * 3 + 32; }

function applyStyles() {
    const fs = state.fontSize + 'px';
    const fontFam = getFontFamily();

    const sideMarginPct = (100 - state.textWidth) / 2;
    const marginPctStr = sideMarginPct + '%';

    [previewViewport, fsViewport].forEach(v => {
        v.style.fontSize = fs;
        v.style.setProperty('--page-margin-pct', marginPctStr);
        v.style.setProperty('--text-font', fontFam);
        v.style.setProperty('--text-color', state.textColor);
        v.style.setProperty('--guide-color', state.guideColor);
        v.classList.toggle('hide-guide', !state.showGuide);
        v.classList.toggle('indent-first', state.firstLineIndent);
    });

    const minH = getPreviewMinHeight();
    previewPane.style.minHeight = minH + 'px';
    if (previewPane.offsetHeight < minH) {
        previewPane.style.height = minH + 'px';
    }

    previewScroller.measure();
    mainScroller.measure();
    previewScroller.apply();
    mainScroller.apply();
}

/* =========================================================
   滑块 / 颜色 控件绑定
   ========================================================= */
function bindSlider(slider, mirrorSlider, valueEl, mirrorValueEl, key, cb) {
    const handler = (e) => {
        const val = Number(e.target.value);
        if (Number.isNaN(val)) return;
        state[key] = val;
        valueEl.textContent = val;
        if (mirrorSlider) mirrorSlider.value = val;
        if (mirrorValueEl) mirrorValueEl.textContent = val;
        cb && cb();
    };
    slider.addEventListener('input', handler);
    if (mirrorSlider) mirrorSlider.addEventListener('input', handler);
}

bindSlider(speedSlider, fsSpeedSlider, speedValue, fsSpeedValue, 'speed');
bindSlider(fontSlider,  fsFontSlider,  fontValue,  fsFontValue,  'fontSize', () => applyStyles());

function bindMarginSlider(slider, mirrorSlider, valueEl, mirrorValueEl) {
    const handler = (e) => {
        const val = Number(e.target.value);
        if (Number.isNaN(val)) return;
        state.textWidth = val;
        valueEl.textContent = val + '%';
        if (mirrorSlider) mirrorSlider.value = val;
        if (mirrorValueEl) mirrorValueEl.textContent = val + '%';
        applyStyles();
    };
    slider.addEventListener('input', handler);
    if (mirrorSlider) mirrorSlider.addEventListener('input', handler);
}

bindMarginSlider(marginSlider, fsMarginSlider, marginValue, fsMarginValue);

function bindColor(input, mirrorInput, key, cb) {
    const handler = (e) => {
        state[key] = e.target.value;
        if (mirrorInput) mirrorInput.value = e.target.value;
        cb && cb();
    };
    input.addEventListener('input', handler);
    if (mirrorInput) mirrorInput.addEventListener('input', handler);
}

bindColor(textColorInput,  fsTextColor,  'textColor',  () => applyStyles());
bindColor(guideColorInput, fsGuideColor, 'guideColor', () => applyStyles());

/* =========================================================
   字体选择
   ========================================================= */
fontFamilySelect.addEventListener('change', (e) => {
    state.fontFamily = e.target.value;
    applyStyles();
});

/* =========================================================
   chip 选项绑定
   ========================================================= */
function bindChip(chip, onChange) {
    if (!chip) return;
    chip.addEventListener('change', () => {
        requestAnimationFrame(() => onChange(!!chip.selected));
    });
}

bindChip(chipGuide,    (v) => { state.showGuide = v; applyStyles(); });
bindChip(chipMirror,   (v) => { state.mirror = v; applyStyles(); });
bindChip(chipIndent,   (v) => { state.firstLineIndent = v; applyStyles(); });
bindChip(chipAutoExit, (v) => { state.autoExit = v; });
bindChip(chipNoKeys,   (v) => { state.disableKeys = v; });

editorField.addEventListener('input', scheduleTextUpdate);

/* =========================================================
   预览窗高度拖拽
   ========================================================= */
function bindResize(handle, targetEl, {
    min = 100,
    max = 1000,
    autoScroll = false,
    scrollEdge = 120,
    glowEl = null,
    glowMin = 120,
    glowMax = 520,
    glowGain = 1.2
} = {}) {
    const getMinHeight = () => {
        const v = (typeof min === 'function') ? min() : min;
        const n = Number(v);
        return Number.isFinite(n) ? n : 100;
    };

    handle.addEventListener('pointerdown', (e) => {
        if (currentView !== 'home') return;

        stopAllAutoScroll();

        e.preventDefault();
        try { handle.setPointerCapture(e.pointerId); } catch (_) {}

        const startY = e.clientY;
        const startH = targetEl.offsetHeight;

        let accumulated = 0;
        let virtualY = startY;
        let scrollActive = false;
        let scrollRaf = 0;
        let finished = false;

        let totalScroll = 0;
        const glowActive = !!glowEl;

        const applyHeight = (h) => {
            const m = getMinHeight();
            targetEl.style.height = Math.max(m, Math.min(max, h)) + 'px';
        };

        function updateGlow() {
            if (!glowActive) return;
            const size = Math.min(glowMax, glowMin + totalScroll * glowGain);
            glowEl.style.width  = size + 'px';
            glowEl.style.height = size + 'px';
        }

        function showGlow() {
            if (!glowActive) return;
            glowEl.style.width  = glowMin + 'px';
            glowEl.style.height = glowMin + 'px';
            glowEl.classList.add('active');
        }

        function hideGlow() {
            if (!glowActive) return;
            glowEl.classList.remove('active');
            setTimeout(() => {
                if (!glowEl.classList.contains('active')) {
                    glowEl.style.width  = '0px';
                    glowEl.style.height = '0px';
                }
            }, 300);
        }

        function scrollLoop() {
            if (!scrollActive) { scrollRaf = 0; return; }

            if (currentView !== 'home') {
                scrollActive = false;
                scrollRaf = 0;
                hideGlow();
                return;
            }

            if (!targetEl.isConnected || targetEl.offsetParent === null) {
                scrollActive = false;
                scrollRaf = 0;
                hideGlow();
                return;
            }

            const dist = window.innerHeight - virtualY;
            if (dist < scrollEdge) {
                const speed = Math.min(18, Math.max(1, (scrollEdge - dist) * 0.28));
                window.scrollBy(0, speed);
                totalScroll += speed;
                updateGlow();
            }

            scrollRaf = requestAnimationFrame(scrollLoop);
        }

        function startAutoScroll() {
            if (!autoScroll || scrollActive) return;
            scrollActive = true;
            if (glowActive) {
                totalScroll = 0;
                showGlow();
            }
            if (!scrollRaf) scrollRaf = requestAnimationFrame(scrollLoop);
        }

        function stopAutoScroll() {
            scrollActive = false;
            if (scrollRaf) {
                cancelAnimationFrame(scrollRaf);
                scrollRaf = 0;
            }
            hideGlow();
        }

        autoScrollStoppers.add(stopAutoScroll);

        function onMove(ev) {
            const locked = document.pointerLockElement === handle;
            if (locked) {
                accumulated += ev.movementY || 0;
                applyHeight(startH + accumulated);
                virtualY = startY + accumulated;
            } else {
                applyHeight(startH + (ev.clientY - startY));
                virtualY = ev.clientY;
            }
        }

        function finish() {
            if (finished) return;
            finished = true;

            autoScrollStoppers.delete(stopAutoScroll);
            stopAutoScroll();

            if (document.pointerLockElement === handle) {
                try { document.exitPointerLock(); } catch (_) {}
            }

            try { handle.releasePointerCapture(e.pointerId); } catch (_) {}

            handle.removeEventListener('pointermove', onMove);
            handle.removeEventListener('pointerup', finish);
            handle.removeEventListener('pointercancel', finish);
            document.removeEventListener('pointerlockchange', onLockChange);

            previewScroller.measure();
            mainScroller.measure();
        }

        function onLockChange() {
            if (document.pointerLockElement !== handle) finish();
        }

        startAutoScroll();

        const supportsLock = typeof handle.requestPointerLock === 'function';
        const wantLock = isWindowsPlatform() && supportsLock;

        if (wantLock) {
            try {
                const p = handle.requestPointerLock();
                if (p && typeof p.then === 'function') p.catch(() => {});
            } catch (_) {}
        }

        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', finish);
        handle.addEventListener('pointercancel', finish);
        document.addEventListener('pointerlockchange', onLockChange);
    });
}

bindResize(previewResizer, previewPane, {
    min: getPreviewMinHeight,
    max: 900,
    autoScroll: true,
    scrollEdge: 120,
    glowEl: previewScrollGlow,
    glowMin: 120,
    glowMax: 520,
    glowGain: 1.2
});

/* =========================================================
   全屏设置面板
   ========================================================= */
function openFsPanel()  { fsPanel.classList.add('open'); }
function closeFsPanel() { fsPanel.classList.remove('open'); }
function toggleFsPanel() { fsPanel.classList.toggle('open'); }

fsMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFsPanel(); });
fsPanelCloseBtn.addEventListener('click', () => { closeFsPanel(); });

/* =========================================================
   全屏
   ========================================================= */
async function enterFullscreen() {
    if (isFullscreen) return;
    dismissGuide();
    stopAllAutoScroll();

    fsRoot.classList.add('active');
    document.body.classList.add('fs-active');
    closeFsPanel();
    endDialog.open = false;

    try {
        if (fsRoot.requestFullscreen) {
            await fsRoot.requestFullscreen({ navigationUI: 'hide' });
        } else if (fsRoot.webkitRequestFullscreen) {
            fsRoot.webkitRequestFullscreen();
        }
    } catch (err) {
        console.warn('全屏 API 调用失败，降级为页面内全屏', err);
    }

    isFullscreen = true;

    requestAnimationFrame(() => requestAnimationFrame(() => {
        mainScroller.measure();
        mainScroller.reset();
        mainScroller.playing = true;
        lastTs = 0;
    }));

    try {
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
        }
    } catch (_) {}
}

function cleanupFullscreen() {
    if (!isFullscreen) return;
    isFullscreen = false;
    mainScroller.playing = false;
    wheelTimer && clearTimeout(wheelTimer);
    wheelTimer = null;
    closeFsPanel();
    endDialog.open = false;
    fsRoot.classList.remove('active');
    document.body.classList.remove('fs-active');
    try {
        if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
    } catch (_) {}
}

function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    cleanupFullscreen();
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) cleanupFullscreen();
});
document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) cleanupFullscreen();
});

startBtn.addEventListener('click', enterFullscreen);
fsExitBtn.addEventListener('click', exitFullscreen);

/* =========================================================
   全屏内拖动文本
   ========================================================= */
let dragState = null;

fsViewport.addEventListener('pointerdown', (e) => {
    if (!isFullscreen) return;
    if (endDialog.open) return;
    e.preventDefault();

    try { fsViewport.setPointerCapture(e.pointerId); } catch (_) {}

    dragState = {
        id: e.pointerId,
        startY: e.clientY,
        startPos: mainScroller.position
    };

    mainScroller.playing = false;
    fsViewport.classList.add('dragging');
});

fsViewport.addEventListener('pointermove', (e) => {
    if (!dragState || e.pointerId !== dragState.id) return;
    e.preventDefault();
    const dy = e.clientY - dragState.startY;
    mainScroller.setPosition(dragState.startPos - dy);
});

function endDrag(e) {
    if (!dragState || (e && e.pointerId !== dragState.id)) return;
    dragState = null;
    fsViewport.classList.remove('dragging');
    mainScroller.playing = true;
    lastTs = 0;
}

fsViewport.addEventListener('pointerup', endDrag);
fsViewport.addEventListener('pointercancel', endDrag);
fsViewport.addEventListener('pointerleave', (e) => {
    if (dragState && e.buttons === 0) endDrag(e);
});

/* =========================================================
   鼠标滚轮控制文本滚动
   ========================================================= */
let wheelTimer = null;
let wheelWasPlaying = false;

fsViewport.addEventListener('wheel', (e) => {
    if (!isFullscreen) return;
    if (endDialog.open) return;
    e.preventDefault();

    if (!wheelTimer) wheelWasPlaying = mainScroller.playing;
    mainScroller.playing = false;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= state.fontSize * 1.5;
    else if (e.deltaMode === 2) delta *= window.innerHeight;

    mainScroller.nudge(delta);

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
        wheelTimer = null;
        if (wheelWasPlaying && !dragState && !endDialog.open) {
            mainScroller.playing = true;
            lastTs = 0;
        }
    }, 700);
}, { passive: false });

/* =========================================================
   键盘快捷键
   ========================================================= */
function togglePlay() {
    mainScroller.playing = !mainScroller.playing;
    lastTs = 0;
}

document.addEventListener('keydown', (e) => {
    if (!isFullscreen) return;
    if (state.disableKeys) return;

    if (endDialog.open) {
        if (e.key === 'Escape') {
            e.preventDefault();
            endDialog.open = false;
        }
        return;
    }

    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) {
        if (e.key !== 'Escape') return;
    }

    const lineH = state.fontSize * 1.5;

    switch (e.key) {
        case ' ': case 'Spacebar':
            e.preventDefault(); togglePlay(); break;
        case 'ArrowUp': case 'ArrowLeft': case 'PageUp':
            e.preventDefault(); mainScroller.nudge(-lineH * 2); break;
        case 'ArrowDown': case 'ArrowRight': case 'PageDown':
            e.preventDefault(); mainScroller.nudge(lineH * 2); break;
        case 'r': case 'R':
            e.preventDefault(); mainScroller.reset(); break;
        case 'Escape':
            exitFullscreen(); break;
    }
});

/* =========================================================
   拖拽文件的涟漪毛玻璃遮罩
   ========================================================= */
let rippleDragDepth = 0;
let ripplePhase = 'idle';
let rippleRaf = 0;
let rippleCX = 0, rippleCY = 0, rippleR = 0;
let rippleStartR = 0, rippleStartCX = 0, rippleStartCY = 0;
let rippleTargetX = 0, rippleTargetY = 0;
let rippleStartTime = 0;
let rippleLastMask = '';
let glowTimer = null;
let rippleDelayTimer = null;

let lastDragX = 0, lastDragY = 0;
let lastDragT = 0;
let velocityX = 0, velocityY = 0;

const VELOCITY_SMOOTH = 0.5;
const MIN_SPEED = 150;
const RIPPLE_DELAY_MS    = 80;
const RIPPLE_EXPAND_MS   = 720;
const RIPPLE_SHRINK_MS   = 520;
const RIPPLE_COLLAPSE_MS = 640;
const GLOW_DELAY_MS      = 100;

function resetVelocity() { velocityX = 0; velocityY = 0; lastDragT = 0; }

function rippleMaxRadius(x, y) {
    const w = window.innerWidth, h = window.innerHeight;
    return Math.max(
        Math.hypot(x, y), Math.hypot(w - x, y),
        Math.hypot(x, h - y), Math.hypot(w - x, h - y)
    );
}

function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function setRippleMask(mask) {
    if (mask === rippleLastMask) return;
    rippleLastMask = mask;
    dropRippleMask.style.webkitMaskImage = mask;
    dropRippleMask.style.maskImage = mask;
}

const EDGE_FEATHER = 2;

function applyRippleMask() {
    if (ripplePhase === 'collapse') {
        const hole = Math.max(0, rippleR);
        const m =
            `radial-gradient(circle at ${rippleCX}px ${rippleCY}px, ` +
            `transparent 0, transparent ${hole}px, ` +
            `black ${hole + EDGE_FEATHER}px, black 100%)`;
        setRippleMask(m);
    } else {
        const r = Math.max(0, rippleR);
        const m =
            `radial-gradient(circle at ${rippleCX}px ${rippleCY}px, ` +
            `black 0, black ${r}px, ` +
            `transparent ${r + EDGE_FEATHER}px)`;
        setRippleMask(m);
    }
}

function resetRipple() {
    ripplePhase = 'idle';
    rippleRaf = 0;
    rippleStartTime = 0;
    dropRipple.classList.remove('visible', 'covered');
}

function rippleLoop(ts) {
    if (ripplePhase === 'idle') { rippleRaf = 0; rippleStartTime = 0; return; }
    if (!rippleStartTime) rippleStartTime = ts;
    const elapsed = ts - rippleStartTime;

    if (ripplePhase === 'expand') {
        const t = Math.min(1, elapsed / RIPPLE_EXPAND_MS);
        rippleR = easeOutExpo(t) * (rippleMaxRadius(rippleCX, rippleCY) + 60);
        applyRippleMask();
        if (t >= 1) { ripplePhase = 'hold'; rippleRaf = 0; rippleStartTime = 0; return; }
    } else if (ripplePhase === 'hold') {
        rippleRaf = 0; return;
    } else if (ripplePhase === 'shrink') {
        const t = Math.min(1, elapsed / RIPPLE_SHRINK_MS);
        const eased = easeInOutCubic(t);
        rippleCX = rippleStartCX + (rippleTargetX - rippleStartCX) * eased;
        rippleCY = rippleStartCY + (rippleTargetY - rippleStartCY) * eased;
        rippleR  = rippleStartR * (1 - eased);
        applyRippleMask();
        if (t >= 1) { resetRipple(); return; }
    } else if (ripplePhase === 'collapse') {
        const maxR = rippleMaxRadius(rippleCX, rippleCY) + 90;
        const t = Math.min(1, elapsed / RIPPLE_COLLAPSE_MS);
        rippleR = easeOutExpo(t) * maxR;
        applyRippleMask();
        if (t >= 1) { resetRipple(); return; }
    }

    rippleRaf = requestAnimationFrame(rippleLoop);
}

function startRippleExpand(x, y) {
    if (glowTimer) { clearTimeout(glowTimer); glowTimer = null; }
    ripplePhase = 'expand';
    rippleCX = x; rippleCY = y; rippleR = 0;
    rippleStartTime = 0; rippleLastMask = '';
    lastDragX = x; lastDragY = y; resetVelocity();

    dropRipple.classList.add('visible');
    dropRipple.classList.remove('covered');
    dropCursorGlow.style.left = x + 'px';
    dropCursorGlow.style.top = y + 'px';
    applyRippleMask();

    if (!rippleRaf) rippleRaf = requestAnimationFrame(rippleLoop);

    glowTimer = setTimeout(() => {
        glowTimer = null;
        if (ripplePhase === 'expand' || ripplePhase === 'hold') {
            dropRipple.classList.add('covered');
        }
    }, GLOW_DELAY_MS);
}

function updateRippleCursor(x, y) {
    if (ripplePhase === 'expand' || ripplePhase === 'hold') {
        dropCursorGlow.style.left = x + 'px';
        dropCursorGlow.style.top = y + 'px';
    }
}

function startRippleShrink() {
    if (ripplePhase === 'idle') {
        dropRipple.classList.remove('visible', 'covered');
        return;
    }
    if (glowTimer) { clearTimeout(glowTimer); glowTimer = null; }

    rippleStartCX = rippleCX; rippleStartCY = rippleCY; rippleStartR = rippleR;

    let ux = 0, uy = 0, hasDir = false;
    const speed = Math.hypot(velocityX, velocityY);
    if (speed >= MIN_SPEED) {
        ux = velocityX / speed; uy = velocityY / speed; hasDir = true;
    }
    if (!hasDir) {
        const dx = lastDragX - rippleStartCX, dy = lastDragY - rippleStartCY;
        const len = Math.hypot(dx, dy);
        if (len >= 8) { ux = dx / len; uy = dy / len; hasDir = true; }
    }
    if (!hasDir) {
        const w = window.innerWidth, h = window.innerHeight;
        const dL = lastDragX, dR = w - lastDragX, dT = lastDragY, dB = h - lastDragY;
        const minD = Math.min(dL, dR, dT, dB);
        if (minD === dL) { ux = -1; uy = 0; }
        else if (minD === dR) { ux = 1; uy = 0; }
        else if (minD === dT) { ux = 0; uy = -1; }
        else { ux = 0; uy = 1; }
    }

    const screenDiag = Math.hypot(window.innerWidth, window.innerHeight);
    const slideDist = Math.max(screenDiag * 0.5, rippleStartR * 0.8, 200);
    rippleTargetX = rippleStartCX + ux * slideDist;
    rippleTargetY = rippleStartCY + uy * slideDist;

    ripplePhase = 'shrink';
    rippleStartTime = 0;
    dropRipple.classList.remove('covered');
    applyRippleMask();
    if (!rippleRaf) rippleRaf = requestAnimationFrame(rippleLoop);
}

function startRippleCollapse(x, y) {
    if (ripplePhase === 'idle') {
        dropRipple.classList.remove('visible', 'covered');
        return;
    }
    if (glowTimer) { clearTimeout(glowTimer); glowTimer = null; }

    ripplePhase = 'collapse';
    rippleCX = x; rippleCY = y; rippleR = 0;
    rippleStartTime = 0; rippleLastMask = '';

    dropRipple.classList.remove('covered');
    applyRippleMask();
    if (!rippleRaf) rippleRaf = requestAnimationFrame(rippleLoop);
}

function isFileDrag(e) {
    const dt = e.dataTransfer;
    if (!dt) return false;
    const types = dt.types;
    if (!types) return false;
    for (let i = 0; i < types.length; i++) {
        if (types[i] === 'Files') return true;
    }
    return false;
}

window.addEventListener('dragenter', (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    rippleDragDepth++;
    if (rippleDragDepth === 1) {
        const startX = e.clientX, startY = e.clientY;
        if (rippleDelayTimer) clearTimeout(rippleDelayTimer);
        rippleDelayTimer = setTimeout(() => {
            rippleDelayTimer = null;
            startRippleExpand(startX, startY);
        }, RIPPLE_DELAY_MS);
    }
});

window.addEventListener('dragover', (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';

    const now = performance.now();
    if (lastDragT > 0) {
        const dt = (now - lastDragT) / 1000;
        if (dt > 0.001 && dt < 0.3) {
            const vx = (e.clientX - lastDragX) / dt;
            const vy = (e.clientY - lastDragY) / dt;
            velocityX = velocityX * VELOCITY_SMOOTH + vx * (1 - VELOCITY_SMOOTH);
            velocityY = velocityY * VELOCITY_SMOOTH + vy * (1 - VELOCITY_SMOOTH);
        }
    }
    lastDragT = now;
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    updateRippleCursor(e.clientX, e.clientY);
});

window.addEventListener('dragleave', (e) => {
    if (!isFileDrag(e)) return;
    rippleDragDepth = Math.max(0, rippleDragDepth - 1);
    if (rippleDragDepth === 0) {
        if (rippleDelayTimer) {
            clearTimeout(rippleDelayTimer);
            rippleDelayTimer = null;
            return;
        }
        startRippleShrink();
    }
});

window.addEventListener('drop', async (e) => {
    e.preventDefault();
    rippleDragDepth = 0;
    if (rippleDelayTimer) {
        clearTimeout(rippleDelayTimer);
        rippleDelayTimer = null;
    }
    startRippleCollapse(e.clientX, e.clientY);
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length) await importFile(files[0]);
});

window.addEventListener('resize', () => {
    if (ripplePhase === 'expand' || ripplePhase === 'hold') {
        rippleR = rippleMaxRadius(rippleCX, rippleCY) + 60;
        applyRippleMask();
    }
});

/* =========================================================
   文件导入
   ========================================================= */
const TEXT_EXT = ['txt', 'md', 'markdown', 'text'];
const FONT_EXT = ['ttf', 'otf', 'woff', 'woff2'];

let mammothPromise = null;
function ensureMammoth() {
    if (window.mammoth) return Promise.resolve();
    if (mammothPromise) return mammothPromise;
    mammothPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('无法加载 docx 解析库'));
        document.head.appendChild(s);
    });
    return mammothPromise;
}

let jszipPromise = null;
function ensureJSZip() {
    if (window.JSZip) return Promise.resolve();
    if (jszipPromise) return jszipPromise;
    jszipPromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js';
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('无法加载 odt 解析库'));
        document.head.appendChild(s);
    });
    return jszipPromise;
}

function extractOdtText(xmlString) {
    const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('ODT 内容解析失败');
    const TEXT_NS = 'urn:oasis:names:tc:opendocument:xmlns:text:1.0';
    const lines = [];
    const all = doc.getElementsByTagName('*');
    for (let i = 0; i < all.length; i++) {
        const el = all[i];
        if (el.localName === 'p' || el.localName === 'h') {
            lines.push(readNode(el, TEXT_NS));
        }
    }
    return lines.join('\n');
}

function readNode(el, TEXT_NS) {
    let out = '';
    const kids = el.childNodes;
    for (let i = 0; i < kids.length; i++) {
        const c = kids[i];
        if (c.nodeType === 3) out += c.nodeValue;
        else if (c.nodeType === 1) {
            const ln = c.localName;
            if (ln === 's') {
                const n = parseInt(c.getAttributeNS(TEXT_NS, 'c') || '1', 10);
                out += ' '.repeat(Number.isNaN(n) ? 1 : n);
            } else if (ln === 'tab') out += '\t';
            else if (ln === 'line-break') out += '\n';
            else out += readNode(c, TEXT_NS);
        }
    }
    return out;
}

function toast(message) {
    try { mdui.snackbar({ message, placement: 'bottom' }); }
    catch (_) { console.log(message); }
}

async function importFontFile(file) {
    try {
        const buffer = await file.arrayBuffer();
        const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const familyName = 'UserFont_' + baseName + '_' + Date.now();
        const fontFace = new FontFace(familyName, buffer);
        await fontFace.load();
        document.fonts.add(fontFace);
        state.customFontFamily = familyName;
        customFontOption.disabled = false;
        customFontOption.textContent = '自定义：' + baseName;

        requestAnimationFrame(() => {
            /* 先清空再设值，强制 mdui-select 重新读取 menu-item 的文本 */
            fontFamilySelect.value = '';
            fontFamilySelect.value = 'custom';

            state.fontFamily = 'custom';
            applyStyles();
        });
        toast('字体已加载：' + file.name);
    } catch (err) {
        console.error(err);
        toast('字体加载失败：' + (err.message || err));
    }
}

async function importFile(file) {
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (FONT_EXT.includes(ext)) {
        await importFontFile(file);
        return;
    }

    try {
        if (TEXT_EXT.includes(ext)) {
            editorField.value = await file.text();
        } else if (ext === 'docx') {
            await ensureMammoth();
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            editorField.value = result.value || '';
        } else if (ext === 'odt') {
            await ensureJSZip();
            const arrayBuffer = await file.arrayBuffer();
            const zip = await window.JSZip.loadAsync(arrayBuffer);
            const contentFile = zip.file('content.xml');
            if (!contentFile) throw new Error('无效的 ODT 文件');
            const xml = await contentFile.async('string');
            editorField.value = extractOdtText(xml);
        } else if (ext === 'doc') {
            toast('老式 .doc 二进制格式无法解析，请先另存为 .docx 后再导入');
            return;
        } else {
            toast('不支持的文件格式：.' + ext);
            return;
        }
        updateText();
        mainScroller.reset();
        toast('已导入：' + file.name);
    } catch (err) {
        console.error(err);
        toast('导入失败：' + (err.message || err));
    }
}

importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (file) await importFile(file);
});

/* =========================================================
   首次引导
   ========================================================= */
const GUIDE_KEY = 'mdui-prompter-guide-dismissed-v1';

function isGuideDismissed() {
    try { return localStorage.getItem(GUIDE_KEY) === '1'; }
    catch (_) { return false; }
}

function dismissGuide() {
    try { localStorage.setItem(GUIDE_KEY, '1'); } catch (_) {}
    guideOverlay.classList.remove('show');
    guideOverlay.hidden = true;
}

function updateGuidePosition() {
    if (guideOverlay.hidden) return;
    const rect = startBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    guideGlow.style.left = cx + 'px';
    guideGlow.style.top  = cy + 'px';

    const glowRadius = 90;
    const arrowTop = cy + glowRadius + 12;
    guideArrow.style.left = cx + 'px';
    guideArrow.style.top  = arrowTop + 'px';

    const textTop = arrowTop + 18 + 12;
    guideText.style.top = textTop + 'px';

    guideText.style.left = '0px';
    guideText.style.right = 'auto';
    guideText.style.transform = 'translateX(-50%)';
    const textW = guideText.offsetWidth;
    const textLeft = cx - textW / 2;
    const textRight = cx + textW / 2;

    if (textRight > window.innerWidth - 16) {
        guideText.style.left = 'auto';
        guideText.style.right = '16px';
        guideText.style.transform = 'none';
    } else if (textLeft < 16) {
        guideText.style.left = '16px';
        guideText.style.right = 'auto';
        guideText.style.transform = 'none';
    }
}

function showGuide() {
    guideOverlay.hidden = false;
    requestAnimationFrame(() => {
        guideOverlay.classList.add('show');
        updateGuidePosition();
    });
}

window.addEventListener('resize', updateGuidePosition, { passive: true });
window.addEventListener('scroll', updateGuidePosition, { passive: true });

guideOverlay.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dismissGuide();
});

function maybeShowGuide() {
    if (isGuideDismissed()) return;
    requestAnimationFrame(() => requestAnimationFrame(() => { showGuide(); }));
}

/* =========================================================
   窗口尺寸变化
   ========================================================= */
window.addEventListener('resize', () => {
    previewScroller.measure();
    mainScroller.measure();
});

/* =========================================================
   初始化
   ========================================================= */
editorField.value = `欢迎使用提词器。

点击顶栏的「开始提词」按钮进入全屏，文本会自动从下往上滚动。

【全屏操作】
· 鼠标滚轮 —— 滚动文本（滚动时暂停，停手后继续）
· 按住 / 触摸拖动文本 —— 立即暂停，松手后继续
· 空格 —— 暂停 / 继续
· ↑ / ← / PgUp —— 向上翻 2 行
· ↓ / → / PgDn —— 向下翻 2 行
· R —— 重置回起始位置
· ESC —— 退出全屏

【导入】
· 文档：txt / md / docx / odt
· 字体：ttf / otf / woff / woff2
· 点击顶栏的「导入」图标按钮，或直接把文件拖入页面

【字体与文本宽度】
· 字体设置在底栏「字体」页里
· 文本宽度滑块可调节左右页边距（10% ~ 100%）`;

updateText();
applyStyles();
previewScroller.playing = true;

if (window.customElements && customElements.whenDefined) {
    Promise.allSettled([
        customElements.whenDefined('mdui-slider'),
        customElements.whenDefined('mdui-chip'),
        customElements.whenDefined('mdui-text-field'),
        customElements.whenDefined('mdui-button-icon'),
        customElements.whenDefined('mdui-select'),
        customElements.whenDefined('mdui-menu-item'),
        customElements.whenDefined('mdui-dialog'),
        customElements.whenDefined('mdui-top-app-bar'),
        customElements.whenDefined('mdui-top-app-bar-title'),
        customElements.whenDefined('mdui-navigation-bar')
    ]).then(() => {
        requestAnimationFrame(() => {
            applyStyles();
            updateText();
            setTimeout(maybeShowGuide, 400);
        });
    });
}