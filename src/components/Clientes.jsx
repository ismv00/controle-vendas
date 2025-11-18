import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles.css';

export default function Clientes({ userId }) {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState('');
  const [fantasia, setFantasia] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    const ref = collection(db, 'clientes');
    const q = query(ref, where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(dados);
    });
  }, [userId]);

  async function salvar() {
    if (!nome) return;

    await addDoc(collection(db, 'clientes'), {
      nome,
      fantasia,
      endereco,
      telefone,
      userId,
    });

    setNome('');
    setFantasia('');
    setEndereco('');
    setTelefone('');
  }

  async function atualizar(id, campo, valor) {
    await updateDoc(doc(db, 'clientes', id), {
      [campo]: valor,
    });
  }

  async function excluir(id) {
    await deleteDoc(doc(db, 'clientes', id));
  }

  return (
    <div className="card">
      <h2>Clientes</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Fantasia</th>
            <th>Endereco</th>
            <th>Telefone</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <input value={nome} onChange={(e) => setNome(e.target.value)} />
            </td>
            <td>
              <input
                value={fantasia}
                onChange={(e) => setFantasia(e.target.value)}
              />
            </td>
            <td>
              <input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </td>
            <td>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </td>
            <td>
              <button onClick={salvar}>Salvar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Clientes Cadastrados</h2>
      <table border="1" cellPadding="8" width="100%">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Fantasia</th>
            <th>Endereco</th>
            <th>Telefone</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((c) => {
            return (
              <tr key={c.id}>
                <td>
                  <input
                    value={c.nome}
                    onChange={(e) => atualizar(c.id, 'nome', e.target.value)}
                    // style={{ width: '90%' }}
                  />
                </td>
                <td>
                  <input
                    value={c.fantasia}
                    onChange={(e) =>
                      atualizar(c.id, 'fantasia', e.target.value)
                    }
                    style={{ width: '90%' }}
                  />
                </td>
                <td>
                  <input
                    value={c.endereco}
                    onChange={(e) =>
                      atualizar(c.id, 'endereco', e.target.value)
                    }
                    style={{ width: '90%' }}
                  />
                </td>

                <td>
                  <input
                    value={c.telefone}
                    onChange={(e) =>
                      atualizar(c.id, 'telefone', e.target.value)
                    }
                    style={{ width: '90%' }}
                  />
                </td>

                <td>
                  <button onClick={() => excluir(c.id)}>Excluir</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
