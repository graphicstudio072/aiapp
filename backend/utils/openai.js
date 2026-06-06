import OpenAI from 'openai';

let openaiClient = null;

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

// Simple rule-based mock responses for chat/analysis in case of no key
const generateMockResponse = (messages, type = 'chat') => {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  
  if (type === 'summary') {
    return `### Executive Summary
This document outlines key strategies and data points. Below is a structured breakdown:

1. **Core Concept**: The primary theme focuses on efficiency improvements and modernizing workflows through digital automation.
2. **Key Findings**: Analytical assessments show a potential 30% reduction in processing overhead and an increase in user engagement by 45%.
3. **Action Items**:
   - Establish cloud infrastructure.
   - Refactor critical legacy APIs.
   - Initiate system-wide security training.

*This summary was generated using the application's AI Mock Mode.*`;
  }

  if (type === 'qna') {
    return `Regarding your question: **"${lastUserMessage}"**, based on the uploaded document, here is the relevant analysis:
    
- The document references active security standards and data confidentiality guidelines.
- Processes are tracked automatically in the audit logs.
- Optimization steps should be applied iteratively.

*Answer generated in AI Mock Mode.*`;
  }

  // General Chat Mock
  const lowerMsg = lastUserMessage.toLowerCase();
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return "Hello! I am your AI Assistant. How can I help you today? (Mock Mode)";
  } else if (lowerMsg.includes('help')) {
    return "I can assist you with data summarization, writing code, answering general questions, or parsing uploaded files. Ask me anything!";
  } else if (lowerMsg.includes('code') || lowerMsg.includes('function')) {
    return `Certainly! Here is an example of a simple Express route in JavaScript:

\`\`\`javascript
import express from 'express';
const router = express.Router();

// Get api status
router.get('/status', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

export default router;
\`\`\`

Let me know if you need me to explain this or write something else!`;
  }

  return `Thank you for your message: "${lastUserMessage}". 

I am currently running in **AI Mock Mode** because no OpenAI API Key was configured in the \`.env\` file. 
To enable full AI functionalities, please add a valid key:
\`\`\`env
OPENAI_API_KEY=sk-proj-...
\`\`\`
How else can I assist you with this mock context?`;
};

export const generateChatResponse = async (messages) => {
  const openai = getOpenAIClient();
  if (!openai) {
    // Return mock response after a slight delay to mimic api latency
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateMockResponse(messages, 'chat');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    return `Error communicating with OpenAI API: ${error.message}. Falling back to mock: \n\n ${generateMockResponse(messages, 'chat')}`;
  }
};

export const generateSummary = async (documentContent) => {
  const openai = getOpenAIClient();
  const prompt = [
    {
      role: 'system',
      content: 'You are an expert document analyst. Provide a detailed, professional, and readable summary of the provided text content. Use markdown headings, lists, and bold text for clarity.'
    },
    {
      role: 'user',
      content: `Analyze and summarize the following document content:\n\n${documentContent.substring(0, 15000)}`
    }
  ];

  if (!openai) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return generateMockResponse(prompt, 'summary');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: prompt,
      temperature: 0.5,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Summary API Error:', error.message);
    return generateMockResponse(prompt, 'summary');
  }
};

export const generateDocumentAnswer = async (documentContent, question) => {
  const openai = getOpenAIClient();
  const prompt = [
    {
      role: 'system',
      content: 'You are an AI assistant helping a user extract information from a document. Use ONLY the provided document content to answer the question. If the answer cannot be found in the document, state that clearly.'
    },
    {
      role: 'user',
      content: `Document Content:\n${documentContent.substring(0, 12000)}\n\nQuestion: ${question}`
    }
  ];

  if (!openai) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateMockResponse(prompt, 'qna');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: prompt,
      temperature: 0.3,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Q&A API Error:', error.message);
    return generateMockResponse(prompt, 'qna');
  }
};
