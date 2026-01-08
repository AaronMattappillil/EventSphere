
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const chatWithGemini = async (userMessage, eventsContext = "No events currently available.") => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const history = [
            {
                role: "user",
                parts: [{
                    text: `You are a helpful assistant for a college event management platform called EventSphere. 
                
                Current Events on the Platform:
                ${eventsContext}
                
                Answer questions about these events, registration, or college life concisely.` }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I have the list of current events and I am ready to help users." }],
            }
        ];

        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Sorry, I'm having trouble connecting to AI. Error: " + error.message;
    }
};

export const enhanceDescription = async (draftDescription) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `Improve this event description to be more engaging and professional for a college event: "${draftDescription}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Enhance Error:", error);
        return draftDescription; // Fallback to original
    }
};
