import React, {createContext, useContext, useState} from "react";

interface AuthContextType {
    isAuth: boolean
    setIsAuth: (auth: boolean) => void
}

const AuthContext = createContext<AuthContextType>({
    isAuth: false,
    setIsAuth: () => {}
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({children} : {children: React.ReactNode}) => {
    const [isAuth, setIsAuth] = useState(false)

    return (
        <AuthContext.Provider value={ {isAuth, setIsAuth }}>
            {children}
        </AuthContext.Provider>
    )
}