import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import OpenAI from "openai";

type Data = {
  response?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const openai = new OpenAI()
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none')
    res.flushHeaders();
    try {
      const { assistant, thread } = req.query;
      const run = openai.beta.threads.runs.stream(thread, {
        assistant_id: assistant
      })
      .on('textCreated', (text) =>{ 
        process.stdout.write('\nassistant > ') 
        res.write(`data: ${JSON.stringify({ event: 'textCreated', data: text })}\n\n`);
      })
      .on('textDelta', (textDelta, snapshot) => {
        process.stdout.write(textDelta.value || "")
        res.write(`data: ${JSON.stringify({ event: 'textDelta', data: textDelta.value || '' })}\n\n`);
      })
      .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
      .on('toolCallDelta', (toolCallDelta, snapshot) => {
        if (toolCallDelta.type === 'code_interpreter') {
          if (toolCallDelta.code_interpreter?.input) {
            process.stdout.write(toolCallDelta.code_interpreter.input);
          }
          if (toolCallDelta.code_interpreter?.outputs) {
            process.stdout.write("\noutput >\n");
            toolCallDelta.code_interpreter.outputs.forEach(output => {
              if (output.type === "logs") {
                process.stdout.write(`\n${output.logs}\n`);
              }
            });
          }
        }
      })
      .on('end', () => {
        res.write('data: {"event": "end"}\n\n');
        res.end();
      });
    } catch (error) {
      res.status(500).json({ error: 'Error processing request' });
    }
  }
  else if (req.method === 'POST') {
    try {
      const { message, thread } = req.body;
      const thread_message = await openai.beta.threads.messages.create(
        thread.id,
        { role: "user", content: message }
      );
      res.status(200).json({})
    } catch (error) {
      res.status(500).json({ error: 'Error processing request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
