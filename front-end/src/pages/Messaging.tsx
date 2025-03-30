"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import NavBar from "../components/NavBar"
import profileData from "../mockData/MockProfiles"
import mockChats from "../mockData/MockChats"
import { ChatSidebar } from "../components/messaging/ChatSidebar"
import ChatMessages from "../components/messaging/ChatMessages"

const currentUserId = 0

function Messaging() {
  const { profileId } = useParams<{ profileId: string }>()
  const navigate = useNavigate()

  // Create a mapping of all profiles for chat
  const allChats = profileData.reduce(
    (acc, profile) => {
      acc[profile.id] = {
        id: profile.id,
        profile: {
          name: profile.name,
          image: profile.image,
        },
      }
      return acc
    },
    {} as { [key: number]: { id: number; profile: { name: string; image: string } } },
  )

  // const [activeConversationId, setActiveConversationId] = useState<number | null>(
  //   profileId ? Number(profileId) : null
  // );

  
  // Initialize with the profileId from URL or the first profile
  const initialChatId = profileId
    ? Number.parseInt(profileId)
    : Object.keys(allChats)[0]
      ? Number.parseInt(Object.keys(allChats)[0])
      : 1

  const [selectedChat, setSelectedChat] = useState<number>(initialChatId)
  const [messages, setMessages] = useState<{ senderId: number; text: string; timestamp: Date}[]>([])
  const [input, setInput] = useState("")

  // Update URL when selected chat changes
  useEffect(() => {
    navigate(`/messaging/${selectedChat}`)
  }, [selectedChat, navigate])

  // Load messages when selected chat changes
  useEffect(() => {
    // Check if chat exists in mockChats, otherwise set messages to an empty array
    const chatMessages = mockChats[selectedChat] || []
    setMessages(chatMessages)
  }, [selectedChat])

  const handleSend = () => {
    if (input.trim() && selectedChat !== undefined) {
      const newMessage = { senderId: currentUserId, text: input, timestamp: new Date() }
      setMessages((prevMessages) => [...prevMessages, newMessage])

      // Update mockChats to persist the message
      if (!mockChats[selectedChat]) {
        mockChats[selectedChat] = []
      }
      mockChats[selectedChat].push(newMessage)

      setInput("")
    }
  }

  const handleChatSelect = (id: number) => {
    setSelectedChat(id)
  }

  // const activeProfile = profileData.find(p => p.id === activeConversationId);

  return (
    <>
      <NavBar />
      <div className="flex h-screen">
        {/* ChatSidebar Component */}
        <ChatSidebar chats={Object.values(allChats)} selectedChat={selectedChat} handleChatSelect={handleChatSelect} />
        {/* ChatMessages Component */}
        <ChatMessages
          // activeProfile={activeProfile || null}
          messages={messages}
          chatProfile={allChats[selectedChat]?.profile}
          handleSend={handleSend}
          input={input}
          setInput={setInput}
          currentUserId={currentUserId}
        />
      </div>
    </>
  )
}

export default Messaging

