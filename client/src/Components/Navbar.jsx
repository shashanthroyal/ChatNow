import React from 'react'
import { useState , useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';


function Navbar() {

  const [username , setUsername] = useState(null)
  const navigate = useNavigate()
  const location = useLocation();

  useEffect(() => {
    
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);

    const handleStorageChange = () => {
      const updatedUsername = localStorage.getItem("username");
      setUsername(updatedUsername);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);
   
   const handleLogout = () =>{
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("id");
            setUsername(null);
            navigate('/login')
   }
    
  
  const handleSidebarToggle = () => {
    window.dispatchEvent(new Event('toggleSidebar'));
  };

  return (
    <div className="navbar">
    {username ? (
      <button className="sidebar-toggle" onClick={handleSidebarToggle} aria-label="Toggle sidebar">
        <span className="sidebar-toggle-bar"></span>
        <span className="sidebar-toggle-bar"></span>
        <span className="sidebar-toggle-bar"></span>
      </button>
    ) : (
      <span className="navbar-hello-text">Hello</span>
    )}
      <div className="navbar-brand">
        <img src={"/chatnow-logo.png"} alt="ChatNow Logo" />
        <h2><span>hat</span> Now</h2>
      </div>
      <div className="navbar-links">
        {username ? (
          <div className="navbar-user-info">
            <p>Hello, {username}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="navbar-auth-links">
            <Link to="/login">Login</Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
