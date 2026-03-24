import { recommendTools } from "../api/recommend";

// 模拟 API 调用
export async function mockFetch(url: string, options?: RequestInit): Promise<Response> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (url === "/api/recommend" && options?.method === "POST") {
    try {
      const body = JSON.parse(options.body as string);
      const results = await recommendTools(body.query);
      
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "推荐失败" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

// 覆盖全局 fetch
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  
  if (url.startsWith("/api/")) {
    return mockFetch(url, init);
  }
  
  return originalFetch(input, init);
};
