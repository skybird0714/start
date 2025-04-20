// 全局变量提前声明
const modeSwitch = document.getElementById('mode-switch');
const blurBtn = document.getElementById('blur-btn');
const searchInput = document.getElementById('search-input');
const resetBtn = document.getElementById('reset-settings-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const langSelect = document.getElementById('lang-select');
const langFlag = document.getElementById('lang-flag');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const settingsBgMask = document.getElementById('settings-bg-mask');
const themeColorPicker = document.getElementById('theme-color-picker');
let focusModeActive = false;

// ========== 时间与日期 ========== //
function updateTime(lang) {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const weekZH = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const weekZHTW = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const weekEN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekJA = ['日','月','火','水','木','金','土'];
    const weekRU = ['Вск','Пнд','Втр','Срд','Чтв','Птн','Суб'];
    const weekFR = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    const weekES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const weekAR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    // 北京时间
    const bjNow = new Date(now.getTime() + (8 - now.getTimezoneOffset() / 60) * 3600000 - now.getTimezoneOffset() * 60000);
    lang = lang || localStorage.getItem('lang') || 'zh';
    if(lang === 'en') {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${bjNow.getFullYear()}/${pad(bjNow.getMonth()+1)}/${pad(bjNow.getDate())} ${weekEN[bjNow.getDay()]}`;
    } else if(lang === 'zh-TW') {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${bjNow.getFullYear()}年${pad(bjNow.getMonth()+1)}月${pad(bjNow.getDate())}日 ${weekZHTW[bjNow.getDay()]}`;
    } else if(lang === 'ja') {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${bjNow.getFullYear()}年${pad(bjNow.getMonth()+1)}月${pad(bjNow.getDate())}日 (${weekJA[bjNow.getDay()]})`;
    } else if(lang === 'ru') {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${pad(bjNow.getDate())}.${pad(bjNow.getMonth()+1)}.${bjNow.getFullYear()} ${weekRU[bjNow.getDay()]}`;
    } else if(lang === 'fr') {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${pad(bjNow.getDate())}/${pad(bjNow.getMonth()+1)}/${bjNow.getFullYear()} ${weekFR[bjNow.getDay()]}`;
    } else if(lang === 'es') {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${pad(bjNow.getDate())}/${pad(bjNow.getMonth()+1)}/${bjNow.getFullYear()} ${weekES[bjNow.getDay()]}`;
    } else if(lang === 'ar') {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${bjNow.getFullYear()}/${pad(bjNow.getMonth()+1)}/${pad(bjNow.getDate())} ${weekAR[bjNow.getDay()]}`;
    } else {
        document.getElementById('time').textContent = `${pad(bjNow.getHours())}:${pad(bjNow.getMinutes())}:${pad(bjNow.getSeconds())}`;
        document.getElementById('date').textContent = `${bjNow.getFullYear()}年${pad(bjNow.getMonth()+1)}月${bjNow.getDate()}日 ${weekZH[bjNow.getDay()]}`;
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
            } else if(lang === 'zh-TW') {
                document.getElementById('weather').textContent = `${w.city} ${w.weather} ${w.temperature}℃ 濕度${w.humidity}% ${w.winddirection}${w.windpower}級`;
            } else if(lang === 'ja') {
                // 日语天气类型
                const weatherJA = {
                    '晴': '晴れ', '多云': 'くもり', '阴': '曇り', '阵雨': 'にわか雨', '雷阵雨': '雷雨',
                    '小雨': '小雨', '中雨': '中雨', '大雨': '大雨', '暴雨': '豪雨',
                    '小雪': '小雪', '中雪': '中雪', '大雪': '大雪', '暴雪': '猛吹雪',
                    '雾': '霧', '霾': '煙霧', '沙尘暴': '砂嵐', '雨夹雪': 'みぞれ', '浮尘': 'ほこり', '扬沙': '砂',
                    '强沙尘暴': '強い砂嵐', '冻雨': '氷雨', '雷阵雨伴有冰雹': 'ひょうを伴う雷雨'
                };
                document.getElementById('weather').textContent = `${w.city} ${weatherJA[w.weather]||w.weather} ${w.temperature}℃ 湿度${w.humidity}% ${w.winddirection}${w.windpower}級`;
            } else if(lang === 'ru') {
                // 俄语天气类型
                const weatherRU = {
                    '晴': 'Ясно', '多云': 'Облачно', '阴': 'Пасмурно', '阵雨': 'Ливень', '雷阵雨': 'Гроза',
                    '小雨': 'Небольшой дождь', '中雨': 'Умеренный дождь', '大雨': 'Сильный дождь', '暴雨': 'Ливень',
                    '小雪': 'Небольшой снег', '中雪': 'Умеренный снег', '大雪': 'Сильный снег', '暴雪': 'Метель',
                    '雾': 'Туман', '霾': 'Дымка', '沙尘暴': 'Песчаная буря', '雨夹雪': 'Дождь со снегом', '浮尘': 'Пыль', '扬沙': 'Песок',
                    '强沙尘暴': 'Сильная песчаная буря', '冻雨': 'Ледяной дождь', '雷阵雨伴有冰雹': 'Гроза с градом'
                };
                const windRU = {
                    '无风向': 'Без ветра', '北': 'С', '东北': 'СВ', '东': 'В', '东南': 'ЮВ', '南': 'Ю', '西南': 'ЮЗ', '西': 'З', '西北': 'СЗ'
                };
                document.getElementById('weather').textContent = `${w.city} ${weatherRU[w.weather]||w.weather} ${w.temperature}℃ Влажн. ${w.humidity}% ${windRU[w.winddirection]||w.winddirection} ${w.windpower} ур.`;
            } else if(lang === 'fr') {
                // 法语天气类型
                const weatherFR = {
                    '晴': 'Ensoleillé', '多云': 'Nuageux', '阴': 'Couvert', '阵雨': 'Averses', '雷阵雨': 'Orages',
                    '小雨': 'Petite pluie', '中雨': 'Pluie modérée', '大雨': 'Forte pluie', '暴雨': 'Pluie torrentielle',
                    '小雪': 'Petite neige', '中雪': 'Neige modérée', '大雪': 'Forte neige', '暴雪': 'Blizzard',
                    '雾': 'Brouillard', '霾': 'Brume', '沙尘暴': 'Tempête de sable', '雨夹雪': 'Neige fondue', '浮尘': 'Poussière', '扬沙': 'Sable',
                    '强沙尘暴': 'Forte tempête de sable', '冻雨': 'Pluie verglaçante', '雷阵雨伴有冰雹': 'Orages avec grêle'
                };
                const windFR = {
                    '无风向': 'Pas de vent', '北': 'N', '东北': 'NE', '东': 'E', '东南': 'SE', '南': 'S', '西南': 'SO', '西': 'O', '西北': 'NO'
                };
                document.getElementById('weather').textContent = `${w.city} ${weatherFR[w.weather]||w.weather} ${w.temperature}℃ Humidité ${w.humidity}% ${windFR[w.winddirection]||w.winddirection} ${w.windpower} niv.`;
            } else if(lang === 'es') {
                // 西班牙语天气类型
                const weatherES = {
                    '晴': 'Soleado', '多云': 'Nublado', '阴': 'Cubierto', '阵雨': 'Chubascos', '雷阵雨': 'Tormentas',
                    '小雨': 'Lluvia ligera', '中雨': 'Lluvia moderada', '大雨': 'Lluvia fuerte', '暴雨': 'Lluvia torrencial',
                    '小雪': 'Nieve ligera', '中雪': 'Nieve moderada', '大雪': 'Nieve fuerte', '暴雪': 'Ventisca',
                    '雾': 'Niebla', '霾': 'Neblina', '沙尘暴': 'Tormenta de arena', '雨夹雪': 'Aguanieve', '浮尘': 'Polvo', '扬沙': 'Arena',
                    '强沙尘暴': 'Fuerte tormenta de arena', '冻雨': 'Lluvia helada', '雷阵雨伴有冰雹': 'Tormenta con granizo'
                };
                const windES = {
                    '无风向': 'Sin viento', '北': 'N', '东北': 'NE', '东': 'E', '东南': 'SE', '南': 'S', '西南': 'SO', '西': 'O', '西北': 'NO'
                };
                document.getElementById('weather').textContent = `${w.city} ${weatherES[w.weather]||w.weather} ${w.temperature}℃ Humedad ${w.humidity}% ${windES[w.winddirection]||w.winddirection} ${w.windpower} niv.`;
            } else if(lang === 'ar') {
                // 阿拉伯语天气类型
                const weatherAR = {
                    '晴': 'مشمس', '多云': 'غائم', '阴': 'غائم كلياً', '阵雨': 'زخات', '雷阵雨': 'عواصف رعدية',
                    '小雨': 'أمطار خفيفة', '中雨': 'أمطار متوسطة', '大雨': 'أمطار غزيرة', '暴雨': 'أمطار غزيرة جداً',
                    '小雪': 'ثلوج خفيفة', '中雪': 'ثلوج متوسطة', '大雪': 'ثلوج كثيفة', '暴雪': 'عاصفة ثلجية',
                    '雾': 'ضباب', '霾': 'ضباب دخاني', '沙尘暴': 'عاصفة رملية', '雨夹雪': 'مطر ممزوج بالثلج', '浮尘': 'غبار', '扬沙': 'رمال',
                    '强沙尘暴': 'عاصفة رملية قوية', '冻雨': 'مطر متجمد', '雷阵雨伴有冰雹': 'عواصف رعدية مع برد'
                };
                const windAR = {
                    '无风向': 'بدون رياح', '北': 'ش', '东北': 'ش م', '东': 'م', '东南': 'ج م', '南': 'ج', '西南': 'ج غ', '西': 'غ', '西北': 'ش غ'
                };
                document.getElementById('weather').textContent = `${w.city} ${weatherAR[w.weather]||w.weather} ${w.temperature}℃ رطوبة ${w.humidity}% ${windAR[w.winddirection]||w.winddirection} ${w.windpower} درج.`;
            } else {
                document.getElementById('weather').textContent = `${w.city} ${w.weather} ${w.temperature}℃ 湿度${w.humidity}% ${w.winddirection}${w.windpower}级`;
            }
        } else {
            let failMsg = '天气获取失败';
            if(lang === 'en') failMsg = 'Failed to get weather';
            else if(lang === 'zh-TW') failMsg = '天氣獲取失敗';
            else if(lang === 'ja') failMsg = '天気取得失敗';
            else if(lang === 'ru') failMsg = 'Не удалось получить погоду';
            else if(lang === 'fr') failMsg = 'Échec de la météo';
            else if(lang === 'es') failMsg = 'No se pudo obtener el clima';
            else if(lang === 'ar') failMsg = 'فشل في جلب الطقس';
            document.getElementById('weather').textContent = failMsg;
        }
    } catch {
        let failMsg = '天气获取失败';
        if(lang === 'en') failMsg = 'Failed to get weather';
        else if(lang === 'zh-TW') failMsg = '天氣獲取失敗';
        else if(lang === 'ja') failMsg = '天気取得失敗';
        else if(lang === 'ru') failMsg = 'Не удалось получить погоду';
        else if(lang === 'fr') failMsg = 'Échec de la météo';
        else if(lang === 'es') failMsg = 'No se pudo obtener el clima';
        else if(lang === 'ar') failMsg = 'فشل في جلب الطقس';
        document.getElementById('weather').textContent = failMsg;
    }
}
updateWeather();

// ========== 搜索引擎 ========== //
const ENGINES = [
    {icon:'icons/bing.png', url:'https://www.bing.com/search?q=%s', names:{zh:'必应', 'zh-TW':'必應', en:'Bing', ja:'Bing', fr:'Bing', ru:'Bing', es:'Bing', ar:'Bing'}},
    {icon:'icons/baidu.png', url:'https://www.baidu.com/s?wd=%s', names:{zh:'百度', 'zh-TW':'百度', en:'Baidu', ja:'百度', fr:'Baidu', ru:'Baidu', es:'Baidu', ar:'Baidu'}},
    {icon:'icons/google.png', url:'https://www.google.com/search?q=%s', names:{zh:'谷歌', 'zh-TW':'Google', en:'Google', ja:'Google', fr:'Google', ru:'Google', es:'Google', ar:'Google'}},
    {icon:'icons/yahoo.png', url:'https://search.yahoo.com/search?p=%s', names:{zh:'雅虎', 'zh-TW':'雅虎', en:'Yahoo!', ja:'Yahoo!', fr:'Yahoo!', ru:'Yahoo!', es:'Yahoo!', ar:'Yahoo!'}},
    {icon:'icons/yandex.png', url:'https://yandex.com/search/?text=%s', names:{zh:'Yandex', 'zh-TW':'Yandex', en:'Yandex', ja:'Yandex', fr:'Yandex', ru:'Яндекс', es:'Yandex', ar:'Yandex'}},
    {icon:'icons/duckduckgo.png', url:'https://duckduckgo.com/?q=%s', names:{zh:'DuckDuckGo', 'zh-TW':'DuckDuckGo', en:'DuckDuckGo', ja:'DuckDuckGo', fr:'DuckDuckGo', ru:'DuckDuckGo', es:'DuckDuckGo', ar:'DuckDuckGo'}},
    {icon:'icons/360.png', url:'https://www.so.com/s?q=%s', names:{zh:'360', 'zh-TW':'360', en:'360', ja:'360', fr:'360', ru:'360', es:'360', ar:'360'}},
    {icon:'icons/sogou.png', url:'https://www.sogou.com/web?query=%s', names:{zh:'搜狗', 'zh-TW':'搜狗', en:'Sogou', ja:'Sogou', fr:'Sogou', ru:'Sogou', es:'Sogou', ar:'Sogou'}},
    {icon:'icons/bilibili.png', url:'https://search.bilibili.com/all?keyword=%s', names:{zh:'哔哩哔哩', 'zh-TW':'嗶哩嗶哩', en:'Bilibili', ja:'ビリビリ', fr:'Bilibili', ru:'Bilibili', es:'Bilibili', ar:'Bilibili'}},
    {icon:'icons/github.png', url:'https://github.com/search?q=%s', names:{zh:'GitHub', 'zh-TW':'GitHub', en:'GitHub', ja:'GitHub', fr:'GitHub', ru:'GitHub', es:'GitHub', ar:'GitHub'}},
    {icon:'icons/weibo.png', url:'https://s.weibo.com/weibo/%s', names:{zh:'微博', 'zh-TW':'微博', en:'Weibo', ja:'Weibo', fr:'Weibo', ru:'Weibo', es:'Weibo', ar:'Weibo'}},
    {icon:'icons/xiaohongshu.png', url:'https://www.xiaohongshu.com/search_result/%s', names:{zh:'小红书', 'zh-TW':'小紅書', en:'Xiaohongshu', ja:'RED', fr:'RED', ru:'RED', es:'RED', ar:'RED'}},
    {icon:'icons/zhihu.png', url:'https://www.zhihu.com/search?type=content&q=%s', names:{zh:'知乎', 'zh-TW':'知乎', en:'Zhihu', ja:'Zhihu', fr:'Zhihu', ru:'Zhihu', es:'Zhihu', ar:'Zhihu'}},
    {icon:'icons/douyin.png', url:'https://www.douyin.com/search/%s', names:{zh:'抖音', 'zh-TW':'抖音', en:'Douyin', ja:'TikTok', fr:'TikTok', ru:'TikTok', es:'TikTok', ar:'TikTok'}},
    {icon:'icons/youtube.png', url:'https://www.youtube.com/results?search_query=%s', names:{zh:'YouTube', 'zh-TW':'YouTube', en:'YouTube', ja:'YouTube', fr:'YouTube', ru:'YouTube', es:'YouTube', ar:'YouTube'}},
    {icon:'icons/facebook.png', url:'https://www.facebook.com/search/top/?q=%s', names:{zh:'Facebook', 'zh-TW':'Facebook', en:'Facebook', ja:'Facebook', fr:'Facebook', ru:'Facebook', es:'Facebook', ar:'Facebook'}},
    {icon:'icons/x.png', url:'https://x.com/search?q=%s', names:{zh:'X', 'zh-TW':'X', en:'X', ja:'X', fr:'X', ru:'X', es:'X', ar:'X'}},
    {icon:'icons/instagram.png', url:'https://www.instagram.com/explore/tags/%s/', names:{zh:'Instagram', 'zh-TW':'Instagram', en:'Instagram', ja:'Instagram', fr:'Instagram', ru:'Instagram', es:'Instagram', ar:'Instagram'}},
    {icon:'icons/taobao.png', url:'https://s.taobao.com/search?q=%s', names:{zh:'淘宝', 'zh-TW':'淘寶', en:'Taobao', ja:'Taobao', fr:'Taobao', ru:'Taobao', es:'Taobao', ar:'Taobao'}},
    {icon:'icons/jd.png', url:'https://search.jd.com/Search?keyword=%s', names:{zh:'京东', 'zh-TW':'京東', en:'JD.com', ja:'JD.com', fr:'JD.com', ru:'JD.com', es:'JD.com', ar:'JD.com'}},
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
    const lang = localStorage.getItem('lang') || 'zh';
    document.getElementById('engine-icon').src = all[idx].icon;
    document.getElementById('engine-icon').alt = all[idx].names[lang] || all[idx].names['en'];
}
function renderEngineList() {
    const list = document.getElementById('engine-list');
    const all = getAllEngines();
    const lang = localStorage.getItem('lang') || 'zh';
    list.innerHTML = all.map((e,i) =>
        `<div class="engine-item" data-idx="${i}"><img src="${e.icon}" style="width:1.5em;height:1.5em;margin-right:0.5em;">${e.names[lang] || e.names['en']}</div>`
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
searchInput.addEventListener('focus', () => document.body.classList.add('input-focus'));
searchInput.addEventListener('blur', () => document.body.classList.remove('input-focus'));
// 搜索
function doSearch() {
    const idx = getEngineIndex();
    const engine = getAllEngines()[idx];
    const kw = document.getElementById('search-input').value.trim();
    if(kw) {
        addSearchHistory(kw);
        if(engine.url) {
            window.open(engine.url.replace('%s', encodeURIComponent(kw)), '_blank');
        }
    }
}
document.getElementById('search-btn').onclick = doSearch;
searchInput.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') doSearch();
});



// ========== 设置面板重构 ========== //
function openSettingsPanel() {
    document.body.classList.add('settings-open');
    settingsPanel.classList.add('show');
    settingsPanel.style.display = 'block';
    if(settingsBgMask) settingsBgMask.classList.add('open');
    if(settingsBgMask) settingsBgMask.style.display = 'block';
}
function closeSettingsPanel() {
    document.body.classList.remove('settings-open');
    settingsPanel.classList.remove('show');
    setTimeout(()=>{settingsPanel.style.display = 'none';}, 250);
    if(settingsBgMask) settingsBgMask.classList.remove('open');
    if(settingsBgMask) settingsBgMask.style.display = 'none';
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

// 语言列表配置
const langListArr = [
    {key:'zh', name:'简体中文(China)', flag:'cn.png'},
    {key:'zh-TW', name:'繁體中文(HK SAR)', flag:'hk.png'},
    {key:'en', name:'English(US)', flag:'us.png'},
    {key:'ja', name:'日本語(Japan)', flag:'jp.png'},
    {key:'fr', name:'Français(France)', flag:'fr.png'},
    {key:'ru', name:'Русский(Russia)', flag:'ru.png'},
    {key:'es', name:'Español(Spain)', flag:'es.png'},
    {key:'ar', name:'العربية(Arab)', flag:'ar.png'}
];

// 渲染自定义语言列表
function renderLangList() {
    const langList = document.getElementById('lang-list');
    if (!langList) return;
    const curLang = localStorage.getItem('lang') || 'zh';
    langList.innerHTML = langListArr.map(l =>
        `<div class="lang-item${l.key===curLang?' selected':''}" data-lang="${l.key}">
            <img src="icons/flag/${l.flag}" class="lang-flag"> ${l.name}
        </div>`
    ).join('');
    // 当前显示
    const cur = langListArr.find(l=>l.key===curLang) || langListArr[0];
    const langFlagEl = document.getElementById('lang-flag');
    const langCurNameEl = document.getElementById('lang-current-name');
    if(langFlagEl) langFlagEl.src = 'icons/flag/' + cur.flag;
    if(langCurNameEl) langCurNameEl.textContent = cur.name;
}
renderLangList();

// 展开/收起逻辑
const langSelectCustom = document.getElementById('lang-select-custom');
const langCurrent = document.getElementById('lang-current');
const langList = document.getElementById('lang-list');
if(langCurrent && langSelectCustom) {
    langCurrent.onclick = function(e) {
        e.stopPropagation();
        langSelectCustom.classList.toggle('open');
    };
    document.addEventListener('click', function() {
        langSelectCustom.classList.remove('open');
    });
}
if(langList) {
    langList.onclick = function(e) {
        const item = e.target.closest('.lang-item');
        if(item) {
            const lang = item.getAttribute('data-lang');
            setLang(lang);
            langSelectCustom.classList.remove('open');
            renderLangList();
        }
    };
}
// 切换语言时同步更新自定义列表
const oldSetLang = setLang;
setLang = function(lang) {
    oldSetLang(lang);
    renderLangList();
};

// 多语言支持
const langMap = {
    zh:   {name: '简体中文(China)', flag: 'cn.png'},
    'zh-TW': {name: '繁體中文(Hong Kong SAR)', flag: 'hk.png'},
    en:   {name: 'English(United States)', flag: 'us.png'},
    ja:   {name: '日本語(Japan)', flag: 'jp.png'},
    de:   {name: 'Deutsch(Germany)', flag: 'de.png'},
    fr:   {name: 'Français(France)', flag: 'fr.png'},
    ru:   {name: 'Русский(Russia)', flag: 'ru.png'},
    es:   {name: 'Español(Spain)', flag: 'es.png'},
    pt:   {name: 'Português(Portugal)', flag: 'pt.png'},
    ar:   {name: 'العربية(Arab)', flag: 'ar.png'}
};
if(langSelect) {
    langSelect.value = localStorage.getItem('lang') || 'zh';
    langSelect.onchange = function() {
        setLang(this.value);
    };
}
function setLang(lang) {
    localStorage.setItem('lang', lang);
    document.body.setAttribute('lang', lang);
    document.querySelectorAll('[data-zh]').forEach(el => {
        let val = el.getAttribute('data-' + lang);
        if(val === null || val === undefined) {
            val = el.getAttribute('data-en') || el.getAttribute('data-zh');
        }
        if (el.tagName === 'INPUT' && el.type === 'text') {
            el.placeholder = val;
        } else {
            el.textContent = val;
        }
    });
    if(langSelect) langSelect.value = lang;
    if(langFlag && langMap[lang]) langFlag.src = 'icons/flag/' + langMap[lang].flag;
    // 多语言标题
    const titleMap = {
        zh: '起始页',
        'zh-TW': '起始頁',
        en: 'Start Page',
        fr: "Page d'accueil",
        ru: 'Стартовая страница',
        es: 'Página de inicio',
        ar: 'الصفحة الرئيسية',
        ja: 'スタートページ'
    };
    document.title = titleMap[lang] || titleMap['zh'];
    updateTime(lang);
    updateFooterInfo(lang);
    updateWeather();
    renderEngineList();
    if(resetBtn) resetBtn.textContent = resetBtn.getAttribute('data-' + lang) || resetBtn.getAttribute('data-en') || resetBtn.getAttribute('data-zh');
    if(clearHistoryBtn) clearHistoryBtn.textContent = clearHistoryBtn.getAttribute('data-' + lang) || clearHistoryBtn.getAttribute('data-en') || clearHistoryBtn.getAttribute('data-zh');
}
setLang(localStorage.getItem('lang') || 'zh');

function updateFooterInfo(lang) {
    // 页脚内容切换
    const start = document.getElementById('footer-start');
    const author = document.getElementById('footer-author');
    const home = document.getElementById('footer-home');
    const blog = document.getElementById('footer-blog');
    if(start) {
        let val = start.getAttribute('data-' + lang);
        if(val === null || val === undefined) val = start.getAttribute('data-en') || start.getAttribute('data-zh');
        start.textContent = val;
    }
    if(author) {
        let val = author.getAttribute('data-' + lang);
        if(val === null || val === undefined) val = author.getAttribute('data-en') || author.getAttribute('data-zh');
        author.textContent = val;
    }
    if(home) {
        let val = home.getAttribute('data-' + lang);
        if(val === null || val === undefined) val = home.getAttribute('data-en') || home.getAttribute('data-zh');
        home.textContent = val;
    }
    if(blog) {
        let val = blog.getAttribute('data-' + lang);
        if(val === null || val === undefined) val = blog.getAttribute('data-en') || blog.getAttribute('data-zh');
        blog.textContent = val;
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
if(modeSwitch) {
    modeSwitch.checked = localStorage.getItem('nightMode') === '1';
    setNightMode(modeSwitch.checked);
    modeSwitch.onchange = function() {
        setNightMode(this.checked);
    };
}

// 专注模式按钮功能
if(blurBtn) {
    blurBtn.onclick = function(e) {
        e.stopPropagation();
        if (focusModeActive) return;
        focusModeActive = true;
        document.body.classList.add('focus-fadeout');
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
    document.body.classList.remove('focus-fadeout');
    document.getElementById('glass-bg').classList.remove('fadeout');
    blurBtn.style.display = '';
    document.querySelectorAll('button, .engine-btn, .search-btn, .lang-toggle, .footer-btn, .mode-toggle, .search-section, .time-section, .footer-info').forEach(el => {
        el.style.visibility = '';
    });
    document.body.removeEventListener('click', exitFocusMode, {capture:true});
}

// 搜索历史记录
const searchHistoryKey = 'searchHistory';
const searchHistoryList = document.getElementById('search-history-list');
function getSearchHistory() {
    return JSON.parse(localStorage.getItem(searchHistoryKey) || '[]');
}
function setSearchHistory(arr) {
    localStorage.setItem(searchHistoryKey, JSON.stringify(arr));
}
function addSearchHistory(keyword) {
    let arr = getSearchHistory();
    arr = arr.filter(item => item !== keyword);
    arr.unshift(keyword);
    if(arr.length > 8) arr = arr.slice(0,8);
    setSearchHistory(arr);
}
function renderSearchHistory() {
    const arr = getSearchHistory();
    if(arr.length === 0) {
        searchHistoryList.classList.remove('show');
        return;
    }
    searchHistoryList.innerHTML = arr.map((kw,i) =>
        `<div class="search-history-item" data-kw="${kw}">
            <span>${kw}</span>
            <button class="search-history-del" data-idx="${i}" title="删除"><img src="icons/delete.png" alt="删除"></button>
        </div>`
    ).join('');
    searchHistoryList.classList.add('show');
}
searchInput.addEventListener('focus', renderSearchHistory);
searchInput.addEventListener('input', renderSearchHistory);
searchInput.addEventListener('blur', () => setTimeout(()=>{searchHistoryList.classList.remove('show');}, 200));
searchHistoryList.addEventListener('mousedown', function(e) {
    const delBtn = e.target.closest('.search-history-del');
    if(delBtn) {
        e.preventDefault();
        const idx = +delBtn.getAttribute('data-idx');
        let arr = getSearchHistory();
        arr.splice(idx,1);
        setSearchHistory(arr);
        renderSearchHistory();
        return;
    }
    let item = e.target.closest('.search-history-item');
    if(item) {
        searchInput.value = item.getAttribute('data-kw');
        searchHistoryList.classList.remove('show');
        searchInput.focus();
    }
});

// 设置页按钮
if(resetBtn) {
    resetBtn.onclick = function() {
        // 清除所有本地存储
        localStorage.clear();

        // 恢复主题色
        setThemeColor('#0099ff');

        // 恢复夜间模式
        setNightMode(false);
        if(modeSwitch) modeSwitch.checked = false;

        // 恢复语言
        setLang('zh');
        if(langSelect) langSelect.value = 'zh';

        // 恢复搜索引擎
        setEngineIndex(0);
        renderEngineBtn();
        renderEngineList();

        // 清空搜索历史
        setSearchHistory([]);
        renderSearchHistory();

        // 保持设置面板打开，不刷新页面
    };
}
if(clearHistoryBtn) {
    clearHistoryBtn.onclick = function() {
        setSearchHistory([]);
        renderSearchHistory();
    };
}

// 多语言顶部提示内容
const toastMsgMap = {
    zh: {
        greet: () => {
            const h = new Date().getHours();
            if (h < 11) return '早上好，今天要搜点什么？';
            if (h < 13) return '中午好，今天要搜点什么？';
            if (h < 18) return '下午好，今天要搜点什么？';
            return '晚上好，今天要搜点什么？';
        },
        reset: '已恢复默认设置',
        clear: '已清空浏览器记录'
    },
    'zh-TW': {
        greet: () => {
            const h = new Date().getHours();
            if (h < 11) return '早安，今天想搜尋什麼？';
            if (h < 13) return '午安，今天想搜尋什麼？';
            if (h < 18) return '下午好，今天想搜尋什麼？';
            return '晚安，今天想搜尋什麼？';
        },
        reset: '已恢復預設設定',
        clear: '已清空瀏覽器記錄'
    },
    en: {
        greet: () => {
            const h = new Date().getHours();
            if (h < 11) return 'Good morning! What do you want to search today?';
            if (h < 13) return 'Good noon! What do you want to search today?';
            if (h < 18) return 'Good afternoon! What do you want to search today?';
            return 'Good evening! What do you want to search today?';
        },
        reset: 'Settings have been reset',
        clear: 'Browser history cleared'
    },
    ja: {
        greet: () => {
            const h = new Date().getHours();
            if (h < 11) return 'おはようございます。今日は何を検索しますか？';
            if (h < 13) return 'こんにちは。今日は何を検索しますか？';
            if (h < 18) return 'こんにちは。今日は何を検索しますか？';
            return 'こんばんは。今日は何を検索しますか？';
        },
        reset: '設定を初期化しました',
        clear: '履歴をクリアしました'
    },
    fr: {
        greet: () => {
            const h = new Date().getHours();
            if (h < 11) return 'Bonjour ! Que voulez-vous rechercher aujourd\'hui ?';
            if (h < 13) return 'Bon midi ! Que voulez-vous rechercher aujourd\'hui ?';
            if (h < 18) return 'Bon après-midi ! Que voulez-vous rechercher aujourd\'hui ?';
            return 'Bonsoir ! Que voulez-vous rechercher aujourd\'hui ?';
        },
        reset: 'Paramètres réinitialisés',
        clear: 'Historique du navigateur effacé'
    },
    ru: {
        greet: () => {
            const h = new Date().getHours();
            if (h < 11) return 'Доброе утро! Что ищем сегодня?';
            if (h < 13) return 'Добрый день! Что ищем сегодня?';
            if (h < 18) return 'Добрый день! Что ищем сегодня?';
            return 'Добрый вечер! Что ищем сегодня?';
        },
        reset: 'Настройки сброшены',
        clear: 'История очищена'
    },
    es: {
        greet: () => {
            const h = new Date().getHours();
            if (h < 11) return '¡Buenos días! ¿Qué quieres buscar hoy?';
            if (h < 13) return '¡Buen mediodía! ¿Qué quieres buscar hoy?';
            if (h < 18) return '¡Buenas tardes! ¿Qué quieres buscar hoy?';
            return '¡Buenas noches! ¿Qué quieres buscar hoy?';
        },
        reset: 'Configuración restablecida',
        clear: 'Historial del navegador borrado'
    },
    ar: {
        greet: () => {
            const h = new Date().getHours();
            if (h < 11) return 'صباح الخير! ماذا تريد أن تبحث اليوم؟';
            if (h < 13) return 'ظهر سعيد! ماذا تريد أن تبحث اليوم؟';
            if (h < 18) return 'مساء الخير! ماذا تريد أن تبحث اليوم؟';
            return 'مساء الخير! ماذا تريد أن تبحث اليوم؟';
        },
        reset: 'تمت استعادة الإعدادات الافتراضية',
        clear: 'تم مسح سجل المتصفح'
    }
};

// 顶部提示框显示函数
function showTopToast(type = 'greet') {
    const lang = localStorage.getItem('lang') || 'zh';
    const msgObj = toastMsgMap[lang] || toastMsgMap['zh'];
    let msg = typeof msgObj[type] === 'function' ? msgObj[type]() : msgObj[type];
    const toast = document.getElementById('top-toast');
    const toastText = document.getElementById('top-toast-text');
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

// 页面载入时显示问候
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => showTopToast('greet'), 400);
});

// 恢复默认设置时显示
if (resetBtn) {
    const oldReset = resetBtn.onclick;
    resetBtn.onclick = function() {
        if (typeof oldReset === 'function') oldReset();
        showTopToast('reset');
    };
}

// 清空历史时显示
if (clearHistoryBtn) {
    const oldClear = clearHistoryBtn.onclick;
    clearHistoryBtn.onclick = function() {
        if (typeof oldClear === 'function') oldClear();
        showTopToast('clear');
    };
}
