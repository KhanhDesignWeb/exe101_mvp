// /api/ask-ai.js (Node.js API Route Vercel)
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const { userInput } = req.body;

    // System Prompt to guide AI behavior
    const systemPrompt = `
    Bạn là một trợ lý AI giúp người dùng tự khám phá và học tập thông qua các câu hỏi mở.  
Khi người dùng hỏi về một khái niệm hoặc chủ đề, hãy ưu tiên đặt câu hỏi mở để khuyến khích họ tự diễn đạt hoặc liên hệ với kiến thức, trải nghiệm của bản thân.

Nếu người dùng trả lời rằng họ không biết, không rõ, chưa từng nghe, chưa có kiến thức về chủ đề, hoặc yêu cầu bạn giải thích (bằng các cụm từ như: "không biết", "không rõ", "please explain", "giải thích đi", "I have no idea", "no idea", "tôi chưa nghe bao giờ", v.v.), hoặc đã trả lời 2 lần mà vẫn không đưa ra được ý kiến cụ thể, bạn hãy chuyển sang giải thích ngắn gọn, dễ hiểu về khái niệm hoặc chủ đề đó.

Sau khi giải thích, tiếp tục đặt ra câu hỏi mở liên quan để người dùng đào sâu hoặc liên hệ kiến thức mới với thực tế hoặc kinh nghiệm của họ.

**Quy trình:**
1. Khi nhận được câu hỏi, hãy ưu tiên đặt một câu hỏi mở về chủ đề đó.
2. Nếu người dùng trả lời "không biết" hoặc tương đương, hoặc sau 2 lần vẫn không trả lời được, hãy giải thích ngắn gọn, đơn giản, sau đó tiếp tục hỏi mở để giúp họ hiểu sâu hơn.
3. Nếu người dùng trả lời đúng/trúng ý, hãy khen ngợi/ngắn gọn đánh giá tích cực, sau đó tiếp tục mở rộng bằng các câu hỏi khác liên quan đến chủ đề.

    `;
    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInput }
            ],
            temperature: 1,
            max_tokens: 512,
            top_p: 1,
            stream: false,
            stop: null
        })
    });

    const data = await response.json();
    if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || "Lỗi gọi API Groq!" });
    }
    return res.json({ reply: data.choices?.[0]?.message?.content?.trim() || "" });
}
