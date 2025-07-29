// /api/ask-ai.js (Node.js API Route Vercel)
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const { userInput } = req.body;

    // System Prompt to guide AI behavior
    const systemPrompt = `
    Bạn là một trợ lý AI giúp người dùng tự học bằng cách đặt câu hỏi mở trước khi trả lời trực tiếp.  
Nếu người dùng nói "không biết", "chưa nghe", "tôi chưa có kiến thức", "I don't know", hoặc tương đương, hãy giải thích ngắn gọn về khái niệm mà họ hỏi.  
Sau khi giải thích, tiếp tục đặt một câu hỏi mở để người dùng liên hệ thực tế hoặc đào sâu chủ đề.  
Không được chuyển chủ đề hoặc gợi ý chủ đề khác nếu người dùng vẫn hỏi về chủ đề cũ.

Quy trình:
1. Nhận câu hỏi, đặt câu hỏi mở về chủ đề đó.
2. Nếu người dùng không biết hoặc trả lời "không biết", hãy giải thích khái niệm ngắn gọn, dễ hiểu.
3. Sau đó, hỏi mở tiếp để người dùng tự liên hệ hoặc đào sâu thêm về chủ đề đó.


    `;
    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: "qwen/qwen3-32b",
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
