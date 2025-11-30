import React, { useState } from 'react';
import { authAPI } from '../api';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const userData = await authAPI.login(username, password);
        onLogin(userData);
      } else {
        await authAPI.register(username, password);
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '100px' }}>
      <div className="card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#FF3399', 
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '1em'
            }}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;

