const mask = document.getElementById('mask');
const wrapBox = document.getElementById('wrap');
const vSvg = document.getElementById('vSvg');
const config = {
    stepSize: 100,
    wheelSens: 1,
    touchSens: 1,
    maxHeight: window.innerHeight,
    targetHeight: 0,
    currentHeight: 0,
    ease: 0.08,
    maxBlur: 12,
    maskBaseColor: 'rgb(255,255,255)',
    arrowDestroyed: false,
    arrowSpeedRatio: 1.2,
    arrowOffsetTop: 33
};

function animateMask() {
    config.currentHeight += (config.targetHeight - config.currentHeight) * config.ease;
    mask.style.height = config.currentHeight + 'px';

    const ratio = config.currentHeight / config.maxHeight;

    if (!config.arrowDestroyed) {
        // 速度133% + 距离蒙版顶部固定上方33px
        const arrowBottom = config.currentHeight * config.arrowSpeedRatio + config.arrowOffsetTop;
        vSvg.style.bottom = `${arrowBottom}px`;

        // 滑出屏幕直接销毁，无淡化
        if (arrowBottom >= config.maxHeight) {
            vSvg.style.visibility = 'hidden';
            config.arrowDestroyed = true;
        }
    }

    if (ratio >= 1) {
        mask.style.background = config.maskBaseColor;
        wrapBox.style.filter = 'none';
    } else {
        mask.style.background = `rgba(255, 255, 255, ${ratio})`;
        const blurPx = ratio * config.maxBlur;
        wrapBox.style.filter = `blur(${blurPx}px)`;
    }

    requestAnimationFrame(animateMask);
}
animateMask();

function setTargetHeight(h) {
    config.targetHeight = Math.max(0, Math.min(config.maxHeight, h));
}

// PC滚轮方向反转，单次步进100px
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const delta = direction * config.stepSize * config.wheelSens;
    setTargetHeight(config.targetHeight + delta);
}, {passive: false});

// 移动端触控双向滑动
let startY = 0;
window.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
}, {passive:true});

window.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    const slideDelta = (startY - currentY) * config.touchSens;
    e.preventDefault();
    setTargetHeight(config.targetHeight + slideDelta);
    startY = currentY;
}, {passive:false});

window.addEventListener('resize', () => {
    config.maxHeight = window.innerHeight;
    setTargetHeight(config.targetHeight);
})