// 拦截图片右键、拖拽
document.addEventListener('dragstart', e => e.target.tagName === 'IMG' && e.preventDefault());
document.addEventListener('contextmenu', e => e.target.tagName === 'IMG' && e.preventDefault());

// 28张素材数据
const sourceData = [
    {id:1,name:"1",img:"xvyu/src/img/1.jpg"},
    {id:2,name:"2",img:"xvyu/src/img/2.jpg"},
    {id:3,name:"3",img:"xvyu/src/img/3.jpg"},
    {id:4,name:"4",img:"xvyu/src/img/4.jpg"},
    {id:5,name:"5",img:"xvyu/src/img/5.jpg"},
    {id:6,name:"6",img:"xvyu/src/img/6.jpg"},
    {id:7,name:"7",img:"xvyu/src/img/7.jpg"},
    {id:8,name:"8",img:"xvyu/src/img/8.jpg"},
    {id:9,name:"9",img:"xvyu/src/img/9.jpg"},
    {id:10,name:"10",img:"xvyu/src/img/10.jpg"},
    {id:11,name:"11",img:"xvyu/src/img/11.jpg"},
    {id:12,name:"12",img:"xvyu/src/img/12.jpg"},
    {id:13,name:"13",img:"xvyu/src/img/13.jpg"},
    {id:14,name:"14",img:"xvyu/src/img/14.jpg"},
    {id:15,name:"15",img:"xvyu/src/img/15.jpg"},
    {id:16,name:"16",img:"xvyu/src/img/16.jpg"},
    {id:17,name:"17",img:"xvyu/src/img/17.jpg"},
    {id:18,name:"18",img:"xvyu/src/img/18.jpg"},
    {id:19,name:"19",img:"xvyu/src/img/19.jpg"},
    {id:20,name:"20",img:"xvyu/src/img/20.jpg"},
    {id:21,name:"21",img:"xvyu/src/img/21.jpg"},
    {id:22,name:"22",img:"xvyu/src/img/22.jpg"},
    {id:23,name:"23",img:"xvyu/src/img/23.jpg"},
    {id:24,name:"24",img:"xvyu/src/img/24.jpg"},
    {id:25,name:"25",img:"xvyu/src/img/25.jpg"},
    {id:26,name:"26",img:"xvyu/src/img/26.jpg"},
    {id:27,name:"27",img:"xvyu/src/img/27.jpg"},
    {id:28,name:"28",img:"xvyu/src/img/28.jpg"},
];
let state = { filterList: [...sourceData] };

// DOM元素
const gridBox = document.getElementById('gridBox');
const searchInput = document.getElementById('searchInput');
const previewDialog = document.getElementById('previewDialog');
const previewImg = document.getElementById('previewImg');
const closePreview = document.getElementById('closePreview');

// 缩放全局变量
let scale = 1;
const maxScale = 2.5;
const wheelStep = 0.15;
let offsetX = 0;
let offsetY = 0;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffX = 0;
let dragStartOffY = 0;
let isDragging = false;

// 更新图片变换样式
function updateTransform() {
    previewImg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    if (scale > 1) {
        previewImg.classList.add('zoom');
    } else {
        previewImg.classList.remove('zoom');
    }
}

// 重置图片缩放位置
function resetImage() {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    isDragging = false;
    previewImg.classList.remove('zoom', 'drag');
    updateTransform();
}

// ========== 鼠标滚轮缩放 ==========
previewImg.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        scale += wheelStep;
    } else {
        scale -= wheelStep;
    }
    scale = Math.max(1, Math.min(maxScale, scale));
    updateTransform();
});

// ========== 单击切换放大缩小 ==========
previewImg.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isDragging) return;
    if (scale === 1) {
        scale = maxScale;
    } else {
        resetImage();
    }
    updateTransform();
});

// ========== 拖拽逻辑 ==========
previewImg.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true;
    previewImg.classList.add('drag');
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartOffX = offsetX;
    dragStartOffY = offsetY;
});
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    offsetX = dragStartOffX + (e.clientX - dragStartX);
    offsetY = dragStartOffY + (e.clientY - dragStartY);
    updateTransform();
});
document.addEventListener('mouseup', () => {
    isDragging = false;
    previewImg.classList.remove('drag');
});

// 关闭弹窗自动重置
closePreview.addEventListener('click', () => {
    previewDialog.open = false;
});
previewDialog.addEventListener('open', resetImage);

// 渲染缩略图（A5固定比例容器）
function renderList() {
    gridBox.innerHTML = '';
    state.filterList.forEach(item => {
        const card = document.createElement('mdui-card');
        card.className = 'thumb-card';
        card.innerHTML = `
      <div class="thumb-box">
        <img class="thumb-img" src="${item.img}" alt="${item.name}">
      </div>
      <div style="padding:12px">
        <div class="mdui-typescale-label-large">${item.name}</div>
    `;
        card.querySelector('.thumb-img').addEventListener('click', () => {
            previewImg.src = item.img;
            previewDialog.open = true;
        });
        gridBox.appendChild(card);
    });
}

// 搜索过滤
function handleSearch() {
    const kw = searchInput.value.trim().toLowerCase();
    if (!kw) {
        state.filterList = [...sourceData];
    } else {
        state.filterList = sourceData.filter(item => item.name.toLowerCase().includes(kw));
    }
    renderList();
}
searchInput.addEventListener('input', handleSearch);

renderList();
