import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import SignOut from './SignOut';

/**
 * @definition Navbar
 * @params None
 * @returns JSX.Element
 * Navbar component for handling navigation and user authentication state (logged in or logged out).
 */
const Navbar: React.FC = () => {
  /**
   * @state token
   * @description State variable to store the authentication token from localStorage.
   * @default The value of 'token' from localStorage.
   */
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Adds an event listener to detect changes in localStorage and updates the token state accordingly.
   * Cleans up the event listener on component unmount.
   */
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

  /**
   * @definition handleSignOut
   * @params None
   * @returns None
   * Handles user sign-out by removing the token from localStorage and updating the token state.
   */
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
              `text-white px-4 py-2 rounded transition ease-in-out duration-150 ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/draw" 
            className={({ isActive }) => 
              `text-white px-4 py-2 rounded transition ease-in-out duration-150 ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
            }
          >
            Draw
          </NavLink>
        </li>

        {/* Conditionally render the Login/Signup link if no token is present */}
        {!token && (
          <li>
            <NavLink 
              to="/auth" 
              className={({ isActive }) => 
                `text-white px-4 py-2 rounded transition ease-in-out duration-150 ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
              }
            >
              Login / Signup
            </NavLink>
          </li>
        )}

        {/* Conditionally render the Race link and SignOut component if a token is present */}
        {token && (
          <>
            <li>
              <NavLink 
                to="/race" 
                className={({ isActive }) => 
                  `text-white px-4 py-2 rounded transition ease-in-out duration-150 ${isActive ? "bg-gray-700" : "hover:bg-gray-600"}`
                }
              >
                Race
              </NavLink>
            </li>
            <li className='text-white px-4 rounded hover:bg-gray-600'>
              <SignOut onSignOut={handleSignOut} />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
