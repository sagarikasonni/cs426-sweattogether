import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Explore from './pages/Explore.tsx'
import Messaging from './pages/Messaging.tsx'
import Profile from './pages/Profile.tsx'
import './styles.css'
import { BrowserRouter, Routes, Route } from "react-router";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="messaging" element={<Messaging />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </StrictMode>
  </BrowserRouter>
  ,
)