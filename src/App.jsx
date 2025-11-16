import React, { useState } from 'react';
import Clientes from './components/Clientes';
import Produtos from './components/Produtos';
import Vendas from './components/Vendas';

import './styles.css';

export default function App() {
  const [tab, setTab] = useState('clientes');

  return (
    <div style={{ padding: 20 }}>
      <h1>Controle de Vendas</h1>

      <div className="nav-buttons">
        <button onClick={() => setTab('clientes')}>Clientes</button>
        <button onClick={() => setTab('produtos')}>Produtos</button>
        <button onClick={() => setTab('vendas')}>Vendas</button>
      </div>

      {tab === 'clientes' && <Clientes />}
      {tab === 'produtos' && <Produtos />}
      {tab === 'vendas' && <Vendas />}
    </div>
  );
}
