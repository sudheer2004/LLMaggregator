import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import MistralClient from '@mistralai/mistralai';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000' // Adjust this to match your frontend's origin
}));

const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const mistralClient = new MistralClient(process.env.MISTRAL_AI_KEY);

const generateGeminiResponse = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  return text;
};

const generateMistralResponse = async (prompt) => {
  const chatResponse = await mistralClient.chat({
    model: 'mistral-tiny',
    messages: [{ role: 'user', content: prompt }],
  });
  return chatResponse.choices[0].message.content;
};

app.post('/api/:service', async (req, res) => {
  const { service } = req.params;
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).send('Prompt is required');
  }

  try {
    let response;
    if (service === 'gemini') {
      response = await generateGeminiResponse(prompt);
    } else if (service === 'mistral') {
      response = await generateMistralResponse(prompt);
    } else {
      return res.status(400).send('Invalid service name');
    }
    res.json({ response });
  } catch (error) {
    console.error(`Error fetching from ${service}:`, error);
    res.status(500).send(`Error fetching from ${service}`);
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the LLM Aggregator API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
