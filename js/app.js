document.addEventListener('DOMContentLoaded', () => {

  // ========== ELEMENTOS GERAIS ==========
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');
  const painelVendedor = document.getElementById('painelVendedor');
  const painelAdmin = document.getElementById('painelAdmin');

  // ========== DADOS INICIAIS (localStorage) ==========
  if (!localStorage.getItem('vendedores')) {
    const vendedoresIniciais = [
      { id: 1, nome: 'Admin', email: 'admin@claro.com', equipe: 'Gestão', usuario: 'admin', hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', role: 'admin' },
      { id: 2, nome: 'Vendedor 1', email: 'v1@claro.com', equipe: 'Alpha', usuario: 'vendedor1', hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', role: 'vendedor' },
      { id: 3, nome: 'Vendedor 2', email: 'v2@claro.com', equipe: 'Beta', usuario: 'vendedor2', hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', role: 'vendedor' }
    ];
    localStorage.setItem('vendedores', JSON.stringify(vendedoresIniciais));
    localStorage.setItem('lixeira', JSON.stringify([]));
    localStorage.setItem('vendas', JSON.stringify([]));
  }

  function getVendedores() { return JSON.parse(localStorage.getItem('vendedores')); }
  function salvarVendedores(arr) { localStorage.setItem('vendedores', JSON.stringify(arr)); }
  function getLixeira() { return JSON.parse(localStorage.getItem('lixeira')); }
  function salvarLixeira(arr) { localStorage.setItem('lixeira', JSON.stringify(arr)); }
  function getVendas() { return JSON.parse(localStorage.getItem('vendas')); }
  function salvarVendas(arr) { localStorage.setItem('vendas', JSON.stringify(arr)); }

  // ========== RELÓGIO EM TEMPO REAL ==========
  function atualizarRelogios() {
    const agora = new Date();
    const hora = agora.toLocaleTimeString('pt-BR');
    document.querySelectorAll('.relogio').forEach(el => el.textContent = hora);
  }
  setInterval(atualizarRelogios, 1000);
  atualizarRelogios();

  // ========== HASH SHA-256 ==========
  async function gerarHash(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ========== LOGIN ==========
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    if (!usuario || !senha) { loginMsg.textContent = 'Preencha todos os campos.'; return; }
    loginMsg.textContent = 'Verificando...';
    const hash = await gerarHash(senha);
    const vendedores = getVendedores();
    const encontrado = vendedores.find(v => v.usuario === usuario && v.hash === hash);
    if (encontrado) {
      loginScreen.style.display = 'none';
      appScreen.style.display = 'block';
      if (encontrado.role === 'admin') {
        painelAdmin.style.display = 'block';
        document.getElementById('relogioAdmin').textContent = '';
        carregarTelaAdmin();
      } else {
        painelVendedor.style.display = 'block';
        document.getElementById('bemVindoVendedor').textContent = `Bem-vindo, ${encontrado.nome}!`;
      }
    } else {
      loginMsg.textContent = 'Usuário ou senha inválidos.';
    }
  });

  // Logout
  document.getElementById('logoutAdmin').addEventListener('click', logout);
  document.getElementById('logoutVendedor').addEventListener('click', logout);
  function logout() {
    painelAdmin.style.display = 'none';
    painelVendedor.style.display = 'none';
    appScreen.style.display = 'none';
    loginScreen.style.display = 'block';
    loginForm.reset();
    loginMsg.textContent = '';
  }

  // ========== ADMIN: CARREGAMENTO INICIAL ==========
  function carregarTelaAdmin() {
    atualizarSelectVendedores();
    atualizarQuadroGeral();
    document.getElementById('dataAtivacao').textContent = new Date().toLocaleDateString('pt-BR');
    // Eventos de navegação
    document.querySelectorAll('.sidebar-glass a[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const secaoId = link.getAttribute('data-section');
        document.querySelectorAll('.admin-content .secao').forEach(s => s.classList.remove('ativa'));
        document.getElementById(`secao-${secaoId}`).classList.add('ativa');
      });
    });
    // Dropdowns
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggle.parentElement.classList.toggle('open');
      });
    });
    // Relatório comparativo
    document.getElementById('btnRelatorioComparativo').addEventListener('click', abrirRelatorioComparativo);
    // Ativar venda
    document.getElementById('lupaDetalhes').addEventListener('click', () => {
      document.getElementById('detalhesVenda').style.display = 'block';
    });
    document.getElementById('formAtivarVenda').addEventListener('submit', salvarVenda);
    // Adicionar vendedor modal
    document.getElementById('btnAdicionarVendedor').addEventListener('click', () => abrirModal('modalAdicionarVendedor'));
    document.getElementById('formAdicionarVendedor').addEventListener('submit', adicionarVendedor);
    document.getElementById('btnExcluirVendedor').addEventListener('click', abrirModalExcluir);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    document.querySelectorAll('.fechar-modal').forEach(btn => btn.addEventListener('click', fecharModais));
    // Relatório vendedor
    document.getElementById('btnGerarRelatorioVendedor').addEventListener('click', gerarRelatorioVendedor);
  }

  function atualizarSelectVendedores() {
    const vendedores = getVendedores().filter(v => v.role === 'vendedor');
    const selects = ['vendedorVenda', 'selectVendedorRelatorio', 'selectExcluirVendedor'];
    selects.forEach(id => {
      const sel = document.getElementById(id);
      if (sel) {
        sel.innerHTML = '<option value="">Selecione...</option>' + vendedores.map(v => `<option value="${v.id}">${v.nome}</option>`).join('');
      }
    });
  }

  // ========== QUADRO GERAL ==========
  function atualizarQuadroGeral() {
    const vendas = getVendas();
    const hoje = new Date().toISOString().split('T')[0];
    const vendasHoje = vendas.filter(v => v.data === hoje);
    document.getElementById('totalVendasHoje').textContent = vendasHoje.length;

    // Ranking de hoje
    const ranking = {};
    vendasHoje.forEach(v => {
      const vendedor = getVendedores().find(vend => vend.id == v.vendedorId);
      const nome = vendedor ? vendedor.nome : 'Desconhecido';
      ranking[nome] = (ranking[nome] || 0) + 1;
    });
    const sorted = Object.entries(ranking).sort((a,b) => b[1]-a[1]).slice(0,3);
    const ol = document.getElementById('rankingVendedores');
    ol.innerHTML = sorted.map(([nome, qtd]) => `<li>${nome}: ${qtd} venda(s)</li>`).join('') || '<li>Nenhuma venda hoje</li>';
  }

  // ========== SALVAR VENDA ==========
  function salvarVenda(e) {
    e.preventDefault();
    const vendedorId = document.getElementById('vendedorVenda').value;
    if (!vendedorId) return alert('Selecione um vendedor');
    const data = document.getElementById('dataVenda').value || new Date().toISOString().split('T')[0];
    const novaVenda = {
      id: Date.now(),
      vendedorId,
      tipo: document.getElementById('tipoVenda').value,
      data,
      // pegaria todos os campos, mas simplificado
    };
    const vendas = getVendas();
    vendas.push(novaVenda);
    salvarVendas(vendas);
    alert('Venda registrada!');
    e.target.reset();
    document.getElementById('detalhesVenda').style.display = 'none';
    atualizarQuadroGeral();
  }

  // ========== RELATÓRIO COMPARATIVO ==========
  function abrirRelatorioComparativo() {
    const div = document.getElementById('relatorioComparativo');
    div.style.display = 'block';
    div.innerHTML = `
      <button id="compDiario">📅 Comparar com ontem (mesmo horário)</button>
      <button id="compMensal">📆 Comparar com mês passado</button>
      <div id="resultadoComparacao"></div>
    `;
    document.getElementById('compDiario').addEventListener('click', () => comparar('diario'));
    document.getElementById('compMensal').addEventListener('click', () => comparar('mensal'));
  }

  function comparar(tipo) {
    const vendas = getVendas();
    const agora = new Date();
    const hoje = agora.toISOString().split('T')[0];
    let texto = '';
    if (tipo === 'diario') {
      const ontem = new Date(agora);
      ontem.setDate(ontem.getDate()-1);
      const ontemStr = ontem.toISOString().split('T')[0];
      const vendasHoje = vendas.filter(v => v.data === hoje).length;
      const vendasOntem = vendas.filter(v => v.data === ontemStr).length;
      texto = `Hoje: ${vendasHoje} vendas | Ontem (mesmo horário): ${vendasOntem} vendas`;
    } else {
      const mesAtual = agora.getMonth();
      const anoAtual = agora.getFullYear();
      const mesPassado = mesAtual === 0 ? 11 : mesAtual-1;
      const anoMesPassado = mesAtual === 0 ? anoAtual-1 : anoAtual;
      const filtroMes = v => v.data && new Date(v.data).getMonth() === mesAtual && new Date(v.data).getFullYear() === anoAtual;
      const filtroMesPass = v => v.data && new Date(v.data).getMonth() === mesPassado && new Date(v.data).getFullYear() === anoMesPassado;
      texto = `Mês atual: ${vendas.filter(filtroMes).length} vendas | Mês passado: ${vendas.filter(filtroMesPass).length} vendas`;
    }
    document.getElementById('resultadoComparacao').innerHTML = `<p>${texto}</p>`;
  }

  // ========== ADICIONAR VENDEDOR ==========
  function adicionarVendedor(e) {
    e.preventDefault();
    const nome = document.getElementById('novoNome').value;
    const email = document.getElementById('novoEmail').value;
    const equipe = document.getElementById('novoEquipe').value;
    const usuario = document.getElementById('novoUsuario').value;
    const senha = document.getElementById('novoSenha').value;
    gerarHash(senha).then(hash => {
      const vendedores = getVendedores();
      const novo = { id: Date.now(), nome, email, equipe, usuario, hash, role: 'vendedor' };
      vendedores.push(novo);
      salvarVendedores(vendedores);
      atualizarSelectVendedores();
      fecharModais();
      alert('Vendedor adicionado!');
    });
  }

  // ========== EXCLUIR VENDEDOR (LIXEIRA) ==========
  function abrirModalExcluir() {
    document.getElementById('modalExcluirVendedor').style.display = 'flex';
    document.getElementById('msgExclusao').textContent = '';
  }

  function confirmarExclusao() {
    const id = document.getElementById('selectExcluirVendedor').value;
    if (!id) return;
    if (!confirm('Deseja realmente excluir este vendedor?')) return;
    const vendedores = getVendedores();
    const idx = vendedores.findIndex(v => v.id == id);
    if (idx === -1) return;
    const excluido = vendedores.splice(idx, 1)[0];
    salvarVendedores(vendedores);
    const lixeira = getLixeira();
    excluido.dataExclusao = new Date().toISOString();
    lixeira.push(excluido);
    salvarLixeira(lixeira);
    atualizarSelectVendedores();
    document.getElementById('msgExclusao').textContent = 'Vendedor movido para lixeira (15 dias para recuperação).';
    // Agendar remoção permanente após 15 dias (simulado)
    setTimeout(() => {
      const lixeiraAtual = getLixeira().filter(v => v.id != excluido.id);
      salvarLixeira(lixeiraAtual);
    }, 15*24*60*60*1000); // 15 dias
  }

  // ========== RELATÓRIO POR VENDEDOR ==========
  function gerarRelatorioVendedor() {
    const vendedorId = document.getElementById('selectVendedorRelatorio').value;
    const mes = document.getElementById('selectMesRelatorio').value;
    if (!vendedorId || mes === '') return alert('Selecione vendedor e mês');
    const vendas = getVendas().filter(v => {
      if (v.vendedorId != vendedorId) return false;
      const data = new Date(v.data);
      return data.getMonth() == mes && data.getFullYear() == new Date().getFullYear();
    });
    const div = document.getElementById('resultadoRelatorioVendedor');
    div.innerHTML = vendas.length ? vendas.map(v => `<p>${v.data} - ${v.tipo}</p>`).join('') : '<p>Nenhuma venda encontrada.</p>';
  }

  // ========== MODAIS ==========
  function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
  function fecharModais() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }
  window.onclick = (e) => { if (e.target.classList.contains('modal')) fecharModais(); };

  // Inicialização dos meses no select de relatório
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const selectMes = document.getElementById('selectMesRelatorio');
  meses.forEach((nome, i) => selectMes.innerHTML += `<option value="${i}">${nome}</option>`);

});
