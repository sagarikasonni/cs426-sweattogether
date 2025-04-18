import React, { useEffect, useRef } from 'react';
import type { ProfileModel } from "../../data/ProfileModel"


interface Message {
  senderId: number;
  text: string;
  timestamp: Date
}

interface ChatMessagesProps {
  // activeProfile: ProfileModel | null
  messages: Message[];
  chatProfile: { name: string; image: string };
  handleSend: () => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  currentUserId: number;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  // activeProfile,
  messages,
  chatProfile,
  handleSend,
  input,
  setInput,
  currentUserId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="w-3/4 p-4 flex flex-col h-full w-full">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        {chatProfile ? (
          <>
            <img 
              src={chatProfile.image} 
              alt={chatProfile.name}
              className="rounded-full object-cover p-4"
            />
            {chatProfile.name}
          </>
        ) : (
          'Select a conversation from the sidebar or start a new one.'
        )}
      </h2>
      <div className="p-4 overflow-y-auto rounded-lg flex flex-col h-full">
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === currentUserId;
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    marginBottom: '8px'
                  }}
                >
                  <div
                    style={{
                      borderRadius: '8px',
                      padding: '8px 16px',
                      maxWidth: '70%',
                      backgroundColor: isCurrentUser ? '#3b82f6' : '#f3f4f6',
                      color: isCurrentUser ? 'white' : '#1f2937'
                    }}
                  >
                    <p>{msg.text}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        )}
        {/* This div will serve as the scroll-to point */}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex gap-2 flex-shrink-0 bottom-0">
        <input
          type="text"
          className="border p-2 flex-1 rounded-lg w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatMessages;

