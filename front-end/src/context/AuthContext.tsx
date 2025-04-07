import React, {createContext, useContext, useState, useEffect} from "react";

interface AuthContextType {
    isAuth: boolean
    setIsAuth: (auth: boolean) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({
    isAuth: false,
    setIsAuth: () => {},
    logout: () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({children} : {children: React.ReactNode}) => {

    const [isAuth, setIsAuth] = useState(() => {
        const storedAuth = localStorage.getItem('isAuth')
        return storedAuth ? JSON.parse(storedAuth) : false
    })

    const logout = () => {
        setIsAuth(false)
        localStorage.removeItem('isAuth')
    }

    useEffect(() => {
        localStorage.setItem('isAuth', JSON.stringify(isAuth))
    }, [isAuth])

    return (
        <AuthContext.Provider value={{ isAuth, setIsAuth, logout }}>
            {children}
        </AuthContext.Provider>
    )
}