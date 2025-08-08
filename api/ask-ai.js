// /api/ask-ai.js (Node.js API Route Vercel)

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

    const { userInput } = req.body;
    const conversationHistory = req.body.history || [];

    // System Prompt to guide AI behavior
    const systemPrompt = `
    You are an AI assistant who guides users to learn through the Socratic method.  
    Always respond with open-ended questions that encourage users to think critically, explore, and go deeper into the topic; never provide direct answers.  
    If the user says “I don’t know”, “never heard of it”, “I have no knowledge”, “I don’t understand”, or similar, do the following:
    1. Briefly and clearly explain the concept or issue they asked about, in a way that’s easy to understand.
    2. Immediately follow up with another open-ended question on the same topic, encouraging the user to relate it to their experience or think more deeply.
    DO NOT switch to another topic, DO NOT ask “what do you want to know?”, DO NOT repeat the previous question, DO NOT suggest ending the conversation.  
    Continue only by asking open-ended questions or briefly explaining and then asking again if the user doesn’t understand.
    `;

    const apiKey = process.env.OPENAI_API_KEY;

    // Add the new user input to the conversation history
    conversationHistory.push({ role: "user", content: userInput });

    let aiReply;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...conversationHistory
                ],
                temperature: 0.7,
                max_tokens: 512,
                top_p: 1,
                stream: false,
                stop: null
            })
        });

        // Check if the response is a valid JSON
        const data = await response.json(); // This will throw an error if the response is not valid JSON

        if (!response.ok) {
            // If API call fails, return a detailed error
            return res.status(response.status).json({ error: data.error?.message || "Lỗi gọi API OpenAI!" });
        }

        aiReply = data.choices?.[0]?.message?.content?.trim() || "";
    } catch (error) {
        // Catching errors when the response is not a valid JSON or other issues
        return res.status(500).json({ error: "Failed to parse response or call API: " + error.message });
    }

    // Add the AI reply to the conversation history
    conversationHistory.push({ role: "assistant", content: aiReply });

    // Phân loại Cognitive Engagement cho input của người dùng
    const engagementLevel = await classifyCognitiveEngagement(userInput);


    // Gửi lại phản hồi và mức độ Cognitive Engagement
    return res.json({
        reply: aiReply,
        cognitiveEngagement: engagementLevel,
        history: conversationHistory
    });
}

// Hàm phân loại Cognitive Engagement (Positive, Neutral, Negative)
// Hàm phân loại Cognitive Engagement (Positive, Neutral, Negative)
async function classifyCognitiveEngagement(userInput) {
    const apiKey = process.env.OPENAI_API_KEY;

    const prompt = `
    Please classify the following user input as one of the following: "Positive", "Neutral", or "Negative". 
    "Positive" indicates the input shows active engagement and critical thinking.
    "Neutral" indicates the input is somewhat engaged but lacks deep analysis or emotion.
    "Negative" indicates the input shows a lack of engagement or confusion.
    
    Here is the user input: "${userInput}"
    Please respond with only one of the labels: Positive, Neutral, Negative.
    `;

    try {
        // Gửi yêu cầu tới OpenAI để phân loại
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",  // Có thể sử dụng GPT-3.5 hoặc GPT-4 tùy nhu cầu
                prompt: prompt,
                temperature: 0.7,
                max_tokens: 10
            })
        });

        const data = await response.json();
        return data.choices[0].text.trim();  // Trả về "Positive", "Neutral", hoặc "Negative"
    } catch (error) {
        // Catching errors if classification fails
        console.error("Error classifying user input:", error);
        return "Neutral";  // Default fallback value
    }
}
