document.addEventListener('DOMContentLoaded', () => {
  const GITHUB_USUARIO = 'Dudamaiap';

  // ---------- Menu mobile ----------
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    const aberto = links.classList.toggle('aberto');
    toggle.setAttribute('aria-expanded', aberto);
  });

  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      links.classList.remove('aberto');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  // ---------- CTA: rola até o formulário ----------
  const ctaBtn = document.getElementById('cta-btn');
  const secaoContato = document.getElementById('contato');
  const inputNome = document.getElementById('nome');

  ctaBtn.addEventListener('click', () => {
    secaoContato.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => inputNome.focus({ preventScroll: true }), 700);
  });

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

  async function buscarCep(cep) {
    definirStatus('Buscando endereço...');
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!resposta.ok) throw new Error('Falha na requisição');

      const dados = await resposta.json();
      if (dados.erro) {
        inputCidade.value = '';
        definirStatus('CEP não encontrado.', 'erro');
        return;
      }

      inputCidade.value = `${dados.localidade} - ${dados.uf}`;
      const endereco = [dados.logradouro, dados.bairro].filter(Boolean).join(', ');
      definirStatus(endereco || 'Endereço encontrado.', 'ok');
    } catch (erro) {
      inputCidade.value = '';
      definirStatus('Não foi possível consultar o CEP. Tente novamente.', 'erro');
    }
  }

  inputCep.addEventListener('input', () => {
    const digitos = inputCep.value.replace(/\D/g, '').slice(0, 8);
    inputCep.value = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;

    if (digitos.length === 8) {
      buscarCep(digitos);
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

    const primeiroNome = inputNome.value.trim().split(' ')[0];
    msgSucesso.textContent = `Obrigada pelo contato, ${primeiroNome}! Sua mensagem foi recebida e retornarei em breve.`;
    msgSucesso.classList.add('visivel');

    form.reset();
    definirStatus('');
    setTimeout(() => msgSucesso.classList.remove('visivel'), 6000);
  });

  // ---------- Ano no rodapé ----------
  document.getElementById('ano').textContent = new Date().getFullYear();
});
