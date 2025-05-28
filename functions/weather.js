// Cloudflare Pages Functions - 天气API代理
// 处理对高德地图API的请求，避免在前端暴露API密钥

export async function onRequest(context) {
  // 获取环境变量中的API密钥
  const apiKey = context.env.AMAP_API_KEY;
  
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'API_KEY_MISSING',
      message: '未配置高德地图API密钥'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 获取请求类型：定位或天气
  const { searchParams } = new URL(context.request.url);
  const type = searchParams.get('type') || 'weather';
  const city = searchParams.get('city') || '';

  let url;
  if (type === 'ip') {
    // IP定位API
    url = `https://restapi.amap.com/v3/ip?key=${apiKey}`;
  } else {
    // 天气API
    url = `https://restapi.amap.com/v3/weather/weatherInfo?key=${apiKey}&city=${encodeURIComponent(city)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': type === 'ip' ? 'max-age=3600' : 'max-age=1800' // 定位缓存1小时，天气缓存30分钟
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'API_ERROR',
      message: '获取数据失败',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 