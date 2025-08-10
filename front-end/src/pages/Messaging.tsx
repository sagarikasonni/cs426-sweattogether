"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import NavBar from "../components/NavBar"
import profileData from "../../../mockData/MockProfiles"
import mockChats from "../../../mockData/MockChats"
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

  const [chatPreviews, setChatPreviews] = useState<{
    chatId: number;
    senderId: number;
    text: string;
    timestamp: Date;
  }[]>([]);
  
  // Add this useEffect to load chat previews
  useEffect(() => {
    // Fetch chat previews from backend
    fetch('http://localhost:4000/api/messages/previews')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Chat previews loaded:', data);
        
        // Convert string timestamps to Date objects
        const previewsWithDates = data.map((preview: any) => ({
          ...preview,
          timestamp: new Date(preview.timestamp)
        }));
        
        // Update mockChats with the latest messages from the backend
        previewsWithDates.forEach((preview: any) => {
          if (!mockChats[preview.chatId]) {
            mockChats[preview.chatId] = [];
          }
          
          // Add the message if it doesn't exist
          const exists = mockChats[preview.chatId].some(
            msg => msg.text === preview.text && msg.senderId === preview.senderId
          );
          
          if (!exists) {
            mockChats[preview.chatId].push({
              senderId: preview.senderId,
              chatId: preview.chatId,
              text: preview.text,
              timestamp: preview.timestamp // Already converted to Date above
            });
          }
        });
        
        // Update activeChatIds
        const chatIds = Object.keys(mockChats)
          .map(id => Number(id))
          .filter(id => mockChats[id] && mockChats[id].length > 0)
          .sort((a, b) => b - a);
        
        setActiveChatIds(chatIds);
        setChatPreviews(previewsWithDates); // Use the converted dates
      })
      .catch(error => {
        console.error('Error loading chat previews:', error);
      });
  }, []);

  const [selectedChat, setSelectedChat] = useState<number>(getInitialChatId())
  const [messages, setMessages] = useState<{ senderId: number; chatId: number; text: string; timestamp: Date }[]>([]);
  const [input, setInput] = useState("")
  const [activeChatIds, setActiveChatIds] = useState<number[]>([])

  // Update URL when selected chat changes, but prevent scrolling
  useEffect(() => {
    if (prevProfileIdRef.current !== profileId) {
      navigate(`/messaging/${selectedChat}`, { replace: true })
      prevProfileIdRef.current = String(selectedChat)
    }
  }, [selectedChat, navigate, profileId])

  // Load messages when selected chat changes
  useEffect(() => {
    if (selectedChat !== undefined) {
      // Fetch all messages for the selected chat from the backend
      fetch(`http://localhost:4000/api/messages/${selectedChat}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch messages: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('Fetched messages:', data);
          setMessages(data); // Update the messages state with the fetched data
        })
        .catch((error) => {
          console.error('Error fetching messages:', error);
        });
    }
  }, [selectedChat]);

  const handleSend = async () => {
    if (input.trim() && selectedChat !== undefined) {
      const newMessage = {
        senderId: currentUserId,
        chatId: selectedChat,
        text: input,
        timestamp: new Date(),
      }

      // Update the UI immediately
      setMessages((prevMessages) => [...prevMessages, newMessage])

      try {
        // Send the message to the backend
        const response = await fetch("http://localhost:4000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMessage),
        })

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status}`)
        }

        const savedMessage = await response.json()
        console.log("Message saved to database:", savedMessage)

        // Update chatPreviews immediately
        setChatPreviews((prevPreviews) => {
          const existingPreviewIndex = prevPreviews.findIndex((preview) => preview.chatId === selectedChat)

          const updatedPreview = {
            chatId: selectedChat,
            senderId: currentUserId,
            text: input,
            timestamp: new Date(),
          }

          let updatedPreviews;
          if (existingPreviewIndex !== -1) {
            // Update the existing preview
            updatedPreviews = [...prevPreviews]
            updatedPreviews[existingPreviewIndex] = updatedPreview
          } else {
            // Add a new preview for the new chat
            updatedPreviews = [updatedPreview, ...prevPreviews]
          }

          // Sort by timestamp (newest first)
          return updatedPreviews.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        })

        // Update activeChatIds if this is a new chat
        setActiveChatIds((prevIds) => {
          if (!prevIds.includes(selectedChat)) {
            return [selectedChat, ...prevIds]
          }
          return prevIds
        })
      } catch (error) {
        console.error("Error sending message:", error)
      }

      // Reset the input field
      setInput("")
    }
  };

  const handleChatSelect = (id: number) => {
    // Prevent scrolling by using replace instead of push
    setSelectedChat(id)
  }

  // Filter chats to only show those with messages
  const activeChats = activeChatIds.map((id) => allChats[id]).filter(Boolean)

  return (
    <>
      <NavBar />
      <div className="flex">
        {/* ChatSidebar Component */}
        <ChatSidebar 
          chats={activeChats} 
          selectedChat={selectedChat} 
          handleChatSelect={handleChatSelect} 
          currentUserId={currentUserId}
          chatPreviews={chatPreviews} // Add this prop
        />        {/* ChatMessages Component */}
        <ChatMessages
          // activeProfile={activeProfile || null}
          messages={messages}
          chatProfile={allChats[selectedChat]?.profile}
          handleSend={handleSend}
          input={input}
          setInput={setInput}
          currentUserId={currentUserId}
          selectedChat={selectedChat}
        />
      </div>
    </>
  )
}

export default Messaging

