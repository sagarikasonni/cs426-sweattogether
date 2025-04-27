import mongoose from "mongoose"

const userProfileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    image: { type: String },
    location: {
        city: { type: String },
        state: { type: String },
        country: { type: String, required: true },
        zip_code: { type: String, required: true }
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'], 
        required: true
    },
    workout_preferences: [{
        type: String,
        enum: ['Balance exercises', 'Calisthenics', 'CrossFit', 'Dancing', 'Hiking', 
        'Pilates', 'Running', 'Walking', 'Yoga', 'Boxing', 'Circuit training', 
        'Cycling', 'HIIT', 'Jogging', 'Rock Climbing', 'Swimming', 'Weightlifting', 'Other'] 
    }],
    bio: { type: String }
}, { timestamps: true })

export default mongoose.model('UserProfile', userProfileSchema, 'profiles')