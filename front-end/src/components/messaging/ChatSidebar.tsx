import React from 'react'
import { Conversation } from '../../types/messaging'
import { Search } from 'lucide-react'
import { ProfileModel } from '../../data/ProfileModel'

interface ChatSidebarProps {
  conversations: Conversation[]
  activeConversationId: number | null
  onChatSelect: (profileId: number) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  formatTime: (date: Date) => string
  profiles: ProfileModel[]
  currentUserId: number
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onChatSelect,
  searchQuery,
  onSearchChange,
  formatTime,
  profiles,
  currentUserId
}: ChatSidebarProps) {
  return (
    <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Messages</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(p => p.id !== currentUserId)
            if (!otherParticipant) return null

            const isActive = activeConversationId === otherParticipant.id

            return (
              <div
                key={conversation.id}
                className={`flex items-center px-4 py-2 cursor-pointer border-l-4 ${
                  isActive
                    ? "bg-blue-50 border-blue-500"
                    : "hover:bg-gray-50 border-transparent"
                }`}
                onClick={() => onChatSelect(otherParticipant.id)}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={otherParticipant.image}
                    alt={otherParticipant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {conversation.unreadCount > 0 && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">{conversation.unreadCount}</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className={`text-sm font-semibold truncate ${isActive ? "text-blue-600" : "text-gray-900"}`}>
                      {otherParticipant.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <p className={`text-sm truncate ${
                      conversation.unreadCount > 0 && !isActive 
                        ? "font-medium text-gray-900" 
                        : "text-gray-500"
                    }`}>
                      {conversation.lastMessage?.content}
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