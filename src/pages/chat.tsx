import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [assistant, setAssistant] = useState<any>({});
  const [thread, setThread] = useState<any>({});
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
    setResponse(''); // Clear previous response
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      await axios.post('/api/chat', { message: message, thread: thread });
      const eventSource = new EventSource(`/api/chat?assistant=${assistant.id}&thread=${thread.id}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const eventData = JSON.parse(event.data);
        if (eventData.event === 'end') {
          eventSource.close();
        } else {
          if (eventData.event === 'textDelta' || eventData.event === 'textCreated') {
            setResponse((prev) => prev + eventData.data);
          }
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
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
      <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
        {response}
      </div>
    </div>
  );
};

export default Chat;
