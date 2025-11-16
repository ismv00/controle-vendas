import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { formatarReal } from '../utils/format';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [clientId, setClientId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoVenda, setPrecoVenda] = useState('');
  const [dataVenda, setDataVenda] = useState('');

  useEffect(() => {
    onSnapshot(collection(db, 'clientes'), (snap) => {
      setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    onSnapshot(collection(db, 'produtos'), (snap) => {
      setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    onSnapshot(collection(db, 'vendas'), (snap) => {
      setVendas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  async function salvar() {
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return;

    const qtd = Number(quantidade);
    const preco = Number(precoVenda);
    const custoUnit = Number(produto.custo);

    const totalVenda = qtd * preco;
    const custoTotal = qtd * custoUnit;

    const lucro = totalVenda - custoTotal;
    const margem = custoTotal > 0 ? (lucro / totalVenda) * 100 : 0;

    await addDoc(collection(db, 'vendas'), {
      clientId,
      produtoId,
      quantidade: qtd,
      precoVenda: preco,
      totalVenda,
      custoUnitario: custoUnit,
      custoTotal,
      lucro,
      margem,
      status: 'aberto',
      data: dataVenda,
    });

    setClientId('');
    setProdutoId('');
    setQuantidade(1);
    setPrecoVenda('');
  }

  async function atualizarStatus(id, status) {
    await updateDoc(doc(db, 'vendas', id), { status });
  }

  async function excluir(id) {
    await deleteDoc(doc(db, 'vendas', id));
  }

  function agruparVendas() {
    const grupos = {};

    vendas.forEach((v) => {
      const key = `${v.data}|${v.clientId}`;

      if (!grupos[key]) {
        const cliente = clientes.find((c) => c.id === v.clientId);

        grupos[key] = {
          data: v.data,
          cliente,
          itens: [],
          totalVendaGeral: 0,
          custoTotalGeral: 0,
          lucroTotalGeral: 0,
        };
      }

      grupos[key].itens.push(v);

      grupos[key].totalVendaGeral += v.totalVenda;
      grupos[key].custoTotalGeral += v.custoTotal;
      grupos[key].lucroTotalGeral += v.lucro;
    });

    return Object.values(grupos);
  }

  return (
    <div className="card">
      <h2>Registrar Vendas</h2>

      <table border="1" cellPadding="8" style={{ marginBottom: 30 }}>
        <thead>
          <tr>
            <th>Data Venda</th>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Venda Unitária</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <input
                type="date"
                value={dataVenda}
                onChange={(e) => setDataVenda(e.target.value)}
              />
            </td>
            <td>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Selecione</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </td>

            <td>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
              >
                <option value="">Selecione</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </td>

            <td>
              <input
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                style={{ width: 60 }}
                type="number"
              />
            </td>

            <td>
              <input
                value={precoVenda}
                onChange={(e) => setPrecoVenda(e.target.value)}
                style={{ width: 90 }}
              />
            </td>

            <td>
              {(() => {
                const preco = Number(precoVenda);
                const qtd = Number(quantidade);
                return preco > 0 ? preco * qtd : 0;
              })()}
            </td>

            <td>
              <button onClick={salvar}>Salvar</button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* LISTAGEM DAS VENDAS EM UMA TABELA SEPARADA */}
      <h2>Vendas Registradas</h2>
      {agruparVendas().map((grupo, index) => (
        <div key={index} style={{ marginBottom: 30 }}>
          <h3>
            {grupo.data} — {grupo.cliente?.nome}
          </h3>

          <table border="1" cellPadding="8" width="100%">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Custo Unit</th>
                <th>Custo Total</th>
                <th>Venda Unit</th>
                <th>Venda Total</th>
                <th>Lucro</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {grupo.itens.map((item) => {
                const produto = produtos.find((p) => p.id === item.produtoId);
                return (
                  <tr key={item.id}>
                    <td>{produto?.nome}</td>
                    <td>{item.quantidade}</td>
                    <td>{formatarReal(item.custoUnitario)}</td>
                    <td>{formatarReal(item.custoTotal)}</td>
                    <td>{formatarReal(item.precoVenda)}</td>
                    <td>{formatarReal(item.totalVenda)}</td>
                    <td>{formatarReal(item.lucro.toFixed(2))}</td>

                    <td>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          atualizarStatus(item.id, e.target.value)
                        }
                      >
                        <option value="pago">Pago</option>
                        <option value="aberto">Em aberto</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>

                    <td>
                      <button
                        style={{ background: 'red', color: '#fff' }}
                        onClick={() => excluir(item.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr style={{ background: '#ddd' }}>
                <td colSpan="3">
                  <strong>Totais do Cliente/Data:</strong>
                </td>
                <td>
                  <strong>{formatarReal(grupo.custoTotalGeral)}</strong>
                </td>
                <td></td>
                <td>
                  <strong>{formatarReal(grupo.totalVendaGeral)}</strong>
                </td>
                <td>
                  <strong>
                    {formatarReal(grupo.lucroTotalGeral.toFixed(2))}
                  </strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
    </div>
  );
}
