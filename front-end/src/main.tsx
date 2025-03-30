import { JSX, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Authentication from './pages/Authentication.tsx'
import Explore from './pages/Explore.tsx'
import Messaging from './pages/Messaging.tsx'
import Profile from './pages/Profile.tsx'
import './styles.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from './context/AuthContext.tsx'

function ProtectedRoute({children} : {children: JSX.Element }) {
  const { isAuth } = useAuth()

  // if not authenticated, return to authentication page
  if (!isAuth) return <Navigate to ="/authentication"/>
  return children
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <Routes>
          {/* Make login page the landing page*/}
          <Route path="/" element= {
            <ProtectedRoute>
              <Explore/>
            </ProtectedRoute>
          }/>

          {/* Unprotected route: Upon Authentication -> Explore page */}
          <Route path="authentication" element= {<Authentication />}/>

          {/* Messaging routes */}
          <Route path="messaging" element={
            <ProtectedRoute>
              <Messaging/>
            </ProtectedRoute>
          }/>
          <Route path="messaging/:profileId" element={
            <ProtectedRoute>
              <Messaging/>
            </ProtectedRoute>
          }/>

          {/* Profile page routing */}
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>
          }/>
        </Routes>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
)