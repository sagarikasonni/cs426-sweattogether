"use client"

import type React from "react"

import { useState } from "react"
import mockChats from "../../mockData/MockChats"

interface ChatSidebarProps {
  chats: { id: number; profile: { name: string; image: string } }[];
  selectedChat: number;
  handleChatSelect: (id: number) => void;
  currentUserId: number;   
  chatPreviews?: {
    chatId: number;
    senderId: number;
    text: string;
    timestamp: Date;
  }[];
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats, selectedChat, handleChatSelect, currentUserId, chatPreviews = [] }) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter((chat) => chat.profile.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const sortedChats = filteredChats.sort((a, b) => {
    const previewA = chatPreviews.find((p) => p.chatId === a.id);
    const previewB = chatPreviews.find((p) => p.chatId === b.id);

    const timestampA = previewA ? new Date(previewA.timestamp).getTime() : 0;
    const timestampB = previewB ? new Date(previewB.timestamp).getTime() : 0;

    return timestampB - timestampA; // Sort descending by timestamp
  });

  return (
    <div className="static min-h-screen bg-gray-200 p-4">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Messages</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search messages"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {sortedChats.length > 0 ? (
          sortedChats.map((chat) => {
            const isActive = selectedChat === chat.id;
  
            // First try to get the last message from chatPreviews
            const preview = chatPreviews.find((p: { chatId: number }) => p.chatId === chat.id);
            
            // Fall back to mockChats if no preview is found
            const lastMsgObj = preview
            ? { 
                senderId: preview.senderId, 
                text: preview.text,
                timestamp: new Date(preview.timestamp),
              }
            :  mockChats[chat.id]?.slice(-1)[0];
            
            // Determine sender display text
            const senderDisplay = lastMsgObj 
              ? (lastMsgObj.senderId === currentUserId ? "You" : chat.profile.name) 
              : "";
          
            // Truncate the text: We originally limit to 15 characters,
            // but you can adjust the substring logic if needed.
            const truncatedText = lastMsgObj 
              ? (lastMsgObj.text.length > 10 
                   ? lastMsgObj.text.substring(0, 10) + "..." 
                   : lastMsgObj.text)
              : "No messages yet.";
          
            // Combine sender and message preview
            const lastMessage = lastMsgObj 
              ? `${senderDisplay}: ${truncatedText}`
              : "No messages yet.";          

            return (
              <div
                key={chat.id}
                className={`flex items-center px-4 py-2 cursor-pointer border-l-4 ${
                  isActive ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50 border-transparent"
                }`}
                onClick={() => handleChatSelect(chat.id)}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={chat.profile.image}
                    alt={chat.profile.name}
                    className="w-full h-full rounded-full object-cover"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-semibold truncate 
                      ${isActive ? 'text-blue-600' : 'text-gray-900'}">
                      {chat.profile.name}
                    </h3>
                    <div className="mt-1" style={{ maxWidth: "75px" }}>
                      <p
                        className="text-sm overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {lastMessage}
                      </p>
                    </div>
                  </div>
              </div>
            )
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

