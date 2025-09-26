import ws from 'k6/ws';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    websocket_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 200 },   // warm-up
        { duration: '1m', target: 1000 },   // ramp up
        { duration: '2m', target: 1000 },   // hold
        { duration: '30s', target: 0 },     // ramp down
      ],
      gracefulStop: '30s',
    },
  },
  thresholds: {
    ws_connecting: ['p(95)<1000'],
    ws_msgs_received: ['count>0'],
  },
};

const WS_URL = 'ws://127.0.0.1:4000/socket.io/?EIO=4&transport=websocket';

export default function () {
  const chatId = `chat-${Math.floor(Math.random() * 10) + 1}`;
  const userId = `user-${Math.floor(Math.random() * 100) + 1}`;
  
  let messageReceived = false;
  let connectionTime = 0;
  let messageRoundTrip = 0;

  ws.connect(WS_URL, {}, function (socket) {
    const connectStart = Date.now();
    
    socket.on('open', function () {
      connectionTime = Date.now() - connectStart;
      
      // Join a chat room
      socket.send(JSON.stringify({
        event: 'joinChat',
        data: chatId
      }));
      
      // Wait a bit then send a message
      setTimeout(() => {
        const messageStart = Date.now();
        const testMessage = {
          event: 'sendMessage',
          data: {
            chatId: chatId,
            message: {
              senderId: userId,
              text: `WebSocket test message ${Date.now()}`,
              timestamp: new Date().toISOString()
            }
          }
        };
        
        socket.send(JSON.stringify(testMessage));
        
        // Set up message listener
        socket.on('message', function (msg) {
          try {
            const data = JSON.parse(msg);
            if (data.event === 'newMessage') {
              messageReceived = true;
              messageRoundTrip = Date.now() - messageStart;
              
              // Log performance data
              console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                connection_time: connectionTime,
                message_roundtrip: messageRoundTrip,
                chat_id: chatId,
                user_id: userId
              }));
              
              socket.close();
            }
          } catch (e) {
            // Handle non-JSON messages (like Socket.IO handshake)
          }
        });
      }, 100);
    });

    socket.on('error', function (e) {
      console.error('WebSocket error:', e);
      socket.close();
    });

    socket.on('close', function () {
      // Test completed
    });
  });

  sleep(2);
}
