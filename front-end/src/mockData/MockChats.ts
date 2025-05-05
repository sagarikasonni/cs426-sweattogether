const mockChats: Record<number, { senderId: number; chatId: number; text: string; timestamp: Date }[]> = {
  1: [
    { senderId: 1, chatId: 1, text: 'Hey there!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { senderId: 0, chatId: 1, text: 'How are you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23) },
    { senderId: 1, chatId: 1, text: 'Pretty good!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22.5) },
    { senderId: 1, chatId: 1, text: 'How about you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20) },
  ],
  2: [
    { senderId: 0, chatId: 2, text: 'Hi John!', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { senderId: 2, chatId: 2, text: 'Long time no see.', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  ],
  3: [
    { senderId: 0, chatId: 3, text: 'Hello Bob! I saw you like hiking!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
    { senderId: 3, chatId: 3, text: 'I do! What about you?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ],
  // Profile 6 (Julie) has no messages yet
};

export default mockChats;