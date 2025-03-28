"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import type { Message } from "../../types/messaging"
import type { ProfileModel } from "../../data/ProfileModel"

interface ChatMessagesProps {
  activeProfile: ProfileModel | null
  messages: Message[]
  newMessage: string
  onNewMessageChange: (message: string) => void
  onSendMessage: (e: React.FormEvent) => void
  currentUserId: number
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function ChatMessages({
  activeProfile,
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  currentUserId,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!activeProfile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Start a conversation</h2>
          <p className="text-gray-600">
            Select a conversation from the sidebar or start a new one to connect with workout partners.
          </p>
        </div>
      </div>
    )
  }

  return (

    
    
    <div className="w-full h-full flex flex-col">
      {/* Chat header */}
      <div className="border-b px-4 py-3 flex items-center">
        <img
          src={activeProfile?.image || '/default-avatar.png'}
          alt={activeProfile?.name || 'Profile'}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <h2 className="font-semibold">{activeProfile?.name || 'Chat'}</h2>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 w-full h-full flex items-center justify-center">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-lg">No messages yet. Start the conversation!</p>
        ) : (
          <div className="w-full h-full overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUserId;
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[70%] ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p>{message.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="w-full border-t p-4">
        <form onSubmit={onSendMessage} className="w-full flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 w-full h-full flex items-center justify-center"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

