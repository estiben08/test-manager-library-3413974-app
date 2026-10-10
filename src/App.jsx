import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = Bearer ;
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
      const res = await axios.post(${API_URL}/auth/login, { username, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      setAuth(true);
      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Error de autenticación');
    }
  };

  return (
    <div className="card">
      <h2>Iniciar Sesión</h2>
      {error && <div className="badge badge-danger" style={{display: 'inline-block', marginBottom: '1rem', padding: '0.5rem 1rem'}}>{error}</div>}
      <form onSubmit={handleLogin}>
        <input placeholder="Usuario (ej. admin o bibliotecario)" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

function Books() {
  const [books, setBooks] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [q, setQ] = useState('');
  const role = localStorage.getItem('role');
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [message, setMessage] = useState(null);

  const fetchBooks = () => axios.get(${API_URL}/books, { params: { q } }).then(res => setBooks(res.data.items)).catch(console.error);

  React.useEffect(() => {
    fetchBooks();
    if (role === 'admin') {
      axios.get(${API_URL}/categories).then(res => setCategories(res.data)).catch(console.error);
    }
  }, [role, q]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post(${API_URL}/books, {
        title, author, isbn, category_id: categoryId, total_copies: parseInt(totalCopies)
      });
      setMessage({ type: 'success', text: 'Libro registrado exitosamente' });
      setTitle(''); setAuthor(''); setIsbn(''); setCategoryId(''); setTotalCopies(1);
      fetchBooks();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error al registrar libro' });
    }
  };

  return (
    <div>
      <h2>Catálogo de Libros</h2>
      
      {role === 'admin' && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3>Registrar Nuevo Libro</h3>
          {message && (
            <div className={adge badge-} style={{display: 'block', padding: '1rem', marginBottom: '1rem'}}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleCreateBook} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} required />
            <input placeholder="Autor" value={author} onChange={e => setAuthor(e.target.value)} required />
            <input placeholder="ISBN (13 dígitos)" value={isbn} onChange={e => setIsbn(e.target.value)} required />
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value="">-- Categoría --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" min="1" placeholder="Copias Totales" value={totalCopies} onChange={e => setTotalCopies(e.target.value)} required />
            <button type="submit" style={{gridColumn: '1 / -1'}}>Registrar Libro</button>
          </form>
        </div>
      )}

      <div style={{marginBottom: '1.5rem'}}>
        <input 
          type="text" 
          placeholder="Buscar por título o autor..." 
          value={q} 
          onChange={e => setQ(e.target.value)}
          style={{maxWidth: '400px'}}
        />
      </div>

      <ul>
        {books.map(b => (
          <li key={b.id} className="item-card">
            <div>
              <strong>{b.title}</strong>
              <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                {b.author || 'Sin autor'} - ISBN: {b.isbn}
              </div>
            </div>
            <span className={b.available_copies > 0 ? "badge badge-success" : "badge badge-danger"}>
              {b.available_copies} / {b.total_copies} Disp.
            </span>
          </li>
        ))}
        {books.length === 0 && <p style={{color: 'var(--text-muted)'}}>No hay libros en el catálogo.</p>}
      </ul>
    </div>
  );
}

function Members() {
  const [members, setMembers] = React.useState([]);
  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [message, setMessage] = useState(null);
  
  const fetchMembers = () => axios.get(${API_URL}/members).then(res => setMembers(res.data.items)).catch(console.error);

  React.useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(${API_URL}/members, {
        full_name: fullName,
        document_number: documentNumber
      });
      setMessage({ type: 'success', text: 'Socio registrado exitosamente' });
      setFullName('');
      setDocumentNumber('');
      fetchMembers();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error al registrar socio' });
    }
  };

  return (
    <div>
      <h2>Directorio de Socios</h2>
      
      <div className="card" style={{marginBottom: '2rem'}}>
        <h3>Registrar Nuevo Socio</h3>
        {message && (
          <div className={adge badge-} style={{display: 'block', padding: '1rem', marginBottom: '1rem'}}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleCreateMember} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
          <input placeholder="Nombre completo" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <input placeholder="Número de documento" value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} required />
          <button type="submit" style={{gridColumn: '1 / -1'}}>Registrar Socio</button>
        </form>
      </div>

      <ul>
        {members.map(m => (
          <li key={m.id} className="item-card">
            <div>
              <strong>{m.full_name}</strong>
              <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Doc: {m.document_number}</div>
            </div>
          </li>
        ))}
        {members.length === 0 && <p style={{color: 'var(--text-muted)'}}>No hay socios registrados.</p>}
      </ul>
    </div>
  );
}

function Loans() {
  const [loans, setLoans] = React.useState([]);
  const [books, setBooks] = React.useState([]);
  const [members, setMembers] = React.useState([]);
  const [selectedMember, setSelectedMember] = React.useState('');
  const [selectedBook, setSelectedBook] = React.useState('');
  const [message, setMessage] = React.useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLoans = () => axios.get(${API_URL}/loans, { params: { status: statusFilter } }).then(res => setLoans(res.data.items)).catch(console.error);
  
  React.useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  React.useEffect(() => {
    axios.get(${API_URL}/books).then(res => setBooks(res.data.items)).catch(console.error);
    axios.get(${API_URL}/members).then(res => setMembers(res.data.items)).catch(console.error);
  }, []);

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    try {
      await axios.post(${API_URL}/loans, {
        member_id: selectedMember,
        items: [{ book_id: selectedBook }]
      });
      setMessage({ type: 'success', text: 'Préstamo creado exitosamente' });
      fetchLoans();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error al crear préstamo' });
    }
  };

  const handleReturn = async (loanId, itemId) => {
    try {
      await axios.post(${API_URL}/loans//items//return, {});
      setMessage({ type: 'success', text: 'Libro devuelto con éxito' });
      fetchLoans();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error al devolver' });
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Préstamos Activos</h2>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{maxWidth: '200px'}}>
          <option value="">Todos los préstamos</option>
          <option value="open">Abiertos</option>
          <option value="overdue">Vencidos</option>
          <option value="closed">Cerrados</option>
        </select>
      </div>
      
      {message && (
        <div className={adge badge-} style={{display: 'block', padding: '1rem', marginBottom: '1.5rem'}}>
          {message.text}
        </div>
      )}
      
      <div className="card">
        <h3>Nuevo Préstamo</h3>
        <form onSubmit={handleCreateLoan}>
          <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} required>
            <option value="">-- Seleccionar Socio --</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
          <select value={selectedBook} onChange={e => setSelectedBook(e.target.value)} required>
            <option value="">-- Seleccionar Libro --</option>
            {books.filter(b => b.available_copies > 0).map(b => (
              <option key={b.id} value={b.id}>{b.title} ({b.available_copies} disponibles)</option>
            ))}
          </select>
          <button type="submit">Registrar Préstamo</button>
        </form>
      </div>

      <div style={{display: 'grid', gap: '1rem'}}>
        {loans.map(loan => {
          const memberName = members.find(m => m.id === loan.member_id)?.full_name || 'Socio Desconocido';
          const dateStr = loan.loaned_at ? new Date(loan.loaned_at).toLocaleDateString() : 'Fecha Inválida';
          
          return (
            <div key={loan.id} className="card" style={{marginBottom: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                <strong>{memberName} <span className="badge" style={{marginLeft:'10px'}}>{loan.status}</span></strong>
                <span style={{color: 'var(--text-muted)'}}>{dateStr}</span>
              </div>
              
              <ul style={{gap: '0.5rem'}}>
                {loan.items.map(item => {
                  const isOverdue = !item.returned_at && new Date(item.due_at) < new Date();
                  return (
                    <li key={item.id} className="item-card" style={{padding: '0.5rem 1rem'}}>
                      <div>
                        {item.book_title}
                        {item.returned_at ? (
                           <span className="badge badge-success" style={{marginLeft: '10px'}}>Devuelto</span>
                        ) : isOverdue ? (
                           <span className="badge badge-danger" style={{marginLeft: '10px'}}>Vencido</span>
                        ) : (
                           <span className="badge" style={{background: '#F3F4F6', marginLeft: '10px', color: '#111'}}>Activo</span>
                        )}
                      </div>
                      
                      {!item.returned_at && (
                        <button onClick={() => handleReturn(loan.id, item.id)} style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem'}}>
                          Devolver
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
        {loans.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>No hay préstamos registrados.</p>}
      </div>
    </div>
  );
}

function Overdue() {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    axios.get(${API_URL}/loans/overdue).then(res => setItems(res.data.items)).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Vencidos Globales</h2>
      <ul>
        {items.map(item => (
          <li key={item.item_id} className="item-card">
            <div>
              <strong>{item.book_title}</strong>
              <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Socio: {item.member_name}</div>
            </div>
            <span className="badge badge-danger">
              {item.days_late} días de retraso
            </span>
          </li>
        ))}
        {items.length === 0 && <p style={{color: 'var(--text-muted)'}}>No hay libros vencidos.</p>}
      </ul>
    </div>
  );
}

function Users() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(${API_URL}/users, { username, password, role: 'librarian' });
      setMessage({ type: 'success', text: 'Bibliotecario creado exitosamente' });
      setUsername('');
      setPassword('');
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error al crear usuario' });
    }
  };

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      {message && (
        <div className={adge badge-} style={{display: 'block', padding: '1rem', marginBottom: '1.5rem'}}>
          {message.text}
        </div>
      )}
      <div className="card">
        <h3>Crear Bibliotecario</h3>
        <p style={{color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem'}}>Solo los administradores pueden crear nuevas cuentas de bibliotecarios.</p>
        <form onSubmit={handleCreateUser}>
          <input placeholder="Nombre de usuario" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">Crear Cuenta</button>
        </form>
      </div>
    </div>
  );
}

function Reports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState(null);

  const handleFetchReport = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(${API_URL}/reports/most-borrowed, { params: { from, to } });
      setRows(res.data.rows);
      setMessage(null);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Error al cargar el reporte' });
      setRows([]);
    }
  };

  return (
    <div>
      <h2>Reportes (Admin)</h2>
      <div className="card" style={{marginBottom: '2rem'}}>
        <h3>Libros más prestados</h3>
        {message && (
          <div className={adge badge-} style={{display: 'block', padding: '1rem', marginBottom: '1rem'}}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleFetchReport} style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end'}}>
          <div>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Desde</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} required />
          </div>
          <div>
            <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem'}}>Hasta</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} required />
          </div>
          <button type="submit" style={{height: '42px'}}>Generar</button>
        </form>
      </div>

      {rows.length > 0 && (
        <div className="card">
          <table style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '1px solid #E5E7EB'}}>
                <th style={{padding: '0.75rem'}}>Libro</th>
                <th style={{padding: '0.75rem'}}>Categoría</th>
                <th style={{padding: '0.75rem'}}>Préstamos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.book_id} style={{borderBottom: '1px solid #F3F4F6'}}>
                  <td style={{padding: '0.75rem'}}>{row.book_title}</td>
                  <td style={{padding: '0.75rem'}}>{row.category_name}</td>
                  <td style={{padding: '0.75rem'}}>
                    <span className="badge" style={{background: '#F3F4F6', color: '#111'}}>{row.times_borrowed}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length === 0 && !message && <p style={{color: 'var(--text-muted)'}}>Selecciona un rango de fechas para generar el reporte.</p>}
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'));
  const role = localStorage.getItem('role');

  return (
    <Router>
      <div>
        <nav>
          <div style={{fontWeight: 'bold', marginRight: '1rem'}}>📚 Biblioteca SDD</div>
          {auth ? (
            <>
              <Link to="/books">Catálogo</Link>
              <Link to="/members">Socios</Link>
              <Link to="/loans">Préstamos</Link>
              <Link to="/overdue">Vencidos</Link>
              {role === 'admin' && <Link to="/users">Usuarios</Link>}
              {role === 'admin' && <Link to="/reports">Reportes</Link>}
              
              <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: '#F3F4F6', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>
                  Rol: {role}
                </div>
                <button onClick={() => { localStorage.clear(); setAuth(false); }}>Cerrar Sesión</button>
              </div>
            </>
          ) : (
            <Link to="/">Login</Link>
          )}
        </nav>
        <Routes>
          <Route path="/" element={<Login setAuth={setAuth} />} />
          <Route path="/books" element={auth ? <Books /> : <Navigate to="/" />} />
          <Route path="/members" element={auth ? <Members /> : <Navigate to="/" />} />
          <Route path="/loans" element={auth ? <Loans /> : <Navigate to="/" />} />
          <Route path="/overdue" element={auth ? <Overdue /> : <Navigate to="/" />} />
          <Route path="/users" element={auth && role === 'admin' ? <Users /> : <Navigate to="/" />} />
          <Route path="/reports" element={auth && role === 'admin' ? <Reports /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
