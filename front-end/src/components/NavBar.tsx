import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function NavBar() {
    const { isAuth, setIsAuth } = useAuth()
    const navigate = useNavigate()

    const navLinks = [
        { to: "/", label: "Home", end: true },
        { to: "/profile", label: "My Profile", end: true },
        { to: "/messaging", label: "Chat", end: true },
        {
            to: isAuth ? "#" : "/authentication",
            label: isAuth ? "Sign Out" : "Sign In",
            end: true
        }
    ];

    const handleSignOut = () => {
        setIsAuth(false)
        localStorage.removeItem("isAuth")
        navigate("/")
    }

    return (
        <nav className="bg-gray-800 p-4 shadow-md flex flex-col md:flex-row justify-between items-center">
            <NavLink to="/" className="text-white text-lg font-bold hover:text-gray-200">
                SweatTogether
            </NavLink>
            <ul className="flex space-x-5 text-white font-medium">
                {navLinks.map(({ to, label, end }) => (
                    <li key={label}> 
                        {label === "Sign Out" ? (
                            <button
                                onClick={handleSignOut}
                                className="text-white hover:text-gray-200 cursor-pointer"
                            >
                                {label}
                            </button>
                        ) : (
                            <NavLink 
                                to={to} 
                                end={end} 
                                className={({ isActive }) => 
                                    isActive ? "text-blue-400" : "text-white hover:text-gray-200"
                                }
                            >
                                {label}
                            </NavLink>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default NavBar;
