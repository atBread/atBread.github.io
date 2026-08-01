(function() {
    const canvas = document.getElementById('dotCanvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.getElementById('wrapper');

    const LOGICAL_SIZE = 192;
    const GRID_SPACING = 5;
    const GRID_OFFSET = 1;
    const DOT_RADIUS = 1.75;
    const NUM_GRID_POINTS = 39;
    const INSET_MARGIN = 24;

    const SPRING_K = 38;
    const DAMPING = 11.5;
    const MOUSE_RANGE = 26;
    const THRUST_COEFF = 2.8;
    const MAX_THRUST = 480;
    const STILL_TIMEOUT = 2000;

    const SCALE = (LOGICAL_SIZE - 2 * INSET_MARGIN) / LOGICAL_SIZE;
    const OFFSET_X = INSET_MARGIN;
    const OFFSET_Y = INSET_MARGIN;

    let cssSize = 540;
    let dprScale = 1;
    let dots = [];

    let mouseX = -100, mouseY = -100;
    let prevMouseX = -100, prevMouseY = -100;
    let mouseSpeed = 0;
    let lastMoveTime = 0;
    let still = true;
    let inside = false;

    const breadSVG = `<?xml version="1.0" encoding="UTF-8"?>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <path d="M0 0 C2.59548318 0.00315221 5.18981356 -0.02035904 7.78515625 -0.0456543 C41.91430202 -0.17551458 73.2457685 11.41210436 98.31689453 34.78100586 C106.20671592 42.611037 111.19410318 51.29681831 111.28076172 62.47021484 C111.26674316 63.30609131 111.25272461 64.14196777 111.23828125 65.00317383 C111.22812988 65.88094482 111.21797852 66.75871582 111.20751953 67.66308594 C110.89651383 80.79885758 107.98892449 92.91629117 98.69140625 102.63598633 C95.46654496 106.3597129 95.12741879 109.50223192 95.42578125 114.31567383 C95.44737305 115.12875 95.46896484 115.94182617 95.49121094 116.77954102 C95.58202095 119.96013376 95.72298983 123.13686532 95.86328125 126.31567383 C96.10717019 132.18256679 96.32300613 138.04996326 96.51730347 143.91870117 C96.61208348 146.5326404 96.73402568 149.14436854 96.85766602 151.75708008 C96.91793007 153.40677982 96.97713624 155.05651864 97.03515625 156.70629883 C97.07771042 157.45470032 97.12026459 158.20310181 97.16410828 158.97418213 C97.34955733 165.52183645 95.17963321 170.39141049 91.13671875 175.49536133 C83.60266222 182.22330481 74.74259413 186.63899987 65.86328125 191.31567383 C64.25358142 192.17444024 62.64420474 193.03381265 61.03515625 193.89379883 C56.32775384 196.39997717 51.60125682 198.86784003 46.86328125 201.31567383 C46.18056152 201.66871582 45.4978418 202.02175781 44.79443359 202.38549805 C36.74658027 206.52739645 28.59514902 210.42798862 20.36328125 214.19067383 C19.53836182 214.57231689 18.71344238 214.95395996 17.86352539 215.34716797 C10.43076175 218.70047018 1.86632283 222.32896803 -6.28491211 219.59521484 C-12.77844645 216.96648288 -19.06634063 214.02475533 -25.32421875 210.87817383 C-26.3615918 210.35739258 -27.39896484 209.83661133 -28.46777344 209.30004883 C-39.56912772 203.67043619 -50.37959279 197.57266215 -61.13671875 191.31567383 C-62.02407715 190.80504395 -62.91143555 190.29441406 -63.82568359 189.76831055 C-72.90860509 184.53262984 -81.76195283 179.11306874 -90.19921875 172.87817383 C-90.86042725 172.39405029 -91.52163574 171.90992676 -92.20288086 171.41113281 C-96.26943444 168.31478042 -99.56981151 165.62305017 -100.47862244 160.32098389 C-101.23902413 153.20680789 -101.06766678 146.25568256 -100.76953125 139.11645508 C-100.68701123 136.58330966 -100.60633683 134.05010356 -100.52734375 131.5168457 C-100.39930762 127.55929831 -100.26065735 123.60345077 -100.09082031 119.64746094 C-99.9299574 115.80412224 -99.81466067 111.96160503 -99.70703125 108.11645508 C-99.64589142 106.9371492 -99.58475159 105.75784332 -99.52175903 104.5428009 C-99.29289326 98.48521234 -99.29289326 98.48521234 -101.65061951 93.08943176 C-103.46996415 91.22459312 -103.46996415 91.22459312 -105.41114807 89.73526001 C-112.08202851 84.24728446 -115.50674567 72.24542047 -116.3828125 63.99926758 C-116.85579283 54.8406484 -114.13375914 47.22407697 -108.19921875 40.25317383 C-87.57362651 19.02292254 -58.76961692 7.69781781 -30.13671875 2.31567383 C-29.20859375 2.13093506 -28.28046875 1.94619629 -27.32421875 1.75585938 C-18.21416812 0.12523565 -9.22481643 -0.02333865 0 0 Z" fill="#DF7F14" transform="translate(122.13671875,10.684326171875)"/>
    <path d="M0 0 C0.66644531 0.17160645 1.33289062 0.34321289 2.01953125 0.52001953 C11.89979928 3.08403157 20.99207443 6.47311745 30.10546875 11.05859375 C32.05692024 12.02828408 34.02498764 12.95434627 36 13.875 C53.43697913 22.11011931 73.3439452 34.64785126 80.3125 53.5625 C81.95345543 61.76727715 80.49631362 67.04900598 76 74 C72.70701152 77.71675107 68.56436674 80.11471808 64 82 C62.68 82 61.36 82 60 82 C60.00444122 82.89535965 60.00888245 83.7907193 60.01345825 84.71321106 C60.05350608 93.14461571 60.08396969 101.57598848 60.10362434 110.00746632 C60.11406862 114.34233973 60.12823953 118.67713465 60.15087891 123.01196289 C60.17258438 127.19407105 60.18456378 131.37610364 60.18975449 135.55826378 C60.19345438 137.15508909 60.2006792 138.75191018 60.21146011 140.34870338 C60.22594465 142.58257665 60.22797924 144.81613628 60.22705078 147.05004883 C60.231492 148.32245926 60.23593323 149.59486969 60.24050903 150.90583801 C60 154 60 154 58 157 C52.65873302 156.46759768 48.27882433 155.08259427 43.3984375 152.82421875 C42.68799286 152.50303574 41.97754822 152.18185272 41.24557495 151.85093689 C38.95008389 150.80761286 36.66208631 149.74910983 34.375 148.6875 C33.20148987 148.14703033 33.20148987 148.14703033 32.00427246 147.59564209 C19.26944338 141.71985937 6.89903613 135.44957601 -5 128 C-5.72606445 127.54898926 -6.45212891 127.09797852 -7.20019531 126.63330078 C-24.65112172 115.69775657 -24.65112172 115.69775657 -28 109 C-28.0454216 107.0193769 -28.02346182 105.03708187 -27.97070312 103.05664062 C-27.94157837 101.80774048 -27.91245361 100.55884033 -27.88244629 99.27209473 C-27.8653511 98.6020491 -27.84825592 97.93200348 -27.8306427 97.24165344 C-27.74634005 93.68232103 -27.69987274 90.122433 -27.6484375 86.5625 C-27.58260976 82.03683115 -27.50534888 77.51263015 -27.37597656 72.98828125 C-27.27234718 69.32892702 -27.21405185 65.67122059 -27.18504333 62.01054382 C-27.16605664 60.62294518 -27.13106362 59.23546047 -27.07899475 57.84870911 C-26.80055759 50.18647925 -27.06723748 45.20233874 -32.36914062 39.39257812 C-33.16276001 38.65914185 -33.95637939 37.92570557 -34.77404785 37.17004395 C-40.87943398 31.21800396 -43.93741058 21.87066215 -44.375 13.5 C-44.24152096 8.60298762 -42.9266788 5.92791102 -40 2 C-28.89581139 -6.79081598 -12.69963565 -3.4075531 0 0 Z" fill="#FEEAC8" transform="translate(59,58)"/>
    <path d="M0 0 C2.59548318 0.00315221 5.18981356 -0.02035904 7.78515625 -0.0456543 C42.64199674 -0.17828343 74.70027621 11.94110962 99.86328125 36.31567383 C105.86328125 43.01285693 105.86328125 43.01285693 105.86328125 46.31567383 C89.47791336 53.75891149 72.96111393 60.86097986 56.36328125 67.81567383 C55.42962738 68.20785095 54.49597351 68.60002808 53.5340271 69.00408936 C47.6558474 71.471279 41.76735346 73.91110624 35.86328125 76.31567383 C34.6928125 76.79520508 33.52234375 77.27473633 32.31640625 77.76879883 C31.3521875 78.14520508 30.38796875 78.52161133 29.39453125 78.90942383 C28.61658203 79.21557617 27.83863281 79.52172852 27.03710938 79.8371582 C24.32328935 80.43453997 22.51070621 80.11375012 19.86328125 79.31567383 C17.71484375 77.38208008 17.71484375 77.38208008 15.48828125 74.87817383 C2.2720381 61.19478806 -16.56387183 51.67281035 -34.32421875 45.32348633 C-36.8439417 44.42058561 -39.25190505 43.39487119 -41.69921875 42.31567383 C-54.49058475 37.32192454 -67.01745843 34.85101167 -80.76171875 34.75317383 C-82.37820312 34.7314209 -82.37820312 34.7314209 -84.02734375 34.70922852 C-90.3273351 34.78934627 -95.258847 35.72219051 -100.99365234 38.36279297 C-103.0344902 39.27021951 -104.95899278 39.84310173 -107.13671875 40.31567383 C-101.95918368 33.36298388 -95.36025515 28.92001994 -88.13671875 24.31567383 C-87.09773438 23.64407227 -86.05875 22.9724707 -84.98828125 22.28051758 C-68.24120286 12.08223618 -49.32968302 5.92338746 -30.13671875 2.31567383 C-29.20859375 2.13093506 -28.28046875 1.94619629 -27.32421875 1.75585938 C-18.21416812 0.12523565 -9.22481643 -0.02333865 0 0 Z" fill="#F4AF3D" transform="translate(122.13671875,10.684326171875)"/>
    <path d="M0 0 C0.64932112 16.04063647 -1.8815708 29.53750937 -12.25 42.1875 C-13.1575 43.115625 -14.065 44.04375 -15 45 C-15.66 45 -16.32 45 -17 45 C-17 47.97 -17 50.94 -17 54 C-34.89320321 61.77536529 -52.82573936 69.4333601 -70.9375 76.6875 C-71.66135895 76.97868713 -72.3852179 77.26987427 -73.13101196 77.56988525 C-96.60728095 87 -96.60728095 87 -104 87 C-104 83.7 -104 80.4 -104 77 C-103.2265625 76.6596875 -102.453125 76.319375 -101.65625 75.96875 C-92.32272974 71.62542869 -85.30703859 66.70781908 -80.76318359 57.28320312 C-79.10938796 52.33557142 -79.89998886 47.10769281 -80.24414062 41.98242188 C-80.33984217 39.5826606 -80.36942877 37.37326441 -80 35 C-78.1484375 33.19921875 -78.1484375 33.19921875 -75 32 C-73.43556143 31.25941143 -71.87477189 30.51109598 -70.31640625 29.7578125 C-68.40029979 28.87614974 -66.48218694 27.99883936 -64.5625 27.125 C-63.52134033 26.64957764 -62.48018066 26.17415527 -61.4074707 25.68432617 C-48.01931096 19.60380878 -34.51548595 13.79043756 -21 8 C-19.96117676 7.55366211 -18.92235352 7.10732422 -17.85205078 6.64746094 C-15.15336029 5.48939178 -12.45241745 4.33684044 -9.75 3.1875 C-8.97615967 2.85596924 -8.20231934 2.52443848 -7.4050293 2.18286133 C-2.2338338 0 -2.2338338 0 0 0 Z" fill="#AC5810" transform="translate(233,72)"/>
    </svg>`;

    function loadAndSample() {
        return new Promise(resolve => {
            const blob = new Blob([breadSVG], {type: 'image/svg+xml'});
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                const off = document.createElement('canvas');
                off.width = LOGICAL_SIZE; off.height = LOGICAL_SIZE;
                const octx = off.getContext('2d');
                octx.drawImage(img, 0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
                const data = octx.getImageData(0, 0, LOGICAL_SIZE, LOGICAL_SIZE).data;
                const pts = [];
                for (let gy = 0; gy < NUM_GRID_POINTS; gy++) {
                    const sy = GRID_OFFSET + gy * GRID_SPACING;
                    if (sy >= LOGICAL_SIZE) continue;
                    const rowBase = Math.round(sy) * LOGICAL_SIZE;
                    for (let gx = 0; gx < NUM_GRID_POINTS; gx++) {
                        const sx = GRID_OFFSET + gx * GRID_SPACING;
                        if (sx >= LOGICAL_SIZE) continue;
                        const idx = (rowBase + Math.round(sx)) * 4;
                        if (data[idx+3] > 25) {
                            pts.push({ ox: sx, oy: sy, x: sx, y: sy, vx: 0, vy: 0,
                                r: data[idx], g: data[idx+1], b: data[idx+2] });
                        }
                    }
                }
                dots = pts;
                URL.revokeObjectURL(url);
                resolve();
            };
            img.onerror = () => {
                const cx = LOGICAL_SIZE/2, cy = LOGICAL_SIZE/2+4, rx = 78, ry = 56;
                const pts = [];
                for (let gy = 0; gy < NUM_GRID_POINTS; gy++) {
                    const sy = GRID_OFFSET + gy * GRID_SPACING;
                    if (sy >= LOGICAL_SIZE) continue;
                    for (let gx = 0; gx < NUM_GRID_POINTS; gx++) {
                        const sx = GRID_OFFSET + gx * GRID_SPACING;
                        if (sx >= LOGICAL_SIZE) continue;
                        const nx = (sx-cx)/rx, ny = (sy-cy)/ry;
                        if (nx*nx+ny*ny <= 1) {
                            const t = Math.sqrt(nx*nx+ny*ny);
                            pts.push({ ox: sx, oy: sy, x: sx, y: sy, vx:0, vy:0,
                                r: Math.round(200+t*40), g: Math.round(130+t*80), b: Math.round(40+t*100) });
                        }
                    }
                }
                dots = pts;
                URL.revokeObjectURL(url);
                resolve();
            };
            img.src = url;
        });
    }

    function resize() {
        const maxSize = Math.min(window.innerWidth * 0.88, window.innerHeight * 0.75, 550);
        cssSize = Math.max(200, Math.floor(maxSize));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const physical = Math.floor(cssSize * dpr);
        canvas.width = physical;
        canvas.height = physical;
        canvas.style.width = cssSize + 'px';
        canvas.style.height = cssSize + 'px';
        dprScale = physical / LOGICAL_SIZE;
    }

    function update(dt) {
        const dtClamped = Math.min(dt, 0.05);
        const now = performance.now();
        still = (now - lastMoveTime) > STILL_TIMEOUT;
        const applyThrust = inside && !still && mouseSpeed > 0.5;
        for (const p of dots) {
            const dx = p.x - p.ox, dy = p.y - p.oy;
            let fx = -SPRING_K * dx - DAMPING * p.vx;
            let fy = -SPRING_K * dy - DAMPING * p.vy;
            if (applyThrust) {
                const mdx = p.x - mouseX, mdy = p.y - mouseY;
                const dist = Math.sqrt(mdx*mdx + mdy*mdy);
                if (dist < MOUSE_RANGE && dist > 0.01) {
                    const nx = mdx/dist, ny = mdy/dist;
                    const falloff = 1 - dist/MOUSE_RANGE;
                    const smooth = falloff * falloff * (3 - 2*falloff);
                    let thrust = mouseSpeed * THRUST_COEFF * smooth;
                    if (thrust > MAX_THRUST) thrust = MAX_THRUST;
                    fx += nx * thrust; fy += ny * thrust;
                }
            }
            p.vx += fx * dtClamped; p.vy += fy * dtClamped;
            p.x += p.vx * dtClamped; p.y += p.vy * dtClamped;
            const sp = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
            if (sp > 800) { const s = 800/sp; p.vx *= s; p.vy *= s; }
        }
    }

    function draw() {
        ctx.setTransform(dprScale, 0, 0, dprScale, 0, 0);
        ctx.clearRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

        const grad = ctx.createRadialGradient(LOGICAL_SIZE/2, LOGICAL_SIZE/2-8, 15, LOGICAL_SIZE/2, LOGICAL_SIZE/2, LOGICAL_SIZE*0.75);
        grad.addColorStop(0, '#2c261f');
        grad.addColorStop(0.5, '#1f1a14');
        grad.addColorStop(1, '#14100c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

        const shadowCx = LOGICAL_SIZE/2, shadowCy = LOGICAL_SIZE/2 + 50;
        const sgrad = ctx.createRadialGradient(shadowCx, shadowCy+15, 15, shadowCx, shadowCy+18, 85);
        sgrad.addColorStop(0, 'rgba(0,0,0,0.32)');
        sgrad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        sgrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sgrad;
        ctx.beginPath();
        ctx.arc(shadowCx, shadowCy+16, 85, 0, Math.PI*2);
        ctx.fill();

        const buckets = {};
        for (const p of dots) {
            const key = `${p.r},${p.g},${p.b}`;
            if (!buckets[key]) buckets[key] = [];
            buckets[key].push(p);
        }
        for (const [key, pts] of Object.entries(buckets)) {
            const [r, g, b] = key.split(',').map(Number);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            for (const p of pts) {
                const sx = p.x * SCALE + OFFSET_X;
                const sy = p.y * SCALE + OFFSET_Y;
                ctx.moveTo(sx + DOT_RADIUS, sy);
                ctx.arc(sx, sy, DOT_RADIUS, 0, Math.PI*2);
            }
            ctx.fill();
        }
    }

    function toLogical(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const px = clientX - rect.left, py = clientY - rect.top;
        const rawX = px / (cssSize / LOGICAL_SIZE);
        const rawY = py / (cssSize / LOGICAL_SIZE);
        return { lx: (rawX - OFFSET_X) / SCALE, ly: (rawY - OFFSET_Y) / SCALE };
    }

    function onPointerMove(e) {
        const {lx, ly} = toLogical(e.clientX, e.clientY);
        prevMouseX = mouseX; prevMouseY = mouseY;
        mouseX = lx; mouseY = ly;
        const dist = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
        const now = performance.now();
        if (dist > 0.3) { lastMoveTime = now; if (still) still = false; }
        const inBounds = mouseX >= 0 && mouseX < LOGICAL_SIZE && mouseY >= 0 && mouseY < LOGICAL_SIZE;
        if (inBounds && !inside) {
            inside = true; wrapper.classList.add('active');
            prevMouseX = mouseX; prevMouseY = mouseY; lastMoveTime = now;
        } else if (!inBounds && inside) {
            inside = false; wrapper.classList.remove('active');
            still = true; lastMoveTime = 0;
        }
    }

    function onPointerLeave() {
        inside = false; wrapper.classList.remove('active');
        still = true; lastMoveTime = 0;
        mouseX = mouseY = -100; prevMouseX = prevMouseY = -100; mouseSpeed = 0;
    }

    function onPointerEnter(e) {
        const {lx, ly} = toLogical(e.clientX, e.clientY);
        mouseX = lx; mouseY = ly; prevMouseX = mouseX; prevMouseY = mouseY;
        inside = true; wrapper.classList.add('active');
        lastMoveTime = performance.now(); still = false; mouseSpeed = 0;
    }

    let lastFrame = 0, speedSmooth = 0;
    function frame(ts) {
        if (!lastFrame) lastFrame = ts;
        let dt = (ts - lastFrame) / 1000;
        lastFrame = ts;
        if (dt > 0.1) dt = 0.1;
        if (dt <= 0) dt = 0.016;
        const raw = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY) / Math.max(dt, 0.001);
        speedSmooth += (raw - speedSmooth) * Math.min(1, dt*12);
        mouseSpeed = speedSmooth;
        prevMouseX = mouseX; prevMouseY = mouseY;
        update(dt);
        draw();
        requestAnimationFrame(frame);
    }

    async function init() {
        resize();
        window.addEventListener('resize', () => {
            resize();
            inside = false; still = true; mouseX = mouseY = -100;
            lastMoveTime = 0; wrapper.classList.remove('active');
        });
        canvas.addEventListener('pointermove', onPointerMove, {passive: true});
        canvas.addEventListener('pointerleave', onPointerLeave);
        canvas.addEventListener('pointerenter', onPointerEnter);
        canvas.addEventListener('pointerdown', (e) => {
            onPointerMove(e); lastMoveTime = performance.now(); still = false;
        });
        await loadAndSample();
        requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
