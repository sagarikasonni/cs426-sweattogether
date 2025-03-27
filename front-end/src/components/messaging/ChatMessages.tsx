import React from 'react'
import { Message } from '../../types/messaging'
import { MessageCircle, Users, Paperclip, Send, Smile } from 'lucide-react'
import { ProfileModel } from '../../data/ProfileModel'

interface ChatMessagesProps {
  activeProfile: ProfileModel | null
  messages: Message[]
  newMessage: string
  onNewMessageChange: (message: string) => void
  onSendMessage: (e: React.FormEvent) => void
  formatTime: (date: Date) => string
  onFindPartnersClick: () => void
  currentUserId: number
}

export function ChatMessages({
  activeProfile,
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  formatTime,
  onFindPartnersClick,
  currentUserId
}: ChatMessagesProps) {
  if (!activeProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <MessageCircle className="h-10 w-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your messages</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Connect with your workout partners! Select a conversation from the sidebar or find new partners to chat with.
        </p>
        <button
          onClick={onFindPartnersClick}
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Users className="h-5 w-5 mr-2" />
          Find Workout Partners
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center">
        <img
          src={activeProfile.image}
          alt={activeProfile.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-4 flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{activeProfile.name}</h2>
          <p className="text-sm text-gray-500">
            {activeProfile.location.city ? `${activeProfile.location.city}, ${activeProfile.location.country}` : activeProfile.location.country}
          </p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-3 max-w-3xl mx-auto">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId
            const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].senderId !== message.senderId)
            const showTimestamp = index === messages.length - 1 || 
              messages[index + 1]?.timestamp.getTime() - message.timestamp.getTime() > 1000 * 60 * 5

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-end max-w-[70%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                  {showAvatar && !isCurrentUser && (
                    <img
                      src={activeProfile.image}
                      alt={activeProfile.name}
                      className="w-8 h-8 rounded-full object-cover mb-1 mr-2"
                    />
                  )}
                  {!showAvatar && !isCurrentUser && <div className="w-10" />}
                  
                  <div>
                    <div className={`px-4 py-2 rounded-2xl ${
                      isCurrentUser 
                        ? "bg-blue-500 text-white rounded-br-sm" 
                        : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    {showTimestamp && (
                      <div className={`mt-1 text-xs text-gray-400 ${isCurrentUser ? "text-right" : "text-left"}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-200">
        <form onSubmit={onSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newMessage}
              onChange={(e) => onNewMessageChange(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim() 
                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
} 