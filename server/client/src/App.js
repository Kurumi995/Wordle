import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authAPI } from './api';
import Login from './components/Login';
import UserPage from './components/UserPage';
import RoomPage from './components/RoomPage';
import GamePage from './components/GamePage';

function MainLayout({ currentUser, onLogout, onUserUpdate }) {
  const [currentPage, setCurrentPage] = useState('user');
  const navigate = useNavigate();

  return (
    <div className="container">
      <nav className="nav">
        <h1>Wordle Game</h1>
        <div className="nav-links">
          <button 
            className={currentPage === 'user' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('user');
              navigate('/');
            }}
          >
            User Info
          </button>
          <button 
            className={currentPage === 'rooms' ? 'active' : ''}
            onClick={() => {
              setCurrentPage('rooms');
              navigate('/rooms');
            }}
          >
            Rooms
          </button>
          <button onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<UserPage currentUser={currentUser} onUserUpdate={onUserUpdate} />} />
        <Route path="/rooms" element={<RoomPage currentUser={currentUser} />} />
        <Route path="/game" element={<GamePage currentUser={currentUser} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user.jwt) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <MainLayout 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
      />
    </Router>
  );
}

export default App;

