import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  async function logar() {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      onLogin();
    } catch (e) {
      setErro('Email ou senha inválidos.');
    }
  }

  return (
    <div style={{ width: 300, margin: '50px auto' }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        style={{ width: '100%', marginBottom: 10 }}
      />

      <button onClick={logar} style={{ width: '100%' }}>
        Entrar
      </button>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}
