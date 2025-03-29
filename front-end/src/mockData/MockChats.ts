const mockChats: Record<number, { senderId: number; text: string }[]> = {
  1: [
    { senderId: 1, text: 'Hey there!' },
    { senderId: 0, text: 'How are you?' },
    { senderId: 1, text: 'Pretty good!' },
    { senderId: 1, text: 'How about you?' },
  ],
  2: [
    { senderId: 0, text: 'Hi John!' },
    { senderId: 2, text: 'Long time no see.' },
  ],
  3: [
    { senderId: 0, text: 'Hello Bob! I saw you like hiking!' },
    { senderId: 3, text: 'What’s up?' },
  ],
};

export default mockChats;
