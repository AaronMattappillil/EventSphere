// TODO: User needs to replace this with actual Gemini API Key
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export const chatWithGemini = async (userMessage) => {
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        return "I need a valid API key to function correctly. Please update the `ai.js` file.";
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a helpful assistant for a college event management platform called EventSphere. 
                        User asks: ${userMessage}
                        Answer typically about events, registration, or general college queries. Keep it concise.`
                    }]
                }]
            }),
        });

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;
        return botResponse;

    } catch (error) {
        console.error("Error talking to Gemini:", error);
        return "Sorry, I'm having trouble connecting to my brain right now.";
    }
};

export const enhanceDescription = async (draftDescription) => {
    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        return draftDescription + "\n[AI Enhancement require API Key]";
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Improve this event description to be more engaging and professional for a college event: "${draftDescription}"`
                    }]
                }]
            }),
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error enhancing description:", error);
        return draftDescription;
    }
};
