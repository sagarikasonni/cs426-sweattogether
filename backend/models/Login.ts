import mongoose from "mongoose"

const userLoginSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
})

export default mongoose.model('UserLogin', userLoginSchema, 'login')