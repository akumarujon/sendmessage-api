import { Context } from "npm:hono";

export const rateLimit = async (c: Context, token: string, kv: Deno.Kv): Promise<boolean> => {
    const now = Date.now();
    const entry = await kv.get<number>(["token", token]);
  
    if (entry.value == null) {
      // First request from this token
      await kv.set(["token", token], now);
      return true;
    }
  
    const lastRequestTime = entry.value;
    const timeSinceLastRequest = now - lastRequestTime;
    const timeLimit = 20 * 60 * 1000; // 20 minutes in milliseconds
  
    if (timeSinceLastRequest < timeLimit) {
      // Too soon for another request
      const remainingTime = Math.ceil((timeLimit - timeSinceLastRequest) / 1000 / 60);
      c.json({ message: `Please wait ${remainingTime} minutes before sending another message.` }, 429);
      return false;
    }
  
    // Update the last request time
    await kv.set(["token", token], now);
    return true;
  };