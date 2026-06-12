document.addEventListener('DOMContentLoaded', () => {

  // ---------- ELEMENTOS ----------
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');
  const loginForm = document.getElementById('loginForm');
  const loginMsg = document.getElementById('loginMsg');

  const painelVendedor = document.getElementById('painelVendedor');
  const painelAdmin = document.getElementById('painelAdmin');

  const bemVindoVendedor = document.getElementById('bemVindoVendedor');
  const bemVindoAdmin = document.getElementById('bemVindoAdmin');

  const logoutVendedor = document.getElementById('logoutVendedor');
  const logoutAdmin = document.getElementById('logoutAdmin');

  // Verificação de elementos essenciais
  if (!loginForm || !loginScreen || !appScreen || !painelVendedor || !painelAdmin) {
    console.error('Erro: estrutura HTML incompleta. Verifique os IDs.');
    return;
  }

  // ---------- USUÁRIOS SIMULADOS ----------
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

      console.log('Usuário digitado:', usuarioDigitado);
      console.log('Hash gerado:', hash);
      console.log('Dados encontrados:', usuarioEncontrado);

      if (usuarioEncontrado && usuarioEncontrado.hash === hash) {
        // Esconde tela de login e mostra container do app
        loginScreen.style.display = 'none';
        appScreen.style.display = 'block';

        if (usuarioEncontrado.role === 'admin') {
          painelAdmin.style.display = 'block';
          painelVendedor.style.display = 'none';
          if (bemVindoAdmin) bemVindoAdmin.textContent = `Bem-vindo, ${usuarioDigitado} (Admin)!`;
          ativarSecaoAdmin('home-admin');
          console.log('Painel admin exibido');
        } else {
          painelVendedor.style.display = 'block';
          painelAdmin.style.display = 'none';
          if (bemVindoVendedor) bemVindoVendedor.textContent = `Bem-vindo, ${usuarioDigitado}!`;
          ativarSecaoVendedor('home-vendedor');
          console.log('Painel vendedor exibido');
        }
      } else {
        loginMsg.textContent = 'Usuário ou senha inválidos.';
        console.log('Falha na autenticação');
      }
    } catch (erro) {
      loginMsg.textContent = 'Erro ao processar login.';
      console.error('Erro no login:', erro);
    }
  });

  // ---------- LOGOUT ----------
  if (logoutVendedor) logoutVendedor.addEventListener('click', logout);
  if (logoutAdmin) logoutAdmin.addEventListener('click', logout);

  function logout() {
    painelVendedor.style.display = 'none';
    painelAdmin.style.display = 'none';
    appScreen.style.display = 'none';
    loginScreen.style.display = 'block';
    loginForm.reset();
    loginMsg.textContent = '';
    console.log('Logout realizado');
  }

  // ---------- NAVEGAÇÃO (VENDEDOR) ----------
  const menuVendedor = document.querySelectorAll('#painelVendedor .sidebar a[data-section]');
  menuVendedor.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const secao = link.getAttribute('data-section');
      ativarSecaoVendedor(secao);
      menuVendedor.forEach(l => l.classList.remove('ativo'));
      link.classList.add('ativo');
    });
  });

  function ativarSecaoVendedor(id) {
    const secoes = document.querySelectorAll('#painelVendedor .secao');
    secoes.forEach(sec => sec.classList.remove('ativa'));
    const secaoAtiva = document.getElementById(`secao-${id}`);
    if (secaoAtiva) {
      secaoAtiva.classList.add('ativa');
      console.log('Seção vendedor ativada:', id);
    } else {
      console.error('Seção não encontrada:', `secao-${id}`);
    }
  }

  // ---------- NAVEGAÇÃO (ADMIN) ----------
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
    if (secaoAtiva) {
      secaoAtiva.classList.add('ativa');
      console.log('Seção admin ativada:', id);
    } else {
      console.error('Seção não encontrada:', `secao-${id}`);
    }
  }

});
