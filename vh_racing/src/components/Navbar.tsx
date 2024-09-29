import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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

  const handleSignOut = () => {
    localStorage.removeItem('token');  // Remove the token from localStorage
    setToken(null);  // Update state to reflect that user is logged out
  };

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `text-white px-4 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/ethan" 
            className={({ isActive }) => 
              `text-white px-4 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
            }
          >
            Ethan's Page
          </NavLink>
        </li>

        {!token && (
          <li>
            <NavLink 
              to="/auth" 
              className={({ isActive }) => 
                `text-white px-4 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
              }
            >
              Login / Signup
            </NavLink>
          </li>
        )}

        {token && (
          <>
            <li>
              <NavLink 
                to="/zander" 
                className={({ isActive }) => 
                  `text-white px-4 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
                }
              >
                Zander's Page
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/ethan/validTrack" 
                className={({ isActive }) => 
                  `text-white px-4 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
                }
              >
                Valid Track
              </NavLink>
            </li>
            <li>
              <SignOut onSignOut={handleSignOut} />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
