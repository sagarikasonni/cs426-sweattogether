"use client"

import type React from "react"

import { useState } from "react"
import mockChats from "../../mockData/MockChats"

interface ChatSidebarProps {
  chats: { id: number; profile: { name: string; image: string } }[];
  selectedChat: number;
  handleChatSelect: (id: number) => void;
  currentUserId: number;   
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats, selectedChat, handleChatSelect, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chats.filter((chat) => chat.profile.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const isActive = selectedChat === chat.id
            const hasMessages = mockChats[chat.id] && mockChats[chat.id].length > 0
            const lastMsgObj = hasMessages ? mockChats[chat.id][mockChats[chat.id].length - 1] : null;
  
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
                    className="w-12 h-12 rounded-full object-cover"
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

