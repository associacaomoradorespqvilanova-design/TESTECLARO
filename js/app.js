document.addEventListener('DOMContentLoaded', () => {

  // ---------- ELEMENTOS ----------
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');

  // Painéis
  const painelVendedor = document.getElementById('painelVendedor');
  const painelAdmin = document.getElementById('painelAdmin');

  // Mensagens de boas-vindas
  const bemVindoVendedor = document.getElementById('bemVindoVendedor');
  const bemVindoAdmin = document.getElementById('bemVindoAdmin');

  // Botões de logout
  const logoutVendedor = document.getElementById('logoutVendedor');
  const logoutAdmin = document.getElementById('logoutAdmin');

  // ---------- USUÁRIOS SIMULADOS (hash SHA-256) ----------
  // Senha: "1234" → hash: 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
  const USUARIOS = {
    'admin': {
      hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
      role: 'admin'
    },
    'vendedor1': {
      hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
      role: 'vendedor'
    },
    'vendedor2': {
      hash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
      role: 'vendedor'
    }
    // Adicione mais conforme necessário
  };

  // ---------- FUNÇÃO DE HASH SHA-256 ----------
  async function gerarHash(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ---------- LOGIN ----------
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuarioDigitado = document.getElementById('usuario').value.trim();
    const senhaDigitada = document.getElementById('senha').value;

    if (!usuarioDigitado || !senhaDigitada) {
      loginMsg.textContent = 'Preencha todos os campos.';
      return;
    }

    loginMsg.textContent = 'Verificando...';

    try {
      const hash = await gerarHash(senhaDigitada);
      const usuarioEncontrado = USUARIOS[usuarioDigitado];

      if (usuarioEncontrado && usuarioEncontrado.hash === hash) {
        // Login bem-sucedido, redireciona conforme o papel
        loginScreen.style.display = 'none';
        appScreen.style.display = 'block';

        if (usuarioEncontrado.role === 'admin') {
          painelAdmin.style.display = 'block';
          painelVendedor.style.display = 'none';
          bemVindoAdmin.textContent = `Bem-vindo, ${usuarioDigitado} (Admin)!`;
          ativarSecaoAdmin('home-admin');
        } else {
          painelVendedor.style.display = 'block';
          painelAdmin.style.display = 'none';
          bemVindoVendedor.textContent = `Bem-vindo, ${usuarioDigitado}!`;
          ativarSecaoVendedor('home-vendedor');
        }
      } else {
        loginMsg.textContent = 'Usuário ou senha inválidos.';
      }
    } catch (erro) {
      loginMsg.textContent = 'Erro ao processar login.';
      console.error(erro);
    }
  });

  // ---------- LOGOUT (vendedor) ----------
  logoutVendedor.addEventListener('click', () => logout());
  // ---------- LOGOUT (admin) ----------
  logoutAdmin.addEventListener('click', () => logout());

  function logout() {
    // Oculta todos os painéis
    painelVendedor.style.display = 'none';
    painelAdmin.style.display = 'none';
    // Mostra tela de login
    appScreen.style.display = 'none';
    loginScreen.style.display = 'block';
    loginForm.reset();
    loginMsg.textContent = '';
  }

  // ---------- NAVEGAÇÃO DO MENU (VENDEDOR) ----------
  const menuVendedor = document.querySelectorAll('#painelVendedor .sidebar a[data-section]');
  menuVendedor.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const secao = link.getAttribute('data-section');
      ativarSecaoVendedor(secao);
      // Destacar link ativo
      menuVendedor.forEach(l => l.classList.remove('ativo'));
      link.classList.add('ativo');
    });
  });

  function ativarSecaoVendedor(id) {
    const secoes = document.querySelectorAll('#painelVendedor .secao');
    secoes.forEach(sec => sec.classList.remove('ativa'));
    const secaoAtiva = document.getElementById(`secao-${id}`);
    if (secaoAtiva) secaoAtiva.classList.add('ativa');
  }

  // ---------- NAVEGAÇÃO DO MENU (ADMIN) ----------
  const menuAdmin = document.querySelectorAll('#painelAdmin .sidebar a[data-section]');
  menuAdmin.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const secao = link.getAttribute('data-section');
      ativarSecaoAdmin(secao);
      menuAdmin.forEach(l => l.classList.remove('ativo'));
      link.classList.add('ativo');
    });
  });

  function ativarSecaoAdmin(id) {
    const secoes = document.querySelectorAll('#painelAdmin .secao');
    secoes.forEach(sec => sec.classList.remove('ativa'));
    const secaoAtiva = document.getElementById(`secao-${id}`);
    if (secaoAtiva) secaoAtiva.classList.add('ativa');
  }

});
