"use client"

import React, { useState } from 'react'
import { Message } from '../types/messaging'
import { ChatMessages } from '../components/messaging/ChatMessages'
import { ProfileModel } from '../data/ProfileModel'
import profileData from '../mockData/MockProfiles'
import { useParams } from 'react-router-dom'

// Temporary mock data for testing
const CURRENT_USER_ID = 1

export default function Messaging() {
  const { profileId } = useParams<{ profileId: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  // Find the active profile from the profileId in the URL
  const activeProfile = profileData.find(p => p.id === Number(profileId))

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && activeProfile) {
      const message: Message = {
        id: messages.length + 1,
        content: newMessage,
        senderId: CURRENT_USER_ID,
        receiverId: activeProfile.id,
        timestamp: new Date(),
        isRead: true
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1">
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
  )
}
