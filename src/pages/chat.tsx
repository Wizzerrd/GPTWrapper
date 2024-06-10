import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Message } from '@/components/message';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [assistant, setAssistant] = useState<any>({});
  const [thread, setThread] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    handleCreateAssistant();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleCreateAssistant = async () => {
    try {
      const res = await axios.post('/api/assistant', {});
      setAssistant(res.data.assistant);
      setThread(res.data.thread);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleSendMessage = async () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    try {
      await axios.post('/api/chat', { message: message, thread: thread });
      const newMessage = {
        assistantId: assistant.id,
        threadId: thread.id,
      };
      setMessages((prevMessages) => [...prevMessages, {content: message} ,newMessage]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div id='main' style={{ padding: '20px' }}>
      <h1>ChatGPT Wrapper</h1>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        style={{ width: '100%', height: '100px' }}
      />
      <br />
      <button onClick={handleSendMessage}>Send</button>
      <h2>Response:</h2>
      {messages.map((msg, index) => (
        <Message key={index} {...msg} />
      ))}
    </div>
  );
};

export default Chat;
