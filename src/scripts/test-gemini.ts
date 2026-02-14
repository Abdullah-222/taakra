import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env');
    process.exit(1);
}

const modelName = process.env.GEMINI_MODEL || 'models/gemini-2.0-flash';
console.log(`Testing configured model: ${modelName}`);

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel() {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, are you working?');
        const response = result.response;
        console.log(`SUCCESS: ${modelName}`);
        console.log('Response:', response.text());
    } catch (error: any) {
        console.log(`FAILED: ${modelName}`);
        console.log('Error:', error.message);
    }
}

testModel();
