// assets/js/API-AI.js

/**
 * Gọi API proxy backend (Vercel /api/ask-ai), nhận về kết quả chuỗi phản biện từ AI.
 * userInput: chuỗi người dùng nhập vào
 * Trả về: chuỗi phản hồi AI (đã xử lý ở backend)
 */
async function callOpenAIAPI(userInput) {
    const history = JSON.parse(localStorage.getItem('conversationHistory') || '[]'); // Lấy lịch sử cuộc trò chuyện từ localStorage
    const cognitiveEngagementHistory = JSON.parse(localStorage.getItem('cognitiveEngagementHistory') || '[]'); // Lấy lịch sử cognitive engagement từ localStorage

   // Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}'); 
    const senderId = user.sub || null;
    const senderName = user.name || "Unknown";
    const senderAvatar = user.picture || null;

    const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput, history, senderId, senderName, senderAvatar }) // Gửi lịch sử cùng với yêu cầu
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Lỗi gọi API proxy!");

    // Lưu lịch sử mới vào localStorage
    localStorage.setItem('conversationHistory', JSON.stringify(data.history));
    // Lưu cognitive engagement kèm sender info
    cognitiveEngagementHistory.push({
        senderId,
        senderName,
        senderAvatar,
        engagement: data.cognitiveEngagement
    });    localStorage.setItem('cognitiveEngagementHistory', JSON.stringify(cognitiveEngagementHistory));

    return data.reply || "Không có phản hồi từ AI.";
}
window.callOpenAIAPI = callOpenAIAPI;
