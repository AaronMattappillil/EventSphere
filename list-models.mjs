
const GEMINI_API_KEY = "AIzaSyCsLPTv39SO8RrQBpc6f9pJHiqz5NerB54";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Status:", response.status);
        if (response.status !== 200) {
            console.error("Error:", JSON.stringify(data, null, 2));
        } else {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        }
    } catch (e) {
        console.error("Network Error:", e);
    }
}

listModels();
