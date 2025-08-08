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

    const data = await response.json();
    if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || "Lỗi gọi API OpenAI!" });
    }

    const aiReply = data.choices?.[0]?.message?.content?.trim() || "";

    // Add the AI reply to the conversation history
    conversationHistory.push({ role: "assistant", content: aiReply });

    // Send back the reply along with the updated conversation history
    return res.json({ reply: aiReply, history: conversationHistory });
}
