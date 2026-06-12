document.addEventListener('DOMContentLoaded', () => {
  console.log('Stage Telecom CRM iniciado.');

  // ========== ELEMENTOS GERAIS ==========
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');
  const painelVendedor = document.getElementById('painelVendedor');
  const painelAdmin = document.getElementById('painelAdmin');

  // ========== INICIALIZAÇÃO DE DADOS (localStorage) ==========
  if (!localStorage.getItem('vendedores')) {
    const vendedoresIniciais = [
      { id: 1, nome: 'Admin', email: 'admin@stagetelecom.com', equipe: 'Gestão', usuario: 'admin', hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', role: 'admin' },
      { id: 2, nome: 'Vendedor 1', email: 'v1@stagetelecom.com', equipe: 'Alpha', usuario: 'vendedor1', hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', role: 'vendedor' },
      { id: 3, nome: 'Vendedor 2', email: 'v2@stagetelecom.com', equipe: 'Beta', usuario: 'vendedor2', hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', role: 'vendedor' }
    ];
    localStorage.setItem('vendedores', JSON.stringify(vendedoresIniciais));
    localStorage.setItem('lixeira', JSON.stringify([]));
    localStorage.setItem('vendas', JSON.stringify([]));
    localStorage.setItem('flags', JSON.stringify([
      { nome: 'Pendente', cor: '#ffc107' },
      { nome: 'Aprovado', cor: '#4caf50' },
      { nome: 'Cancelado', cor: '#f44336' }
    ]));
  }

  function getVendedores() { return JSON.parse(localStorage.getItem('vendedores')) || []; }
  function salvarVendedores(arr) { localStorage.setItem('vendedores', JSON.stringify(arr)); }
  function getLixeira() { return JSON.parse(localStorage.getItem('lixeira')) || []; }
  function salvarLixeira(arr) { localStorage.setItem('lixeira', JSON.stringify(arr)); }
  function getVendas() { return JSON.parse(localStorage.getItem('vendas')) || []; }
  function salvarVendas(arr) { localStorage.setItem('vendas', JSON.stringify(arr)); }
  function getFlags() { return JSON.parse(localStorage.getItem('flags')) || []; }
  function salvarFlags(arr) { localStorage.setItem('flags', JSON.stringify(arr)); }

  // ========== RELÓGIO ==========
  function atualizarRelogios() {
    const agora = new Date();
    const hora = agora.toLocaleTimeString('pt-BR');
    document.querySelectorAll('.relogio').forEach(el => { if (el) el.textContent = hora; });
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
    if (!usuario || !senha) {
      loginMsg.textContent = 'Preencha todos os campos.';
      return;
    }
    loginMsg.textContent = 'Verificando...';
    try {
      const hash = await gerarHash(senha);
      const vendedores = getVendedores();
      const encontrado = vendedores.find(v => v.usuario === usuario && v.hash === hash);
      if (encontrado) {
        loginScreen.style.display = 'none';
        appScreen.style.display = 'block';
        if (encontrado.role === 'admin') {
          painelVendedor.style.display = 'none';
          painelAdmin.style.display = 'block';
          carregarTelaAdmin();
        } else {
          painelAdmin.style.display = 'none';
          painelVendedor.style.display = 'block';
          document.getElementById('bemVindoVendedor').textContent = `Bem-vindo, ${encontrado.nome}!`;
          // Armazenar usuário logado para envio de vendas
          localStorage.setItem('usuarioLogado', JSON.stringify(encontrado));
          carregarTelaVendedor();
        }
      } else {
        loginMsg.textContent = 'Usuário ou senha inválidos.';
      }
    } catch (err) {
      loginMsg.textContent = 'Erro no processamento.';
      console.error(err);
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
    localStorage.removeItem('usuarioLogado');
  }

  // ========== TELA DO VENDEDOR ==========
  function carregarTelaVendedor() {
    // Navegação entre seções
    document.querySelectorAll('#painelVendedor .sidebar a[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const secaoId = link.getAttribute('data-section');
        document.querySelectorAll('#painelVendedor .secao').forEach(s => s.classList.remove('ativa'));
        document.getElementById(`secao-${secaoId}`).classList.add('ativa');
        // Atualizar link ativo
        document.querySelectorAll('#painelVendedor .sidebar a').forEach(a => a.classList.remove('ativo'));
        link.classList.add('ativo');
      });
    });

    // Formulário de nova venda
    document.getElementById('formNovaVenda').addEventListener('submit', function(e) {
      e.preventDefault();
      const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
      if (!usuarioLogado) return alert('Erro: usuário não identificado.');
      const novaVenda = {
        id: Date.now(),
        vendedorId: usuarioLogado.id,
        vendedorNome: usuarioLogado.nome,
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('pt-BR'),
        nomeCliente: document.getElementById('nomeCliente').value,
        produto: document.getElementById('produtoVenda').value,
        cpf: document.getElementById('cpfVenda').value,
        telefone: document.getElementById('telefoneVenda').value,
        whatsapp: document.getElementById('whatsappVenda').value,
        email: document.getElementById('emailVenda').value,
        cep: document.getElementById('cepVenda').value,
        uf: document.getElementById('ufVenda').value,
        endereco: document.getElementById('enderecoVenda').value,
        bairro: document.getElementById('bairroVenda').value,
        cidade: document.getElementById('cidadeVenda').value,
        numero: document.getElementById('numeroVenda').value,
        complemento: document.getElementById('complementoVenda').value,
        referencia: document.getElementById('referenciaVenda').value,
        valor: document.getElementById('valorVenda').value,
        velocidade: document.getElementById('velocidadeVenda').value,
        formaPagamento: document.getElementById('formaPagamentoVenda').value,
        vencimento: document.getElementById('vencimentoVenda').value,
        dataInstalacao: document.getElementById('dataInstalacaoVenda').value,
        contrato: document.getElementById('contratoVenda').value,
        tipoVenda: document.getElementById('tipoVendaVendedor').value,
        agendamento: document.getElementById('agendamentoVenda').value,
        plano: document.getElementById('planoVenda').value,
        dataAg: document.getElementById('dataAgVenda').value,
        observacao: document.getElementById('observacaoVenda').value,
        status: 'Pendente', // padrão
        notificada: false
      };
      const vendas = getVendas();
      vendas.push(novaVenda);
      salvarVendas(vendas);
      alert('Venda enviada com sucesso!');
      this.reset();
      // Disparar evento storage manualmente para notificar admin na mesma aba
      window.dispatchEvent(new StorageEvent('storage', { key: 'vendas', newValue: JSON.stringify(vendas), oldValue: null }));
    });
  }

  // ========== TELA DO ADMIN ==========
  function carregarTelaAdmin() {
    atualizarSelectVendedores();
    atualizarQuadroGeral();
    configurarNavegacaoAdmin();
    configurarDropdowns();
    configurarBotoesAdmin();
    configurarStorageListener();
    carregarListaAtivarVendas();
  }

  function configurarNavegacaoAdmin() {
    document.querySelectorAll('.sidebar-glass a[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const secaoId = link.getAttribute('data-section');
        document.querySelectorAll('.admin-content .secao').forEach(s => s.classList.remove('ativa'));
        const secao = document.getElementById(`secao-${secaoId}`);
        if (secao) {
          secao.classList.add('ativa');
          if (secaoId === 'ativar-venda') {
            carregarListaAtivarVendas();
          }
        }
        link.closest('.dropdown')?.classList.remove('open');
      });
    });
  }

  function configurarDropdowns() {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggle.parentElement.classList.toggle('open');
      });
    });
  }

  function configurarBotoesAdmin() {
    document.getElementById('btnRelatorioComparativo').addEventListener('click', abrirRelatorioComparativo);
    document.getElementById('btnGerenciarFlags').addEventListener('click', abrirModalGerenciarFlags);
    document.getElementById('btnAdicionarVendedor').addEventListener('click', () => abrirModal('modalAdicionarVendedor'));
    document.getElementById('formAdicionarVendedor').addEventListener('submit', adicionarVendedor);
    document.getElementById('btnExcluirVendedor').addEventListener('click', abrirModalExcluir);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    document.querySelectorAll('.fechar-modal').forEach(btn => btn.addEventListener('click', fecharModais));
    window.onclick = (event) => { if (event.target.classList.contains('modal')) fecharModais(); };
    document.getElementById('btnGerarRelatorioVendedor').addEventListener('click', gerarRelatorioVendedor);
    document.getElementById('fecharToast').addEventListener('click', () => {
      document.getElementById('toastNotificacao').style.display = 'none';
    });
  }

  function configurarStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'vendas') {
        const vendasNovas = JSON.parse(e.newValue || '[]');
        const vendasAntigas = JSON.parse(e.oldValue || '[]');
        if (vendasNovas.length > vendasAntigas.length) {
          // Nova venda adicionada
          mostrarNotificacao();
          if (document.getElementById('secao-ativar-venda').classList.contains('ativa')) {
            carregarListaAtivarVendas();
          }
        }
        atualizarQuadroGeral();
      }
    });
  }

  function mostrarNotificacao() {
    const toast = document.getElementById('toastNotificacao');
    toast.style.display = 'flex';
    toast.style.animation = 'none';
    toast.offsetHeight; // reflow
    toast.style.animation = 'slideUp 0.5s ease';
    // Esconder automaticamente após 8 segundos
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 8000);
  }

  function carregarListaAtivarVendas() {
    const vendas = getVendas();
    const container = document.getElementById('listaAtivarVendas');
    const flags = getFlags();
    container.innerHTML = vendas.map(venda => {
      const statusOptions = flags.map(flag => `<option value="${flag.nome}" ${venda.status === flag.nome ? 'selected' : ''}>${flag.nome}</option>`).join('');
      const balao = (!venda.notificada) ? '<span class="nova-venda-balao">NOVA VENDA</span>' : '';
      return `
        <div class="venda-item" data-id="${venda.id}">
          ${balao}
          <div class="venda-info"><strong>Data:</strong> ${venda.data} ${venda.hora}</div>
          <div class="venda-info"><strong>Vendedor:</strong> ${venda.vendedorNome}</div>
          <div class="venda-info"><strong>Cliente:</strong> ${venda.nomeCliente}</div>
          <div class="venda-info"><strong>Produto:</strong> ${venda.produto}</div>
          <select class="status-select" onchange="atualizarStatusVenda(${venda.id}, this.value)">
            ${statusOptions}
          </select>
          <button class="btn-lupa" onclick="abrirDetalhesVenda(${venda.id})">🔍</button>
        </div>
      `;
    }).join('');

    // Marcar todas como notificadas
    vendas.forEach(v => v.notificada = true);
    salvarVendas(vendas);
  }

  window.atualizarStatusVenda = function(id, novoStatus) {
    const vendas = getVendas();
    const venda = vendas.find(v => v.id == id);
    if (venda) {
      venda.status = novoStatus;
      salvarVendas(vendas);
    }
  };

  window.abrirDetalhesVenda = function(id) {
    const vendas = getVendas();
    const venda = vendas.find(v => v.id == id);
    if (!venda) return;
    const conteudo = document.getElementById('conteudoDetalhesVenda');
    conteudo.innerHTML = Object.entries(venda).map(([chave, valor]) => {
      if (['id', 'vendedorId', 'notificada'].includes(chave)) return '';
      return `<div><strong>${chave}:</strong> ${valor || '-'}</div>`;
    }).join('');
    abrirModal('modalDetalhesVenda');
  };

  function abrirModalGerenciarFlags() {
    document.getElementById('modalGerenciarFlags').style.display = 'flex';
    renderizarListaFlags();
  }

  function renderizarListaFlags() {
    const flags = getFlags();
    const container = document.getElementById('listaFlags');
    container.innerHTML = flags.map(f => `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
        <span style="background:${f.cor}; width:20px; height:20px; border-radius:50%;"></span>
        <span>${f.nome}</span>
        <button class="btn-excluir" onclick="excluirFlag('${f.nome}')">Excluir</button>
      </div>
    `).join('');
  }

  window.excluirFlag = function(nome) {
    let flags = getFlags();
    flags = flags.filter(f => f.nome !== nome);
    salvarFlags(flags);
    renderizarListaFlags();
  };

  document.getElementById('formNovaFlag').addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('novaFlagNome').value.trim();
    const cor = document.getElementById('novaFlagCor').value;
    if (!nome) return;
    let flags = getFlags();
    if (flags.find(f => f.nome === nome)) return alert('Flag já existe.');
    flags.push({ nome, cor });
    salvarFlags(flags);
    renderizarListaFlags();
    this.reset();
  });

  function atualizarSelectVendedores() {
    const vendedores = getVendedores().filter(v => v.role === 'vendedor');
    const selects = ['selectVendedorRelatorio', 'selectExcluirVendedor'];
    selects.forEach(id => {
      const sel = document.getElementById(id);
      if (sel) {
        sel.innerHTML = '<option value="">Selecione...</option>' +
          vendedores.map(v => `<option value="${v.id}">${v.nome}</option>`).join('');
      }
    });
  }

  function atualizarQuadroGeral() {
    const vendas = getVendas();
    const hoje = new Date().toISOString().split('T')[0];
    const vendasHoje = vendas.filter(v => v.data === hoje);
    document.getElementById('totalVendasHoje').textContent = vendasHoje.length;

    const ranking = {};
    vendasHoje.forEach(v => {
      const nome = v.vendedorNome || 'Desconhecido';
      ranking[nome] = (ranking[nome] || 0) + 1;
    });
    const sorted = Object.entries(ranking).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const ol = document.getElementById('rankingVendedores');
    ol.innerHTML = sorted.length ? sorted.map(([nome, qtd]) => `<li>${nome}: ${qtd} venda(s)</li>`).join('') : '<li>Nenhuma venda hoje</li>';
  }

  function abrirRelatorioComparativo() {
    const div = document.getElementById('relatorioComparativo');
    div.style.display = 'block';
    div.innerHTML = `
      <button id="compDiario" class="btn-novo">📅 Comparar com ontem (mesmo horário)</button>
      <button id="compMensal" class="btn-novo">📆 Comparar com mês passado</button>
      <div id="resultadoComparacao" style="margin-top:15px;"></div>
    `;
    document.getElementById('compDiario').addEventListener('click', () => comparar('diario'));
    document.getElementById('compMensal').addEventListener('click', () => comparar('mensal'));
  }

  function comparar(tipo) {
    const vendas = getVendas();
    const agora = new Date();
    const hoje = agora.toISOString().split('T')[0];
    let resultado = '';
    if (tipo === 'diario') {
      const ontem = new Date(agora);
      ontem.setDate(ontem.getDate() - 1);
      const ontemStr = ontem.toISOString().split('T')[0];
      const qtdHoje = vendas.filter(v => v.data === hoje).length;
      const qtdOntem = vendas.filter(v => v.data === ontemStr).length;
      resultado = `Hoje: ${qtdHoje} vendas | Ontem (mesmo horário): ${qtdOntem} vendas.`;
    } else {
      const mesAtual = agora.getMonth();
      const anoAtual = agora.getFullYear();
      let mesPassado = mesAtual === 0 ? 11 : mesAtual - 1;
      let anoMesPassado = mesAtual === 0 ? anoAtual - 1 : anoAtual;
      const filtroMes = v => { const d = new Date(v.data); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual; };
      const filtroMesPass = v => { const d = new Date(v.data); return d.getMonth() === mesPassado && d.getFullYear() === anoMesPassado; };
      const qtdMes = vendas.filter(filtroMes).length;
      const qtdMesPass = vendas.filter(filtroMesPass).length;
      resultado = `Mês atual: ${qtdMes} vendas | Mês passado (até o dia de hoje): ${qtdMesPass} vendas.`;
    }
    document.getElementById('resultadoComparacao').innerHTML = `<p><strong>${resultado}</strong></p>`;
  }

  function adicionarVendedor(e) {
    e.preventDefault();
    const nome = document.getElementById('novoNome').value.trim();
    const email = document.getElementById('novoEmail').value.trim();
    const equipe = document.getElementById('novoEquipe').value.trim();
    const usuario = document.getElementById('novoUsuario').value.trim();
    const senha = document.getElementById('novoSenha').value;
    if (!nome || !email || !equipe || !usuario || !senha) return alert('Preencha todos os campos.');
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

  function abrirModalExcluir() {
    document.getElementById('modalExcluirVendedor').style.display = 'flex';
    document.getElementById('msgExclusao').textContent = '';
    atualizarSelectVendedores();
  }

  function confirmarExclusao() {
    const id = document.getElementById('selectExcluirVendedor').value;
    if (!id) return alert('Selecione um vendedor.');
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
    document.getElementById('msgExclusao').textContent = 'Vendedor movido para lixeira (15 dias).';
    setTimeout(() => {
      const lixeiraAtual = getLixeira().filter(v => v.id != excluido.id);
      salvarLixeira(lixeiraAtual);
    }, 15 * 24 * 60 * 60 * 1000);
  }

  function gerarRelatorioVendedor() {
    const vendedorId = document.getElementById('selectVendedorRelatorio').value;
    const mes = document.getElementById('selectMesRelatorio').value;
    if (!vendedorId || mes === '') return alert('Selecione vendedor e mês.');
    const vendas = getVendas().filter(v => {
      if (v.vendedorId != vendedorId) return false;
      const data = new Date(v.data);
      return data.getMonth() == mes && data.getFullYear() == new Date().getFullYear();
    });
    const div = document.getElementById('resultadoRelatorioVendedor');
    div.innerHTML = vendas.length ? `<ul>${vendas.map(v => `<li>${v.data} - ${v.nomeCliente} - ${v.produto}</li>`).join('')}</ul>` : '<p>Nenhuma venda encontrada.</p>';
  }

  function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
  function fecharModais() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }
});
