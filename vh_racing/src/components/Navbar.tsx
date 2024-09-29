import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';  // You can style your navbar using CSS

const Navbar: React.FC = () => {
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
      </ul>
    </nav>
  );
};

export default Navbar;
