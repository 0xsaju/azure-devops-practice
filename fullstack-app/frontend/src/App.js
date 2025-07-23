// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    }
  }, []);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
  });

  const fetchUser = async (authToken) => {
    try {
      const res = await api.get('/api/user', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  const handleRegister = async () => {
    try {
      await api.post('/api/register', { email, password });
      setMessage('Verification email sent. Please check your inbox.');
    } catch (err) {
      setMessage('Registration failed: ' + err.response.data.message);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await api.post('/api/login', { email, password });
      const { token: newToken } = res.data;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      fetchUser(newToken);
      setMessage('Login successful');
    } catch (err) {
      setMessage('Login failed: ' + err.response.data.message);
    }
  };

  const handleVerify = async () => {
    try {
      await api.get(`/api/verify?token=${token}`);
      setMessage('Email verified successfully');
    } catch (err) {
      setMessage('Verification failed: ' + err.response.data.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    setMessage('Logged out');
  };

  if (user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">User Authentication</h1>
      
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      <div className="mb-4">
        <button 
          onClick={handleRegister}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Register
        </button>
      </div>
      
      <div className="mb-4">
        <button 
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
      
      {token && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Verification Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-2"
          />
          <button 
            onClick={handleVerify}
            className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Verify Email
          </button>
        </div>
      )}
      
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          {message}
        </div>
      )}
    </div>
  );
}

export default App;