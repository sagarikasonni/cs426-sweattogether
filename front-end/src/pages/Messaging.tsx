"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import NavBar from "../components/NavBar"
import { ChatSidebar } from "../components/messaging/ChatSidebar"
import { ChatMessages } from "../components/messaging/ChatMessages"
import profileData from "../mockData/MockProfiles"
import { Message, Conversation } from "../types/messaging"

// Mock current user ID (replace with actual auth user ID later)
const CURRENT_USER_ID = 1

// Sample messages for mock conversations
const mockMessages = [
  "Hey, want to meet up for a workout?",
  "I saw you're into running. Want to join me for a morning jog?",
  "Looking for a gym buddy this weekend!",
  "Would you be interested in joining my yoga class?",
  "Hi! I noticed we're both into hiking. Any favorite trails?",
  "Want to try that new CrossFit gym together?",
  "Need a spotter for weightlifting tomorrow?",
  "Up for some rock climbing this weekend?"
]

// Temporary mock data - will be removed later
const mockConversations: Conversation[] = profileData.slice(0, 8).map((profile, index) => {
  const timeOffset = 1000 * 60 * (index === 0 ? 1 : index * 30) // More recent messages for first few conversations
  const isRecent = index < 3
  
  return {
    id: index + 1,
    participants: [profileData[0], profile], // First profile is current user
    messages: [],
    lastMessage: {
      id: index + 1,
      senderId: index % 2 === 0 ? profile.id : CURRENT_USER_ID, // Alternate between user and profile sending
      receiverId: index % 2 === 0 ? CURRENT_USER_ID : profile.id,
      content: mockMessages[index],
      timestamp: new Date(Date.now() - timeOffset),
      isRead: !isRecent
    },
    unreadCount: isRecent && index % 2 === 0 ? 1 : 0 // Only show unread for messages from others
  }
})

function Messaging() {
  const { profileId } = useParams<{ profileId: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeConversation, setActiveConversation] = useState<number | null>(
    profileId ? Number.parseInt(profileId) : null,
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const navigate = useNavigate()

  // Filter conversations based on search query
  const filteredConversations = mockConversations.filter((conversation) => {
    const otherParticipant = conversation.participants.find(p => p.id !== CURRENT_USER_ID)
    if (!otherParticipant) return false

    if (searchQuery) {
      return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase())
    }

    return true
  })

  // Get the active profile
  const activeProfile = activeConversation 
    ? mockConversations.find(c => c.participants.some(p => p.id === activeConversation))?.participants.find(p => p.id === activeConversation)
    : null

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      const conversation = mockConversations.find(c => 
        c.participants.some(p => p.id === activeConversation)
      )
      
      if (conversation) {
        // Generate some mock messages for the conversation
        const mockHistory: Message[] = Array.from({ length: 5 }, (_, i) => ({
          id: Date.now() - (1000 * 60 * 60 * i),
          senderId: i % 2 === 0 ? CURRENT_USER_ID : activeConversation,
          receiverId: i % 2 === 0 ? activeConversation : CURRENT_USER_ID,
          content: `Sample message ${i + 1} in this conversation`,
          timestamp: new Date(Date.now() - (1000 * 60 * 60 * i)),
          isRead: true
        }))

        setMessages(mockHistory)
      }

      navigate(`/messaging/${activeConversation}`, { replace: true })
    }
  }, [activeConversation, navigate])

  const handleChatClick = (profileId: number) => {
    setActiveConversation(profileId)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !activeConversation) return

    const newMsg: Message = {
      id: Date.now(),
      senderId: CURRENT_USER_ID,
      receiverId: activeConversation,
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
    }

    setMessages((prev) => [...prev, newMsg])
    setNewMessage("")
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      // Show time for messages from today
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 48) {
      // Show "Yesterday" for messages from yesterday
      return "Yesterday"
    } else {
      // Show date for older messages
      return messageDate.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          conversations={filteredConversations}
          activeConversationId={activeConversation}
          onChatSelect={handleChatClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          formatTime={formatTime}
          profiles={profileData}
          currentUserId={CURRENT_USER_ID}
        />

        <div className="flex-1 flex flex-col bg-gray-50">
          {activeProfile ? (
            <ChatMessages
              activeProfile={activeProfile}
              messages={messages}
              newMessage={newMessage}
              onNewMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              formatTime={formatTime}
              onFindPartnersClick={() => navigate("/explore")}
              currentUserId={CURRENT_USER_ID}
            />
          ) : (
            <ChatMessages
              activeProfile={null}
              messages={[]}
              newMessage=""
              onNewMessageChange={() => {}}
              onSendMessage={(e) => e.preventDefault()}
              formatTime={formatTime}
              onFindPartnersClick={() => navigate("/explore")}
              currentUserId={CURRENT_USER_ID}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Messaging
