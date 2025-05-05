// Cloudflare Pages Functions - OpenRouter API代理
export async function onRequest(context) {
  try {
    // 获取环境变量中的API密钥
    const apiKey = context.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "缺少API密钥配置，请在Cloudflare Pages中设置OPENROUTER_API_KEY环境变量"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 从请求中获取数据
    const requestData = await context.request.json();
    
    // 调用OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": context.request.headers.get("origin") || "https://yourwebsite.com",
        "X-Title": "AI聊天助手"
      },
      body: JSON.stringify(requestData)
    });
    
    // 获取API响应
    const data = await response.json();
    
    // 返回结果
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    // 错误处理
    return new Response(JSON.stringify({
      error: `请求处理错误: ${error.message}`
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 