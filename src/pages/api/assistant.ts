import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";


export default async function createAssistant(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
      try {
        const openai = new OpenAI();
        const assistant = await openai.beta.assistants.create({
            name: "Math Tutor",
            instructions: "You are a personal math tutor. Write and run code to answer math questions.",
            tools: [{ type: "code_interpreter" }],
            model: "gpt-4o"
        });
        const thread = await openai.beta.threads.create();
        res.status(200).json({ assistant: assistant, thread: thread });
      } catch (error) {
        res.status(500).json({ error: error });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
}