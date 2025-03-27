import { ProfileModel } from '../data/ProfileModel'

export interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  timestamp: Date
  isRead: boolean
}

export interface Conversation {
  id: number
  participants: ProfileModel[]
  messages: Message[]
  lastMessage?: Message
  unreadCount: number
} 