// /api/ask-ai.js (Node.js API Route Vercel)
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const { userInput } = req.body;

    // System Prompt to guide AI behavior
    const systemPrompt = `
    Bạn là một trợ lý AI giúp người dùng học thông qua phương pháp Socratic.
    Bạn chỉ được phép đặt câu hỏi mở để khuyến khích người học tự suy nghĩ và khám phá khái niệm.
    Không trả lời câu hỏi trực tiếp. Nếu người học không biết hoặc không hiểu, bạn sẽ giải thích khái niệm một cách ngắn gọn và dễ hiểu, nhưng sau đó tiếp tục đặt một câu hỏi mở để người học tự khám phá.
`;

    const apiKey = process.env.GROQ_API_KEY;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
            model: "moonshotai/kimi-k2-instruct",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInput }
            ],
            temperature: 0.7,
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
