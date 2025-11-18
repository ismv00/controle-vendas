import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/config';

import Clientes from './components/Clientes';
import Produtos from './components/Produtos';
import Vendas from './components/Vendas';
import Login from './components/Login';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [tab, setTab] = useState('clientes');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe;
  }, []);

  if (!usuario) {
    return <Login />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Controle de Vendas</h1>

      <div className="top-bar">
        <p>Usuário: {usuario.email}</p>
        <button onClick={() => signOut(auth)}>Sair</button>
      </div>

      <div className="nav-buttons">
        <button onClick={() => setTab('clientes')}>Clientes</button>
        <button onClick={() => setTab('produtos')}>Produtos</button>
        <button onClick={() => setTab('vendas')}>Vendas</button>
      </div>

      {tab === 'clientes' && <Clientes userId={usuario.uid} />}
      {tab === 'produtos' && <Produtos userId={usuario.uid} />}
      {tab === 'vendas' && <Vendas userId={usuario.uid} />}
    </div>
  );
}
