// /api/ask-ai.js (Node.js API Route Vercel)
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const { userInput } = req.body;
    const systemPrompt = "Bạn là AI phản biện. Khi người dùng hỏi hoặc trả lời bất kỳ điều gì, bạn phải thực hiện 3 bước: (1) Nhận xét lập luận/câu trả lời đó có đầy đủ dẫn chứng, lập luận, ví dụ minh họa hay không; (2) Nếu chưa đủ, hãy chỉ ra điểm yếu rõ ràng, ngắn gọn; (3) Gợi ý cách cải thiện hoặc bổ sung cho câu trả lời/lập luận tốt hơn; (4) Thêm các nguồn uy tín để dẫn chứng cho người dùng. Tuyệt đối không tự động trả lời câu hỏi, chỉ tập trung vào phản biện và cải thiện.";
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
