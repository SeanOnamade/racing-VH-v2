import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';  // You can style your navbar using CSS
import SignOut from './SignOut';  


const Navbar: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token')); // State to manage token

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token')); // Update state when token changes
    };

    // Add event listener to handle localStorage changes
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange); // Cleanup listener on component unmount
    };
  }, []);

  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/ethan" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Ethan's Page
          </NavLink>
        </li>

        {/* Show Signup and Login only when the user is not logged in */}
        {!token && (
          <>
            <li>
              <NavLink 
                to="/signup" 
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Signup
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/login" 
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Login
              </NavLink>
            </li>
          </>
        )}

        {/* Show other links and SignOut button only when the user is logged in */}
        {token && (
          <>
            <li>
              <NavLink 
                to="/zander" 
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Zander's Page
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/ethan/validTrack" 
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Valid Track
              </NavLink>
            </li>
            <li>
              <SignOut onSignOut={() => setToken(null)} /> {/* Pass the function to update state on sign-out */}
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
