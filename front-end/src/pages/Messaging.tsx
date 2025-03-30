"use client"

import { useState, useEffect, useRef } from "react"
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
  const prevProfileIdRef = useRef<string | undefined>(profileId)

  // Create a mapping of all profiles for chat
  const allChats = profileData.reduce(
    (acc, profile) => {
      acc[profile.id] = {
        id: profile.id,
        profile: {
          name: profile.name,
          image: profile.image || "/placeholder.svg?height=200&width=200",
        },
      }
      return acc
    },
    {} as { [key: number]: { id: number; profile: { name: string; image: string } } },
  )

  // Initialize with the profileId from URL or the first profile with messages
  const getInitialChatId = () => {
    if (profileId) {
      return Number.parseInt(profileId)
    }

    // Find profiles with existing chats
    const profilesWithChats = Object.keys(mockChats)
    if (profilesWithChats.length > 0) {
      return Number.parseInt(profilesWithChats[0])
    }

    // Fallback to first profile
    return Object.keys(allChats)[0] ? Number.parseInt(Object.keys(allChats)[0]) : 1
  }

  const [selectedChat, setSelectedChat] = useState<number>(getInitialChatId())
  const [messages, setMessages] = useState<{ senderId: number; text: string, timestamp: Date }[]>([])
  const [input, setInput] = useState("")
  const [activeChatIds, setActiveChatIds] = useState<number[]>([])

  // Update active chat IDs when mockChats changes
  useEffect(() => {
    const chatIds = Object.keys(mockChats)
      .map((id) => Number(id))
      .filter((id) => mockChats[id] && mockChats[id].length > 0)
      .sort((a, b) => {
        // Sort by most recent message
        const aLastMsg = mockChats[a][mockChats[a].length - 1]
        const bLastMsg = mockChats[b][mockChats[b].length - 1]
        // If we had timestamps, we'd use them here
        // For now, just assume the order in the array
        return b - a
      })

    setActiveChatIds(chatIds)
  }, [mockChats])

  // Update URL when selected chat changes, but prevent scrolling
  useEffect(() => {
    if (prevProfileIdRef.current !== profileId) {
      navigate(`/messaging/${selectedChat}`, { replace: true })
      prevProfileIdRef.current = String(selectedChat)
    }
  }, [selectedChat, navigate, profileId])

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

      // If this is a new chat, add it to the active chats at the top
      if (!activeChatIds.includes(selectedChat)) {
        setActiveChatIds([selectedChat, ...activeChatIds])
      } else {
        // Move this chat to the top (most recent)
        setActiveChatIds([selectedChat, ...activeChatIds.filter((id) => id !== selectedChat)])
      }

      setInput("")
    }
  }

  const handleChatSelect = (id: number) => {
    // Prevent scrolling by using replace instead of push
    setSelectedChat(id)
  }

  // Filter chats to only show those with messages
  const activeChats = activeChatIds.map((id) => allChats[id]).filter(Boolean)

  // const activeProfile = profileData.find(p => p.id === activeConversationId);

  return (
    <>
      <NavBar />
      <div className="flex h-screen">
        {/* ChatSidebar Component */}
        <ChatSidebar chats={activeChats} selectedChat={selectedChat} handleChatSelect={handleChatSelect} />
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

