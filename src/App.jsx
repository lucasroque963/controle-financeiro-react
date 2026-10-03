import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import './App.css'

function App() {

  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('Alimentação')
  const [tipo, setTipo] = useState('Despesa')
  const [idEditando, setIdEditando] = useState(null)

  const [filtroTipo, setFiltroTipo] = useState('Todos')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')

  const [transacoes, setTransacoes] = useState(() => {
    const transacoesSalvas = localStorage.getItem('transacoes')

    if (transacoesSalvas) {
      return JSON.parse(transacoesSalvas)
    }

    return []
  })

  useEffect(() => {
    localStorage.setItem(
      'transacoes',
      JSON.stringify(transacoes)
    )
  }, [transacoes])

  function editarTransacao(transacao) {
    setDescricao(transacao.descricao)
    setValor(transacao.valor)
    setCategoria(transacao.categoria)
    setTipo(transacao.tipo)

    setIdEditando(transacao.id)
  }

  function cancelarEdicao() {
    setIdEditando(null)

    setDescricao('')
    setValor('')
    setCategoria('Alimentação')
    setTipo('Despesa')
  }

  function adicionarTransacao(event) {
    event.preventDefault()

    if (descricao.trim() === '' || valor === '') {
      alert('Preencha a descrição e o valor.')
      return
    }

    if (Number(valor) <= 0) {
      alert('Digite um valor maior que zero.')
      return
    }

    if (idEditando) {

      const transacoesAtualizadas = transacoes.map((transacao) => {

        if (transacao.id === idEditando) {
          return {
            ...transacao,
            descricao: descricao,
            valor: Number(valor),
            categoria: categoria,
            tipo: tipo
          }
        }

        return transacao
      })

      setTransacoes(transacoesAtualizadas)
      setIdEditando(null)

    } else {

      const novaTransacao = {
        id: crypto.randomUUID(),
        descricao: descricao,
        valor: Number(valor),
        categoria: categoria,
        tipo: tipo
      }

      setTransacoes([...transacoes, novaTransacao])
    }

    setDescricao('')
    setValor('')
    setCategoria('Alimentação')
    setTipo('Despesa')
  }

  function excluirTransacao(id) {
    const novasTransacoes = transacoes.filter(
      (transacao) => transacao.id !== id
    )

    setTransacoes(novasTransacoes)

    if (idEditando === id) {
      cancelarEdicao()
    }
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const receitas = transacoes
    .filter((transacao) => transacao.tipo === 'Receita')
    .reduce((total, transacao) => total + transacao.valor, 0)

  const despesas = transacoes
    .filter((transacao) => transacao.tipo === 'Despesa')
    .reduce((total, transacao) => total + transacao.valor, 0)

  const saldo = receitas - despesas

  const dadosGrafico = [
    {
      nome: 'Receitas',
      valor: receitas
    },
    {
      nome: 'Despesas',
      valor: despesas
    }
  ]

  const transacoesFiltradas = transacoes.filter((transacao) => {

    const tipoCorresponde =
      filtroTipo === 'Todos' ||
      transacao.tipo === filtroTipo

    const categoriaCorresponde =
      filtroCategoria === 'Todas' ||
      transacao.categoria === filtroCategoria

    return tipoCorresponde && categoriaCorresponde
  })

  return (
    <div className="container">

      <h1>Controle Financeiro</h1>

      <p>
        Gerencie suas receitas e despesas.
      </p>

      <div className="resumo">

        <div className="card saldo">
          <p>Saldo atual</p>
          <h2>{formatarMoeda(saldo)}</h2>
        </div>

        <div className="card receita">
          <p>Receitas</p>
          <h2>{formatarMoeda(receitas)}</h2>
        </div>

        <div className="card despesa">
          <p>Despesas</p>
          <h2>{formatarMoeda(despesas)}</h2>
        </div>

      </div>

      <div className="grafico-container">

        <h2>Resumo financeiro</h2>

        {transacoes.length === 0 ? (

          <p>
            Adicione transações para visualizar o gráfico.
          </p>

        ) : (

          <div className="grafico">

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={dadosGrafico}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="nome" />

                <YAxis />

                <Tooltip
                  formatter={(valor) =>
                    formatarMoeda(valor)
                  }
                />

                <Bar
                  dataKey="valor"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        )}

      </div>

      <div className="formulario">

        <h2>
          {idEditando
            ? 'Editar transação'
            : 'Adicionar transação'
          }
        </h2>

        <form onSubmit={adicionarTransacao}>

          <div className="campo">

            <label>Descrição</label>

            <input
              type="text"
              placeholder="Ex: Supermercado"
              value={descricao}
              onChange={(event) =>
                setDescricao(event.target.value)
              }
            />

          </div>

          <div className="campo">

            <label>Valor</label>

            <input
              type="number"
              placeholder="0,00"
              value={valor}
              onChange={(event) =>
                setValor(event.target.value)
              }
            />

          </div>

          <div className="campo">

            <label>Categoria</label>

            <select
              value={categoria}
              onChange={(event) =>
                setCategoria(event.target.value)
              }
            >

              <option>Alimentação</option>
              <option>Transporte</option>
              <option>Moradia</option>
              <option>Saúde</option>
              <option>Lazer</option>
              <option>Salário</option>
              <option>Outros</option>

            </select>

          </div>

          <div className="campo">

            <label>Tipo</label>

            <select
              value={tipo}
              onChange={(event) =>
                setTipo(event.target.value)
              }
            >

              <option>Despesa</option>
              <option>Receita</option>

            </select>

          </div>

          <button type="submit">

            {idEditando
              ? 'Salvar alterações'
              : 'Adicionar transação'
            }

          </button>

          {idEditando && (

            <button
              type="button"
              onClick={cancelarEdicao}
            >
              Cancelar edição
            </button>

          )}

        </form>

      </div>

      <div className="filtros">

        <h2>Filtrar transações</h2>

        <div className="filtro-tipo">

          <button
            className={
              filtroTipo === 'Todos'
                ? 'ativo'
                : ''
            }
            onClick={() =>
              setFiltroTipo('Todos')
            }
          >
            Todas
          </button>

          <button
            className={
              filtroTipo === 'Receita'
                ? 'ativo'
                : ''
            }
            onClick={() =>
              setFiltroTipo('Receita')
            }
          >
            Receitas
          </button>

          <button
            className={
              filtroTipo === 'Despesa'
                ? 'ativo'
                : ''
            }
            onClick={() =>
              setFiltroTipo('Despesa')
            }
          >
            Despesas
          </button>

        </div>

        <div className="filtro-categoria">

          <label>Categoria</label>

          <select
            value={filtroCategoria}
            onChange={(event) =>
              setFiltroCategoria(
                event.target.value
              )
            }
          >

            <option>Todas</option>
            <option>Alimentação</option>
            <option>Transporte</option>
            <option>Moradia</option>
            <option>Saúde</option>
            <option>Lazer</option>
            <option>Salário</option>
            <option>Outros</option>

          </select>

        </div>

      </div>

      <div className="lista-transacoes">

        <h2>Transações</h2>

        {transacoesFiltradas.length === 0 && (
          <p>
            Nenhuma transação encontrada.
          </p>
        )}

        {transacoesFiltradas.map((transacao) => (

          <div
            key={transacao.id}
            className="transacao"
          >

            <p>
              {transacao.descricao}
            </p>

            <p>
              {transacao.categoria}
            </p>

            <p
              className={
                transacao.tipo === 'Receita'
                  ? 'tipo-receita'
                  : 'tipo-despesa'
              }
            >
              {transacao.tipo}
            </p>

            <p
              className={
                transacao.tipo === 'Receita'
                  ? 'valor-receita'
                  : 'valor-despesa'
              }
            >

              {transacao.tipo === 'Receita'
                ? '+'
                : '-'
              }

              {formatarMoeda(
                transacao.valor
              )}

            </p>

            <button
              type="button"
              onClick={() =>
                editarTransacao(transacao)
              }
            >
              Editar
            </button>

            <button
              type="button"
              onClick={() =>
                excluirTransacao(
                  transacao.id
                )
              }
            >
              Excluir
            </button>

          </div>

        ))}

      </div>

    </div>
  )
}

export default App