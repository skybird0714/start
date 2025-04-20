// ========== 时间与日期 ========== //
function updateTime(lang) {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const weekZH = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const weekEN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    // 北京时间
    const bjNow = new Date(now.getTime() + (8 - now.getTimezoneOffset() / 60) * 3600000 - now.getTimezoneOffset() * 60000);
    lang = lang || localStorage.getItem('lang') || 'zh';
    if(lang === 'en') {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${bjNow.getFullYear()}/${pad(bjNow.getMonth()+1)}/${pad(bjNow.getDate())} ${weekEN[bjNow.getDay()]}`;
    } else {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${bjNow.getFullYear()}年${pad(bjNow.getMonth()+1)}月${pad(bjNow.getDate())}日 ${weekZH[bjNow.getDay()]}`;
    }
}
setInterval(() => updateTime(), 1000);
updateTime();

// ========== 天气 ========== //
async function updateWeather() {
    let city = '北京';
    let lang = localStorage.getItem('lang') || 'zh';
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
            if(lang === 'en') {
                // 简单中英对照
                const weatherMap = {
                    '晴': 'Sunny', '多云': 'Cloudy', '阴': 'Overcast', '阵雨': 'Shower', '雷阵雨': 'Thunder Shower',
                    '小雨': 'Light Rain', '中雨': 'Moderate Rain', '大雨': 'Heavy Rain', '暴雨': 'Storm',
                    '小雪': 'Light Snow', '中雪': 'Moderate Snow', '大雪': 'Heavy Snow', '暴雪': 'Blizzard',
                    '雾': 'Fog', '霾': 'Haze', '沙尘暴': 'Sandstorm', '雨夹雪': 'Sleet', '浮尘': 'Dust', '扬沙': 'Sand',
                    '强沙尘暴': 'Severe Sandstorm', '冻雨': 'Freezing Rain', '雷阵雨伴有冰雹': 'Thunder Shower with Hail'
                };
                const windDirMap = {
                    '无风向': 'No wind', '北': 'N', '东北': 'NE', '东': 'E', '东南': 'SE', '南': 'S', '西南': 'SW', '西': 'W', '西北': 'NW'
                };
                const weatherEn = weatherMap[w.weather] || w.weather;
                const windEn = windDirMap[w.winddirection] || w.winddirection;
                document.getElementById('weather').textContent = `${w.city} ${weatherEn} ${w.temperature}℃ Humidity ${w.humidity}% ${windEn} ${w.windpower} lvl`;
            } else {
                document.getElementById('weather').textContent = `${w.city} ${w.weather} ${w.temperature}℃ 湿度${w.humidity}% ${w.winddirection}${w.windpower}级`;
            }
        } else {
            document.getElementById('weather').textContent = lang === 'en' ? 'Failed to get weather' : '天气获取失败';
        }
    } catch {
        document.getElementById('weather').textContent = lang === 'en' ? 'Failed to get weather' : '天气获取失败';
    }
}
updateWeather();

// ========== 搜索引擎 ========== //
const ENGINES = [
    {name:'必应', en:'Bing', icon:'icons/bing.png', url:'https://www.bing.com/search?q=%s'},
    {name:'百度', en:'Baidu', icon:'icons/baidu.png', url:'https://www.baidu.com/s?wd=%s'},
    {name:'谷歌', en:'Google', icon:'icons/google.png', url:'https://www.google.com/search?q=%s'},
    {name:'雅虎', en:'Yahoo', icon:'icons/yahoo.png', url:'https://search.yahoo.com/search?p=%s'},
    {name:'Yandex', en:'Yandex', icon:'icons/yandex.png', url:'https://yandex.com/search/?text=%s'},
    {name:'DuckDuckGo', en:'DuckDuckGo', icon:'icons/duckduckgo.png', url:'https://duckduckgo.com/?q=%s'},
    {name:'360', en:'360', icon:'icons/360.png', url:'https://www.so.com/s?q=%s'},
    {name:'搜狗', en:'Sogou', icon:'icons/sogou.png', url:'https://www.sogou.com/web?query=%s'},
    {name:'Bilibili', en:'Bilibili', icon:'icons/bilibili.png', url:'https://search.bilibili.com/all?keyword=%s'},
    {name:'GitHub', en:'GitHub', icon:'icons/github.png', url:'https://github.com/search?q=%s'},
    {name:'微博', en:'Weibo', icon:'icons/weibo.png', url:'https://s.weibo.com/weibo/%s'},
    {name:'小红书', en:'Xiaohongshu', icon:'icons/xiaohongshu.png', url:'https://www.xiaohongshu.com/search_result/%s'},
    {name:'知乎', en:'Zhihu', icon:'icons/zhihu.png', url:'https://www.zhihu.com/search?type=content&q=%s'},
    {name:'抖音', en:'Douyin', icon:'icons/douyin.png', url:'https://www.douyin.com/search/%s'},
    {name:'YouTube', en:'YouTube', icon:'icons/youtube.png', url:'https://www.youtube.com/results?search_query=%s'},
    {name:'Facebook', en:'Facebook', icon:'icons/facebook.png', url:'https://www.facebook.com/search/top/?q=%s'},
    {name:'X', en:'X', icon:'icons/x.png', url:'https://x.com/search?q=%s'},
    {name:'Instagram', en:'Instagram', icon:'icons/instagram.png', url:'https://www.instagram.com/explore/tags/%s/'},
    {name:'淘宝', en:'Taobao', icon:'icons/taobao.png', url:'https://s.taobao.com/search?q=%s'},
    {name:'京东', en:'JD', icon:'icons/jd.png', url:'https://search.jd.com/Search?keyword=%s'},
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
    const lang = localStorage.getItem('lang') || 'zh';
    list.innerHTML = all.map((e,i) =>
        `<div class="engine-item" data-idx="${i}"><img src="${e.icon}" style="width:1.5em;height:1.5em;margin-right:0.5em;">${lang==='en'?e.en:e.name}</div>`
    ).join('');
}
renderEngineBtn();
renderEngineList();
// 事件绑定
const engineBtn = document.getElementById('engine-btn');
const engineList = document.getElementById('engine-list');
engineBtn.onclick = function(e) {
    e.stopPropagation();
    if (engineList.classList.contains('open')) {
        engineList.classList.remove('open');
        setTimeout(()=>engineList.classList.add('hidden'), 180);
    } else {
        engineList.classList.remove('hidden');
        setTimeout(()=>engineList.classList.add('open'), 10);
    }
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
        engineList.classList.remove('open');
        setTimeout(()=>engineList.classList.add('hidden'), 180);
        document.body.classList.remove('engine-list-open');
    }
};
document.addEventListener('click', function(e) {
    if(!engineList.contains(e.target) && e.target.id!=='engine-btn' && e.target.id!=='engine-icon') {
        engineList.classList.remove('open');
        setTimeout(()=>engineList.classList.add('hidden'), 180);
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

// ========== 图标资源提示 ========== //
// 请将所有icons放在htmlgame/icons/目录下，文件名与js中一致 

// ========== 设置面板重构 ========== //
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsBgMask = document.getElementById('settings-bg-mask');
const themeColorPicker = document.getElementById('theme-color-picker');
const langToggle = document.getElementById('lang-toggle');

function openSettingsPanel() {
    document.body.classList.add('settings-open');
    settingsPanel.style.display = 'block';
    if(settingsBgMask) settingsBgMask.classList.add('open');
}
function closeSettingsPanel() {
    document.body.classList.remove('settings-open');
    settingsPanel.style.display = 'none';
    if(settingsBgMask) settingsBgMask.classList.remove('open');
}
settingsBtn.onclick = function(e) {
    e.stopPropagation();
    if(document.body.classList.contains('settings-open')) closeSettingsPanel();
    else openSettingsPanel();
};
if(settingsBgMask) settingsBgMask.onclick = closeSettingsPanel;
settingsPanel.onclick = function(e) { e.stopPropagation(); };
document.addEventListener('click', function(e) {
    if(document.body.classList.contains('settings-open') && !settingsPanel.contains(e.target) && e.target !== settingsBtn) {
        closeSettingsPanel();
    }
});

// 主题色切换
function setThemeColor(color) {
    // 兼容所有浏览器，直接设置body和:root
    document.documentElement.style.setProperty('--theme-color', color);
    document.body.style.setProperty('--theme-color', color);
    localStorage.setItem('themeColor', color);
    if(themeColorPicker) themeColorPicker.value = color;
}
if(themeColorPicker) {
    themeColorPicker.oninput = function() {
        setThemeColor(this.value);
    };
    // 页面加载时自动应用主题色
    const savedColor = localStorage.getItem('themeColor') || '#0099ff';
    setThemeColor(savedColor);
}

// 语言切换
function setLang(lang) {
    localStorage.setItem('lang', lang);
    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
        if (el.tagName === 'INPUT' && el.type === 'text') {
            el.placeholder = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-zh');
        } else {
            el.textContent = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-zh');
        }
    });
    langToggle.textContent = lang === 'en' ? 'English/中文' : '中文/English';
    updateTime(lang)
    updateFooterInfo(lang);
    updateWeather();
    const changelogBtn = document.getElementById('footer-changelog');
    if(changelogBtn) changelogBtn.textContent = lang === 'en' ? changelogBtn.getAttribute('data-en') : changelogBtn.getAttribute('data-zh');
    renderEngineList();
}
if(langToggle) {
    langToggle.onclick = function(e) {
        e.stopPropagation();
        const current = localStorage.getItem('lang') === 'en' ? 'zh' : 'en';
        setLang(current);
    };
    // 页面加载时自动设置语言
    setLang(localStorage.getItem('lang') === 'en' ? 'en' : 'zh');
}

function updateFooterInfo(lang) {
    // 页脚内容切换
    const start = document.getElementById('footer-start');
    const author = document.getElementById('footer-author');
    const home = document.getElementById('footer-home');
    const blog = document.getElementById('footer-blog');
    if(lang === 'en') {
        if(start) start.textContent = 'Start Page';
        if(author) author.textContent = 'tkttn0714';
        if(home) home.textContent = 'Home';
        if(blog) blog.textContent = 'Blog';
    } else {
        if(start) start.textContent = '起始页';
        if(author) author.textContent = '天空天堂鸟';
        if(home) home.textContent = '主页';
        if(blog) blog.textContent = '博客';
    }
}

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
if(modeSwitch) {
    modeSwitch.checked = localStorage.getItem('nightMode') === '1';
    setNightMode(modeSwitch.checked);
    modeSwitch.addEventListener('change', function() {
        setNightMode(this.checked);
    });
}

// 专注模式按钮功能
const blurBtn = document.getElementById('blur-btn');
let focusModeActive = false;
if(blurBtn) {
    blurBtn.onclick = function(e) {
        e.stopPropagation();
        if (focusModeActive) return;
        focusModeActive = true;
        document.getElementById('glass-bg').classList.add('fadeout');
        blurBtn.style.display = 'none';
        document.querySelectorAll('button, .engine-btn, .search-btn, .lang-toggle, .footer-btn, .mode-toggle, .search-section, .time-section, .footer-info').forEach(el => {
            if(el !== blurBtn) el.style.visibility = 'hidden';
        });
        document.body.addEventListener('click', exitFocusMode, {capture:true});
    };
}
function exitFocusMode() {
    if(!focusModeActive) return;
    focusModeActive = false;
    document.getElementById('glass-bg').classList.remove('fadeout');
    blurBtn.style.display = '';
    document.querySelectorAll('button, .engine-btn, .search-btn, .lang-toggle, .footer-btn, .mode-toggle, .search-section, .time-section, .footer-info').forEach(el => {
        el.style.visibility = '';
    });
    document.body.removeEventListener('click', exitFocusMode, {capture:true});
}
