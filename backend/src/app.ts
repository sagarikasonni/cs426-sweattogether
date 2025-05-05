import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import profileRoutes from '../routes/profileRoutes'
import messageRoutes from '../routes/messageRoutes' // Import messageRoutes
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

// set up express app
const app = express()

// CORS + middleware setup
app.use(cors())
app.use(express.json())

// routing
app.use('/api/profiles', profileRoutes)
app.use('/api/messages', messageRoutes) // Register messageRoutes

// serving backend through frontend to have same origin, instead of separate ports
const frontendPath = path.join(__dirname, '../../front-end/dist')
app.use(express.static(frontendPath))

app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
})

// connecting mongodb
mongoose.connect(process.env.MONGODB_URI!)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection failed: ', err))

export default app