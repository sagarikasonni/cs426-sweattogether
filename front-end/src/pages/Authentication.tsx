import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"

function Authentication() {
    const { isAuth, setIsAuth } = useAuth()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuth) {
            navigate("/")
        }
    }, [isAuth, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("Please fill in all fields")
            return
        }

        // Check to be a valid email
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address")
            return
        }

        // Password has to be greater than 6 characters 
        if (password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        // TODO: Curretly using mock users only -> implement actual backend logic
        // const user = MockUsers.find(
        //     (user) => user.email == email && user.password == password
        // )

        console.log(isLogin ? "Logging in..." : "Signing up...", { email, password })

        // I have to check if the user info exists for either login or signup, cause I don't want duplicates
        // can check if email is registered and then also if password,
        // one account per email
        // try to get this done by meeting on Thursday, so I can create a pr

        if(!isLogin){
            //signing up
            try {
                // check if email is already registered
                const checkRes = await fetch('http://localhost:4000/api/login/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  })
                  const { exists } = await checkRes.json()
                  if (exists) {
                    setError("Email is already registered")
                    return
                }
                // if not, continue to signup, add user to db
                const res = await fetch('http://localhost:4000/api/login/signup', {
                  method: 'POST',
                  headers: { 'Content-type':'application/json' },
                  body: JSON.stringify({email, password}),
                })
                if (res.ok) {
                  //const savedLogin = await res.json()
                  //console.log('Login saved: ', savedLogin)
                  alert('Login saved successfully')
                }
                else {
                  alert('Failed to save username and password, please try again!')
                }
              }
              catch (err) {
                console.error('Error: ', err)
                alert('Error connecting to server')
              }
            }else{
                // login-in logic
                try {
                    const res = await fetch('http://localhost:4000/api/login/authenticate', {
                        method: 'POST',
                        headers: { 'Content-type':'application/json' },
                        body: JSON.stringify({ email, password })
                      })
                    if (res.ok) {
                      //const savedLogin = await res.json()
                      //console.log('Login retrieved: ', savedLogin)
                      alert('Login retrieved successfully')
                      setIsAuth(true)
                      console.log("Authentication successful!")
                      navigate("/")
                    }
                    else {
                        setError("Invalid email or password")
                        alert("Invalid email or password")
                    }
                  }
                  catch (err) {
                    console.error('Error: ', err)
                    setError("Authentication failed. Please try again.")
                    alert('Error connecting to server')
                }
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <div className="flex justify-center">
                    <img src={logo} alt="App Logo" className="w-20 h-20 mb-4" />
                </div>
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLogin ? "Login" : "Sign Up"}
                </h2>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>
                <div className="mt-6">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full text-center text-blue-500 hover:underline focus:outline-none"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => console.log("Continue with Google")}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <img
                                src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
                                alt="Google Logo"
                                className="w-5 h-5 mr-2"
                            />
                            Google
                        </button>
                        <button
                            onClick={() => console.log("Continue with GitHub")}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <img
                                src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                                alt="GitHub Logo"
                                className="w-5 h-5 mr-2"
                            />
                            GitHub
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Authentication
