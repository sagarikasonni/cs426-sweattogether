import React, { useState } from 'react';
import { Message } from '../types/messaging';
import { ChatMessages } from '../components/messaging/ChatMessages';
import { ChatSidebar } from '../components/messaging/ChatSidebar';
import { ProfileModel } from '../data/ProfileModel';
import profileData from '../mockData/MockProfiles';
import { useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';

const CURRENT_USER_ID = 1;

export default function Messaging() {
  const { profileId } = useParams<{ profileId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    profileId ? Number(profileId) : null
  );

  // Create conversations from profile data
  const conversations = profileData.map(profile => ({
    id: profile.id,
    participants: [profile],
    messages: [],
    unreadCount: 0,
    lastMessage: messages[messages.length - 1],
  }));

  const handleChatSelect = (profileId: number) => {
    setActiveConversationId(profileId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeConversationId) {
      const message: Message = {
        id: messages.length + 1,
        content: newMessage,
        senderId: CURRENT_USER_ID,
        receiverId: activeConversationId,
        timestamp: new Date(),
        isRead: true
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const activeProfile = profileData.find(p => p.id === activeConversationId);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex flex-none">
        <div className="w-[320px] bg-gray-200">
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onChatSelect={handleChatSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            formatTime={formatTime}
            profiles={profileData}
            currentUserId={CURRENT_USER_ID}
          />
        </div>
        <div className="flex-grow: 1">
          <ChatMessages
            activeProfile={activeProfile || null}
            messages={messages}
            newMessage={newMessage}
            onNewMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            currentUserId={CURRENT_USER_ID}
          />
        </div>
      </div>
    </div>
  );
}
