import dotenv from 'dotenv'
import app from './app'
import { createServer } from 'http'
import { initializeSocket } from './services/socketService'

dotenv.config()

const PORT = process.env.PORT || 4000
const httpServer = createServer(app)

// Initialize Socket.IO
initializeSocket(httpServer)

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})