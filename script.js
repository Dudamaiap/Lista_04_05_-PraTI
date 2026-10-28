document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js');
  const GITHUB_USUARIO = 'Dudamaiap';

  // ---------- Menu mobile ----------
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    const aberto = links.classList.toggle('aberto');
    toggle.setAttribute('aria-expanded', String(aberto));
    toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });

  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      links.classList.remove('aberto');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    })
  );

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && links.classList.contains('aberto')) {
      links.classList.remove('aberto');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      toggle.focus();
    }
  });
  const inputNome = document.getElementById('nome');

  // ---------- API do GitHub: repositórios ----------
  const reposContainer = document.getElementById('repos');

  function mostrarStatusRepos(texto) {
    reposContainer.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'repos-status';
    p.textContent = texto;
    reposContainer.appendChild(p);
  }

  function criarCardRepo(repo) {
    const card = document.createElement('a');
    card.className = 'card card-repo';
    card.href = repo.html_url;
    card.target = '_blank';
    card.rel = 'noopener';

    const titulo = document.createElement('h3');
    titulo.textContent = repo.name;

    const descricao = document.createElement('p');
    descricao.textContent = repo.description || 'Sem descrição.';

    const meta = document.createElement('p');
    meta.className = 'card-tags';
    meta.textContent = [repo.language, `★ ${repo.stargazers_count}`].filter(Boolean).join(' · ');

    card.append(titulo, descricao, meta);
    return card;
  }

  async function carregarRepos() {
    try {
      const resposta = await fetch(`https://api.github.com/users/${GITHUB_USUARIO}/repos?sort=updated&per_page=100`);
      if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

      const repos = await resposta.json();
      const lista = repos.filter((repo) => !repo.fork).slice(0, 6);

      if (lista.length === 0) {
        mostrarStatusRepos('Nenhum repositório público encontrado.');
        return;
      }

      reposContainer.innerHTML = '';
      lista.forEach((repo) => reposContainer.appendChild(criarCardRepo(repo)));
    } catch (erro) {
      mostrarStatusRepos('Não foi possível carregar os repositórios agora. Use o botão abaixo para vê-los no GitHub.');
    }
  }

  carregarRepos();

  // ---------- ViaCEP ----------
  const inputCep = document.getElementById('cep');
  const inputCidade = document.getElementById('cidade');
  const cepStatus = document.getElementById('cep-status');

  function definirStatus(texto, tipo = '') {
    cepStatus.textContent = texto;
    cepStatus.className = `cep-status ${tipo}`;
  }

  let consultaCep = 0;

  async function buscarCep(cep, consulta) {
    definirStatus('Buscando endereço...');
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!resposta.ok) throw new Error('Falha na requisição');

      const dados = await resposta.json();
      if (consulta !== consultaCep) return;
      if (dados.erro || !dados.localidade || !dados.uf) {
        inputCidade.value = '';
        definirStatus('CEP não encontrado.', 'erro');
        return;
      }

      inputCidade.value = `${dados.localidade} - ${dados.uf}`;
      const endereco = [dados.logradouro, dados.bairro].filter(Boolean).join(', ');
      definirStatus(endereco || 'Endereço encontrado.', 'ok');
    } catch (erro) {
      if (consulta !== consultaCep) return;
      inputCidade.value = '';
      definirStatus('Não foi possível consultar o CEP. Tente novamente.', 'erro');
    }
  }

  inputCep.addEventListener('input', () => {
    const digitos = inputCep.value.replace(/\D/g, '').slice(0, 8);
    inputCep.value = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;

    const consulta = ++consultaCep;
    inputCidade.value = '';
    if (digitos.length === 8) {
      buscarCep(digitos, consulta);
    } else {
      inputCidade.value = '';
      definirStatus('');
    }
  });

  // ---------- Envio do formulário ----------
  const form = document.getElementById('form-contato');
  const msgSucesso = document.getElementById('mensagem-sucesso');

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!inputCidade.value) {
      definirStatus('Informe um CEP válido antes de enviar.', 'erro');
      inputCep.focus();
      return;
    }

    const nome = inputNome.value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();
    if (nome.length < 2 || mensagem.length < 10) {
      msgSucesso.textContent = 'Preencha seu nome e uma mensagem com pelo menos 10 caracteres.';
      msgSucesso.classList.add('visivel');
      (nome.length < 2 ? inputNome : document.getElementById('mensagem')).focus();
      return;
    }
    const email = document.getElementById('email').value.trim();
    const assunto = encodeURIComponent('Contato pelo portfólio — ' + nome);
    const corpo = encodeURIComponent([
      'Nome: ' + nome,
      'E-mail: ' + email,
      'CEP: ' + inputCep.value,
      'Cidade / UF: ' + inputCidade.value,
      '', mensagem
    ].join('\n'));
    window.location.href = 'mailto:dudamaiapereira@gmail.com?subject=' + assunto + '&body=' + corpo;
    msgSucesso.textContent = 'Seu aplicativo de e-mail foi solicitado. Conclua o envio nele. Se não abrir, use o endereço de e-mail acima. Seus dados continuam preenchidos.';
    msgSucesso.classList.add('visivel');
  });

  // ---------- Ano no rodapé ----------
  document.getElementById('ano').textContent = new Date().getFullYear();
});
