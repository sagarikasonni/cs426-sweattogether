import React from 'react'
import { Message } from '../../types/messaging'
import { ProfileModel } from '../../data/ProfileModel'

interface ChatMessagesProps {
  activeProfile: ProfileModel | null
  messages: Message[]
  newMessage: string
  onNewMessageChange: (message: string) => void
  onSendMessage: (e: React.FormEvent) => void
  currentUserId: number
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatMessages({
  activeProfile,
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  currentUserId
}: ChatMessagesProps) {
  if (!activeProfile) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chat Header */}
      <div className="w-full border-b border-gray-200">
        <div className="px-4 py-2 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={activeProfile.image}
              alt={activeProfile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{activeProfile.name}</div>
            <div className="text-sm text-gray-500">{activeProfile.location.city}</div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId
            const showTimestamp = index === messages.length - 1 || 
              messages[index + 1]?.timestamp.getTime() - message.timestamp.getTime() > 1000 * 60 * 5
            
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col gap-1">
                  <div className={`inline-block px-3 py-2 max-w-[280px] ${
                    isCurrentUser 
                      ? "bg-blue-500 text-white rounded-t-2xl rounded-l-2xl" 
                      : "bg-gray-100 text-gray-900 rounded-t-2xl rounded-r-2xl"
                  }`}>
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                  {showTimestamp && (
                    <div className={`text-xs text-gray-500 ${isCurrentUser ? "text-right" : "text-left"}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Message Input */}
      <div className="w-full border-t border-gray-200">
        <form onSubmit={onSendMessage} className="p-3 flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
} 