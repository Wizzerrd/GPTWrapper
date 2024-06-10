import React, { useEffect, useRef, useState } from 'react';

interface MessageProps {
    assistantId: string;
    threadId: string;
    content: string;
}

export const Message: React.FC<MessageProps> = ({ assistantId, threadId, content }) => {
    const [response, setResponse] = useState("");
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (assistantId && threadId) {
            const eventSource = new EventSource(`/api/chat?assistant=${assistantId}&thread=${threadId}`);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                const eventData = JSON.parse(event.data);
                if (eventData.event === 'end') {
                    eventSource.close();
                } else {
                    if (eventData.event === 'textDelta') {
                        console.log(eventData)
                        setResponse((prev) => prev + eventData.data);
                    }
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
            };
        } else if (content) {
            setResponse(content)
        }
    }, [assistantId, threadId]);

    return (
        <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
            {response}
        </div>
    );
}
