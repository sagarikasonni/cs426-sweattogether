# SweatTogether 

**SweatTogether** is a full-stack fitness and workout partner application developed for the CS426 Scalable Web Systems course at UMass Amherst. It helps users create fitness profiles, set goals, log activities, and find accountability through community messaging.

## Features

- **User Profiles**  
  Create and update your personalized fitness profile with age, gender, location, fitness level, and workout preferences.

- **Messaging System**  
  Chat with other users to find workout partners or stay motivated.

- **Authentication**  
  Secure signup and login using Passport.js and bcrypt.

- **Data Persistence**  
  All user data is stored in MongoDB Atlas and managed via a Node.js + Express backend.

---

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- FontAwesome Icons

### Backend
- Express.js
- MongoDB Atlas
- Mongoose
- Passport.js for authentication
- bcrypt for password hashing

### Dev Tools
- Docker (optional for deployment)
- Postman (for API testing)
- VSCode

---

<img width="1440" height="900" alt="Image" src="https://github.com/user-attachments/assets/3a7eb0dc-0fee-414e-8166-4d814f28b7d0" />
<img width="1440" height="900" alt="Image" src="https://github.com/user-attachments/assets/e15c9c42-600a-44d4-b637-debed5cabcfe" />
<img width="1440" height="900" alt="Image" src="https://github.com/user-attachments/assets/e638e72f-e67c-45ae-a05b-f535184d3a26" />
(ezgif-2b16ab8ae30c51.gif)

## Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/sweattogether.git
cd sweattogether
cd backend
npm install 
cd ../frontend
npm install
# In the backend add a .env
MONGODB_URI=mongodb+srv://mfoley:1234@sweattogether.izltv7y.mongodb.net/sweattogether?retryWrites=true&w=majority&appName=SweatTogether
PORT=4000
# Terminal 1
cd backend
npm run dev
# Terminal 2
cd frontend
npm run dev
# Docker 
docker-compose up --build
```
