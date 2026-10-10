import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      setAuth(true);
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

function Books() {
  const [books, setBooks] = React.useState([]);

  React.useEffect(() => {
    axios.get(`${API_URL}/books`).then(res => setBooks(res.data.items)).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Catálogo</h2>
      <ul>
        {books.map(b => (
          <li key={b.id}>{b.title} ({b.available_copies}/{b.total_copies} disp)</li>
        ))}
      </ul>
    </div>
  );
}

function Members() {
  const [members, setMembers] = React.useState([]);
  
  React.useEffect(() => {
    axios.get(`${API_URL}/members`).then(res => setMembers(res.data.items)).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Socios</h2>
      <ul>
        {members.map(m => (
          <li key={m.id}>{m.full_name} ({m.document_number})</li>
        ))}
      </ul>
    </div>
  );
}

function Loans() {
  return (
    <div>
      <h2>Préstamos</h2>
      <p>Módulo de préstamos y devoluciones</p>
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <div>
        <nav>
          <Link to="/">Login</Link> | <Link to="/books">Catálogo</Link> | <Link to="/members">Socios</Link> | <Link to="/loans">Préstamos</Link>
          {auth && <button onClick={() => { localStorage.clear(); setAuth(false); }}>Logout</button>}
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<Login setAuth={setAuth} />} />
          <Route path="/books" element={<Books />} />
          <Route path="/members" element={<Members />} />
          <Route path="/loans" element={<Loans />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
