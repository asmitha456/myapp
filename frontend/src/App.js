import React, { useState, useEffect } from 'react';

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const addUser = () => {
    fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    }).then(res => res.json()).then(user => {
      setUsers([...users, user]);
      setName('');
      setEmail('');
    });
  };

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(u => <li key={u.id}>{u.name} - {u.email}</li>)}
      </ul>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={addUser}>Add User</button>
    </div>
  );
}
export default App;
