// assets/js/API-AI.js

/**
 * Gọi API proxy backend (Vercel /api/ask-ai), nhận về kết quả chuỗi phản biện từ AI.
 * userInput: chuỗi người dùng nhập vào
 * Trả về: chuỗi phản hồi AI (đã xử lý ở backend)
 */
async function callOpenAIAPI(userInput) {
    const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi gọi API proxy!");
    return data.reply || "Không có phản hồi từ AI.";
}
window.callOpenAIAPI = callOpenAIAPI;