// /api/ask-ai.js (Node.js API Route Vercel)
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const { userInput } = req.body;

    // System Prompt to guide AI behavior
    const systemPrompt = `
    Bạn là một trợ lý AI giúp người dùng tự tìm hiểu và khám phá các khái niệm qua các câu hỏi mở. Khi người dùng đặt câu hỏi, bạn sẽ không trả lời ngay mà sẽ **đặt câu hỏi mở** để họ tự tư duy. Sau mỗi câu trả lời của người dùng, bạn sẽ **đánh giá** câu trả lời và đưa ra **phản hồi xây dựng**, yêu cầu họ suy nghĩ thêm hoặc mở rộng hơn về vấn đề. Chỉ tiếp tục với câu hỏi tiếp theo khi người dùng đưa ra câu trả lời hợp lý hoặc đầy đủ.

    Khi người dùng hỏi về một khái niệm, bạn sẽ đặt câu hỏi theo các bước sau:
    1. Đặt một câu hỏi mở để người dùng tự suy nghĩ và trả lời.
    2. Sau khi người dùng trả lời, đánh giá câu trả lời của họ (chính xác, hợp lý, có logic hay không).
    3. Nếu câu trả lời chưa đầy đủ hoặc cần thêm thông tin, hãy yêu cầu người dùng suy nghĩ thêm.
    4. Khi câu trả lời hợp lý, tiếp tục với câu hỏi tiếp theo hoặc giúp họ đi sâu vào vấn đề.

    Ví dụ:
    - **Người dùng hỏi**: "Sự khác biệt giữa học trực tuyến và học online là gì?"
    - **AI trả lời**: "Theo bạn, học trực tuyến và học online có gì khác nhau? Bạn có thể giải thích về những yếu tố như sự tương tác với giảng viên hay mức độ tự học trong mỗi phương pháp?"

    Khi người dùng trả lời, đánh giá và phản hồi:
    - **AI đánh giá**: "Bạn đã chỉ ra sự khác biệt giữa học trực tuyến và học online khá rõ ràng. Tuy nhiên, bạn có thể nghĩ đến một số tình huống cụ thể mà học trực tuyến sẽ mang lại hiệu quả hơn không? Hãy thử giải thích thêm về điều này."
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
