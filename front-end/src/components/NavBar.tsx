import { NavLink } from "react-router";

function NavBar() {
    return (
      <>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/profile" end>My Profile</NavLink>
        <NavLink to="/messaging">Chat</NavLink>
      </>
    )
  }
  
  export default NavBar