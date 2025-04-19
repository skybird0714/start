// ========== 时间与日期 ========== //
function updateTime() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    // 北京时间
    const bjNow = new Date(now.getTime() + (8 - now.getTimezoneOffset() / 60) * 3600000 - now.getTimezoneOffset() * 60000);
    document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
    document.getElementById('date').textContent = `${bjNow.getFullYear()}年${pad(bjNow.getMonth()+1)}月${pad(bjNow.getDate())}日 ${week[bjNow.getDay()]}`;
}
setInterval(updateTime, 1000);
updateTime();

// ========== 天气 ========== //
async function updateWeather() {
    let city = '北京';
    try {
        const locRes = await fetch('https://restapi.amap.com/v3/ip?key=96cb56ee35b04238271d5de6e66de61b');
        const locData = await locRes.json();
        if(locData.city) city = locData.city;
    } catch {}
    try {
        const weatherRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(city)}&key=96cb56ee35b04238271d5de6e66de61b`);
        const weatherData = await weatherRes.json();
        if(weatherData.status==='1' && weatherData.lives && weatherData.lives[0]) {
            const w = weatherData.lives[0];
            document.getElementById('weather').textContent = `${w.city} ${w.weather} ${w.temperature}℃ 湿度${w.humidity}% ${w.winddirection}${w.windpower}级`;
        } else {
            document.getElementById('weather').textContent = '天气获取失败';
        }
    } catch {
        document.getElementById('weather').textContent = '天气获取失败';
    }
}
updateWeather();

// ========== 搜索引擎 ========== //
const ENGINES = [
    {name:'必应', icon:'icons/bing.png', url:'https://www.bing.com/search?q=%s'},
    {name:'百度', icon:'icons/baidu.png', url:'https://www.baidu.com/s?wd=%s'},
    {name:'谷歌', icon:'icons/google.png', url:'https://www.google.com/search?q=%s'},
    {name:'雅虎', icon:'icons/yahoo.png', url:'https://search.yahoo.com/search?p=%s'},
    {name:'Yandex', icon:'icons/yandex.png', url:'https://yandex.com/search/?text=%s'},
    {name:'DuckDuckGo', icon:'icons/duckduckgo.png', url:'https://duckduckgo.com/?q=%s'},
    {name:'360', icon:'icons/360.png', url:'https://www.so.com/s?q=%s'},
    {name:'搜狗', icon:'icons/sogou.png', url:'https://www.sogou.com/web?query=%s'},
    {name:'Bilibili', icon:'icons/bilibili.png', url:'https://search.bilibili.com/all?keyword=%s'},
    {name:'GitHub', icon:'icons/github.png', url:'https://github.com/search?q=%s'},
    {name:'微博', icon:'icons/weibo.png', url:'https://s.weibo.com/weibo/%s'},
    {name:'小红书', icon:'icons/xiaohongshu.png', url:'https://www.xiaohongshu.com/search_result/%s'},
    {name:'知乎', icon:'icons/zhihu.png', url:'https://www.zhihu.com/search?type=content&q=%s'},
    {name:'抖音', icon:'icons/douyin.png', url:'https://www.douyin.com/search/%s'},
    {name:'YouTube', icon:'icons/youtube.png', url:'https://www.youtube.com/results?search_query=%s'},
    {name:'Facebook', icon:'icons/facebook.png', url:'https://www.facebook.com/search/top/?q=%s'},
    {name:'X', icon:'icons/x.png', url:'https://x.com/search?q=%s'},
    {name:'Instagram', icon:'icons/instagram.png', url:'https://www.instagram.com/explore/tags/%s/'},
    {name:'淘宝', icon:'icons/taobao.png', url:'https://s.taobao.com/search?q=%s'},
    {name:'京东', icon:'icons/jd.png', url:'https://search.jd.com/Search?keyword=%s'},
];
function getAllEngines() {
    return ENGINES;
}
function getEngineIndex() {
    return parseInt(localStorage.getItem('engineIndex') || '0', 10);
}
function setEngineIndex(idx) {
    localStorage.setItem('engineIndex', idx);
}
function renderEngineBtn() {
    const idx = getEngineIndex();
    const all = getAllEngines();
    document.getElementById('engine-icon').src = all[idx].icon;
    document.getElementById('engine-icon').alt = all[idx].name;
}
function renderEngineList() {
    const list = document.getElementById('engine-list');
    const all = getAllEngines();
    const idx = getEngineIndex();
    list.innerHTML = all.map((e,i) =>
        `<div class="engine-item${i==idx?' selected':''}" data-idx="${i}">
            <img src="${e.icon}" style="width:1.5em;height:1.5em;margin-right:0.5em;">${e.name}
        </div>`
    ).join('');
}
renderEngineBtn();
renderEngineList();
// 事件绑定
const engineBtn = document.getElementById('engine-btn');
const engineList = document.getElementById('engine-list');
engineBtn.onclick = function(e) {
    e.stopPropagation();
    engineList.classList.toggle('hidden');
    if (!engineList.classList.contains('hidden')) {
        document.body.classList.add('engine-list-open');
    } else {
        document.body.classList.remove('engine-list-open');
    }
};
engineList.onclick = function(e) {
    let item = e.target;
    while(item && !item.classList.contains('engine-item')) item = item.parentElement;
    if(item) {
        const idx = item.getAttribute('data-idx');
        setEngineIndex(idx);
        renderEngineBtn();
        renderEngineList();
        engineList.classList.add('hidden');
        document.body.classList.remove('engine-list-open');
    }
};
document.addEventListener('click', function(e) {
    if(!engineList.contains(e.target) && e.target.id!=='engine-btn' && e.target.id!=='engine-icon') {
        engineList.classList.add('hidden');
        document.body.classList.remove('engine-list-open');
    }
});
// 搜索栏聚焦毛玻璃
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('focus', () => document.body.classList.add('input-focus'));
searchInput.addEventListener('blur', () => document.body.classList.remove('input-focus'));
// 搜索
function doSearch() {
    const idx = getEngineIndex();
    const engine = getAllEngines()[idx];
    const kw = document.getElementById('search-input').value.trim();
    if(kw && engine.url) {
        window.open(engine.url.replace('%s', encodeURIComponent(kw)), '_blank');
    }
}
document.getElementById('search-btn').onclick = doSearch;
searchInput.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') doSearch();
});
// 昼夜模式切换
function setNightMode(night) {
    if(night) {
        document.body.classList.add('night');
        localStorage.setItem('nightMode', '1');
    } else {
        document.body.classList.remove('night');
        localStorage.setItem('nightMode', '0');
    }
}
const modeSwitch = document.getElementById('mode-switch');
modeSwitch.checked = localStorage.getItem('nightMode') === '1';
setNightMode(modeSwitch.checked);
modeSwitch.addEventListener('change', function() {
    setNightMode(this.checked);
});
// 防止点击穿透
engineList.addEventListener('mousedown', function(e) { e.preventDefault(); });

// ========== 图标资源提示 ========== //
// 请将所有icons放在htmlgame/icons/目录下，文件名与js中一致 

// ========== 设置面板 ========== //
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const fontSizeRange = document.getElementById('font-size-range');
const blurRange = document.getElementById('blur-range');
const colorList = document.getElementById('color-list');

function openSettings() {
    document.body.classList.add('setting-open');
    settingsPanel.style.display = 'block';
    document.body.classList.add('input-focus'); // 打开时也加毛玻璃
}
function closeSettings() {
    document.body.classList.remove('setting-open');
    settingsPanel.style.display = 'none';
    document.body.classList.remove('input-focus');
}
settingsBtn.onclick = function(e) {
    e.stopPropagation();
    if(document.body.classList.contains('setting-open')) closeSettings();
    else openSettings();
};
document.addEventListener('click', function(e) {
    if(settingsPanel.contains(e.target) || settingsBtn.contains(e.target)) return;
    closeSettings();
});
settingsPanel.addEventListener('mousedown', function(e) { e.preventDefault(); });

// 字体大小
function setFontSize(size) {
    document.documentElement.style.setProperty('--font-size', size + 'px');
    localStorage.setItem('fontSize', size);
}
fontSizeRange.oninput = function() {
    setFontSize(this.value);
};
// 毛玻璃强度
function setBlur(strength) {
    document.documentElement.style.setProperty('--blur-strength', strength + 'px');
    localStorage.setItem('blurStrength', strength);
}
blurRange.oninput = function() {
    setBlur(this.value);
};
// 主题色
function setThemeColor(color) {
    document.documentElement.style.setProperty('--theme-color', color);
    localStorage.setItem('themeColor', color);
    Array.from(colorList.children).forEach(dot => dot.classList.remove('selected'));
    let sel = Array.from(colorList.children).find(dot => dot.getAttribute('data-color') === color);
    if(sel) sel.classList.add('selected');
}
colorList.onclick = function(e) {
    let dot = e.target.closest('.color-dot');
    if(dot) setThemeColor(dot.getAttribute('data-color'));
};
// 初始化设置
(function(){
    let fontSize = localStorage.getItem('fontSize') || 16;
    let blurStrength = localStorage.getItem('blurStrength') || 28;
    let themeColor = localStorage.getItem('themeColor') || '#fff';
    fontSizeRange.value = fontSize;
    blurRange.value = blurStrength;
    setFontSize(fontSize);
    setBlur(blurStrength);
    setThemeColor(themeColor);
})();

// toolbox展开/收起
const toolboxBtn = document.getElementById('toolbox-btn-main');
const toolboxPanel = document.getElementById('toolbox-panel');
toolboxBtn.onclick = function(e) {
    e.stopPropagation();
    toolboxPanel.classList.toggle('open');
};
toolboxBtn.querySelector('img').onclick = toolboxBtn.onclick;
document.addEventListener('click', function(e) {
    if(!toolboxPanel.contains(e.target) && e.target !== toolboxBtn && e.target !== toolboxBtn.querySelector('img')) {
        toolboxPanel.classList.remove('open');
    }
}); 
