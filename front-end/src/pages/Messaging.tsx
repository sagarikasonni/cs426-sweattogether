import { useState } from 'react';
import NavBar from '../components/NavBar';
import profileData from '../mockData/MockProfiles';
import mockChats from '../mockData/MockChats';
import { ChatSidebar } from '../components/messaging/ChatSidebar';
import ChatMessages from '../components/messaging/ChatMessages';

const currentUserId = 0;
const chatIds = [1, 2, 3, 6];

const chats = chatIds.reduce((acc, id) => {
  acc[id] = {
    id,
    profile: profileData.find((profile) => profile.id === id) || { name: 'Unknown', image: 'https://placehold.co/200x200' },
  };
  return acc;
}, {} as { [key: number]: { id: number, profile: { name: string, image: string } } });

function Messaging() {
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [messages, setMessages] = useState(mockChats[1]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && selectedChat !== undefined) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { senderId: currentUserId, text: input },
      ]);
      setInput('');
    }
  };

  const handleChatSelect = (id: number) => {
    setSelectedChat(id);
  
    // Check if chat exists in mockChats, otherwise set messages to an empty array
    const chatMessages = mockChats[id] || [];
    
    setMessages(chatMessages);
  };

  return (
    <>
      <NavBar />
      <div className="flex h-screen">
        {/* ChatSidebar Component */}
        <ChatSidebar
          chats={Object.values(chats)}
          selectedChat={selectedChat}
          handleChatSelect={handleChatSelect}
        />

        {/* ChatMessages Component */}
        <ChatMessages
          messages={messages}
          chatProfile={chats[selectedChat]?.profile}
          handleSend={handleSend}
          input={input}
          setInput={setInput}
          currentUserId={currentUserId}
        />
      </div>
    </>
  );
}

export default Messaging;
