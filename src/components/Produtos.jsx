import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import '../styles.css';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [custo, setCusto] = useState('');

  const userId = auth.currentUser?.uid;

  const categorias = [
    'Blocos',
    'Sacolas',
    'Agendas',
    'Cadernos',
    'Planner',
    'Devocional',
  ];

  useEffect(() => {
    if (!userId) return;

    const ref = collection(db, 'produtos');
    const q = query(ref, where('userId', '==', userId));

    return onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProdutos(dados);
    });
  }, [userId]);

  async function salvar() {
    if (!nome || !categoria || !custo) return;
    if (!userId) return;

    await addDoc(collection(db, 'produtos'), {
      nome,
      categoria,
      custo: Number(custo),
      userId,
    });

    setNome('');
    setCategoria('');
    setCusto('');
  }

  async function atualizar(id, campo, valor) {
    await updateDoc(doc(db, 'produtos', id), {
      [campo]: campo === 'custo' ? Number(valor) : valor,
    });
  }

  async function excluir(id) {
    await deleteDoc(doc(db, 'produtos', id));
  }

  function formatarReal(valor) {
    if (isNaN(valor)) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  return (
    <div className="card">
      <h2>Produtos</h2>

      <table
        border="1"
        cellPadding="8"
        style={{ marginBottom: 30, width: '100%' }}
      >
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Custo</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '90%' }}
              />
            </td>
            <td>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={{ width: '90%' }}
              >
                <option value="">Selecione</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                style={{ width: '90%' }}
              />
            </td>
            <td>
              <button onClick={salvar}>Salvar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Produtos Cadastrados</h2>
      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Custo</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {produtos.map((p) => (
            <tr key={p.id}>
              <td>
                <input
                  value={p.nome}
                  onChange={(e) => atualizar(p.id, 'nome', e.target.value)}
                  style={{ width: '90%' }}
                />
              </td>

              <td>
                <select
                  value={p.categoria}
                  onChange={(e) => atualizar(p.id, 'categoria', e.target.value)}
                  style={{ width: '90%' }}
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                {'  '}
                <strong>{formatarReal(p.custo)}</strong>
              </td>

              <td>
                <button onClick={() => excluir(p.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
