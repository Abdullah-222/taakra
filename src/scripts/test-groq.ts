import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.error('GROQ_API_KEY not found in .env');
    process.exit(1);
}

const modelName = process.env.GROQ_MODEL || 'llama3-70b-8192';
console.log(`Testing configured model: ${modelName}`);

const groq = new Groq({ apiKey });

async function testModel() {
    try {
        console.log('Sending request to Groq...');
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: 'Hello, are you working?',
                },
            ],
            model: modelName,
        });

        const response = completion.choices[0]?.message?.content;
        console.log(`SUCCESS: ${modelName}`);
        console.log('Response:', response);
    } catch (error: any) {
        console.log(`FAILED: ${modelName}`);
        console.log('Error:', error.message);
        if (error.error) {
            console.log('Error details:', JSON.stringify(error.error, null, 2));
        }
    }
}

testModel();
