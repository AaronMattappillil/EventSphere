
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCsLPTv39SO8RrQBpc6f9pJHiqz5NerB54";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function test() {
    try {
        console.log("Testing API Key...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-pro:", result.response.text());
    } catch (e) {
        console.log("Failed with gemini-pro:", e.message);
    }

    try {
        console.log("\nTesting gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-1.5-flash:", result.response.text());
    } catch (e) {
        console.log("Failed with gemini-1.5-flash:", e.message);
    }
}

test();
