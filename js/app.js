
document.addEventListener('DOMContentLoaded', () => {

  // ---------- ELEMENTOS ----------
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');
  const logoutBtn = document.getElementById('logoutBtn');

  // Links do menu
  const menuLinks = document.querySelectorAll('.sidebar a[data-section]');
  // Seções de conteúdo
  const secoes = document.querySelectorAll('.secao');

  // ---------- LOGIN (simulado) ----------
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    // Simulação – depois será substituída pela chamada à API do Google Sheets
    if (usuario === 'admin' && senha === '1234') {
      loginScreen.style.display = 'none';
      appScreen.style.display = 'block';
      // Ativar primeira seção (Clientes)
      ativarSecao('clientes');
    } else {
      loginMsg.textContent = 'Usuário ou senha inválidos.';
    }
  });

  // ---------- LOGOUT ----------
  logoutBtn.addEventListener('click', () => {
    appScreen.style.display = 'none';
    loginScreen.style.display = 'block';
    loginForm.reset();
    loginMsg.textContent = '';
  });

  // ---------- NAVEGAÇÃO DO MENU ----------
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const secao = link.getAttribute('data-section');
      ativarSecao(secao);

      // Destacar link ativo
      menuLinks.forEach(l => l.classList.remove('ativo'));
      link.classList.add('ativo');
    });
  });

  function ativarSecao(id) {
    secoes.forEach(sec => sec.classList.remove('ativa'));
    const secaoAtiva = document.getElementById(`secao-${id}`);
    if (secaoAtiva) secaoAtiva.classList.add('ativa');
  }

  // ============================================================
  // FUTURAS FUNÇÕES DE INTEGRAÇÃO COM A API DO GOOGLE SHEETS
  // Exemplo:
  // async function carregarClientes() {
  //   const resposta = await fetch(URL_API, { method: 'POST', ... });
  //   const dados = await resposta.json();
  //   // popular listaClientes
  // }
  // ============================================================

});
