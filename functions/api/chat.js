// Cloudflare Pages Functions - OpenRouter API代理
export async function onRequest(context) {
  try {
    // 获取环境变量中的API密钥
    const apiKey = context.env.OPENROUTER_API_KEY;
    
    // 调试信息
    console.log("环境变量存在检查:", {
      hasApiKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0
    });
    
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
    
    // 调试请求数据
    console.log("发送到OpenRouter的请求:", {
      model: requestData.model,
      messageCount: requestData.messages ? requestData.messages.length : 0
    });
    
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
    
    // 检查OpenRouter响应状态
    console.log("OpenRouter API响应状态:", response.status);
    
    // 获取API响应
    const data = await response.json();
    
    // 调试响应数据
    if (response.ok) {
      console.log("OpenRouter响应成功:", {
        hasChoices: !!data.choices,
        choicesLength: data.choices ? data.choices.length : 0
      });
    } else {
      console.log("OpenRouter响应失败:", {
        error: data.error,
        message: data.message || data.error_message || "未知错误"
      });
    }
    
    // 返回结果
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    // 详细错误处理
    console.error("函数执行错误:", error.message, error.stack);
    
    return new Response(JSON.stringify({
      error: `请求处理错误: ${error.message}`,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 