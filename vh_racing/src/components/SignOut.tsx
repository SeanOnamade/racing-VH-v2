import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SignOutProps {
  onSignOut: () => void; // Callback function to handle sign out
}

const SignOut: React.FC<SignOutProps> = ({ onSignOut }) => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');

    // Notify Navbar that the user has signed out
    onSignOut();

    // Redirect user to login page
    navigate('/auth'); 
  };

  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
};

export default SignOut;
