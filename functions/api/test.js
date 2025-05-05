// 简单的测试端点，检查Functions是否正常工作
export async function onRequest(context) {
  try {
    // 检查环境变量
    const hasApiKey = !!context.env.OPENROUTER_API_KEY;
    
    return new Response(JSON.stringify({
      status: "ok",
      message: "测试端点正常工作",
      env: {
        hasApiKey: hasApiKey,
        keyLength: hasApiKey ? context.env.OPENROUTER_API_KEY.length : 0
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: "error",
      message: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 