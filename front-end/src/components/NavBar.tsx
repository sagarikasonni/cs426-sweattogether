import { NavLink } from "react-router";

function NavBar() {
    const navLinks = [
        { to: "/", label: "Home", end: true },
        { to: "/profile", label: "My Profile", end: true },
        { to: "/messaging", label: "Chat" }
    ];

    return (
        <nav className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
            <h1 className="text-white text-lg font-bold">SweatTogether</h1>
            <ul className="flex space-x-6 text-white font-medium">
                {navLinks.map(({ to, label, end }) => (
                    <li key={to}>
                        <NavLink 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => isActive ? "text-gray-200" : "hover:text-gray-200"}
                        >
                            {label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default NavBar;
