// ─────────────────────────────────────────
// 1. DADOS — lista de prestadores
// ─────────────────────────────────────────
const prestadores = [
  { id:1, nome:'Carlos Eduardo', emoji:'⚡', categoria:'Elétrica',  tags:['Instalação','Quadro'], avaliacao:4.9, preco:120, distancia:1.2, melhor:true  },
  { id:2, nome:'Roberto Silva',  emoji:'🚰', categoria:'Hidráulica', tags:['Vazamento','Box'],     avaliacao:4.7, preco:90,  distancia:2.5, melhor:false },
  { id:3, nome:'Ana Pinturas',   emoji:'🖌️', categoria:'Pintura',    tags:['Textura','Externa'],   avaliacao:4.8, preco:65,  distancia:0.8, melhor:false },
  { id:4, nome:'Verde Jardim',   emoji:'🌿', categoria:'Jardim',     tags:['Corte','Paisagismo'],  avaliacao:4.6, preco:80,  distancia:1.5, melhor:false },
];

// ─────────────────────────────────────────
// 2. ESTADO — o que está acontecendo agora
// ─────────────────────────────────────────
let selecionados  = [];          // prestadores marcados para comparar
let ordemAtual    = 'avaliacao'; // critério de ordenação


// ─────────────────────────────────────────
// 3. NAVEGAÇÃO — troca a página visível
// ─────────────────────────────────────────
function mostrar(id) {
  document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
  if (id === 'buscar')   filtrar();
  if (id === 'comparar') renderComparar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ─────────────────────────────────────────
// 4. CARD — monta o HTML de um prestador
// ─────────────────────────────────────────
function card(p) {
  const marcado = selecionados.some(s => s.id === p.id);
  return `
    <div class="card">
      ${p.melhor ? '<div class="badge">⭐ Melhor custo</div>' : ''}

      <div class="d-flex gap-3 align-items-start mb-3">
        <div class="avatar">${p.emoji}</div>
        <div>
          <div style="font-weight:700">${p.nome}</div>
          <div class="estrelas">${'★'.repeat(Math.floor(p.avaliacao))}</div>
          <div style="font-size:.75rem;color:var(--sub)">${p.avaliacao} · ${p.categoria}</div>
          <div class="mt-1">${p.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div>
        </div>
      </div>

      <div class="linha"></div>

      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="preco">R$${p.preco}<small>/h</small></div>
          <div style="font-size:.72rem;color:var(--sub)">📍 ${p.distancia}km</div>
        </div>
        <label style="font-size:.8rem;color:var(--sub);cursor:pointer;display:flex;align-items:center;gap:5px">
          <input type="checkbox" ${marcado ? 'checked' : ''} onchange="marcar(${p.id}, this.checked)">
          Comparar
        </label>
      </div>
    </div>`;
}


// ─────────────────────────────────────────
// 5. HOME — exibe os 4 melhores avaliados
// ─────────────────────────────────────────
function renderHome() {
  const top4 = [...prestadores].sort((a, b) => b.avaliacao - a.avaliacao).slice(0, 4);
  document.getElementById('gradeHome').innerHTML = top4.map(card).join('');
}

// Botão buscar da home: passa o texto e vai para a página Buscar
function irBuscar() {
  const texto = document.getElementById('inputHome').value;
  mostrar('buscar');
  setTimeout(() => { document.getElementById('inputBusca').value = texto; filtrar(); }, 50);
}


// ─────────────────────────────────────────
// 6. BUSCA — filtra e ordena os prestadores
// ─────────────────────────────────────────
function filtrar() {
  const texto = document.getElementById('inputBusca').value.toLowerCase();
  const cat   = document.getElementById('selectCategoria').value;

  let lista = prestadores.filter(p =>
    (!texto || p.nome.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto)) &&
    (!cat   || p.categoria === cat)
  );

  // Ordena conforme o botão ativo
  lista.sort((a, b) => {
    if (ordemAtual === 'avaliacao') return b.avaliacao - a.avaliacao;
    if (ordemAtual === 'preco')     return a.preco     - b.preco;
    if (ordemAtual === 'distancia') return a.distancia - b.distancia;
  });

  document.getElementById('gradeBusca').innerHTML = lista.map(card).join('');
}

function ordenar(criterio) {
  ordemAtual = criterio;
  // Destaca o botão correto
  document.querySelectorAll('.pill').forEach(b => b.classList.remove('ativo'));
  document.getElementById('btn-' + criterio).classList.add('ativo');
  filtrar();
}


// ─────────────────────────────────────────
// 7. COMPARAÇÃO — gerencia a seleção
// ─────────────────────────────────────────
function marcar(id, checked) {
  if (checked) {
    if (selecionados.length >= 3) { toast('⚠️ Máximo 3 prestadores'); event.target.checked = false; return; }
    selecionados.push(prestadores.find(p => p.id === id));
  } else {
    selecionados = selecionados.filter(p => p.id !== id);
  }
  atualizarTray();
}

// Barra flutuante que aparece ao selecionar prestadores
function atualizarTray() {
  const tray = document.getElementById('tray');
  tray.classList.toggle('visivel', selecionados.length > 0);
  document.getElementById('trayTexto').textContent =
    selecionados.map(p => p.emoji + ' ' + p.nome.split(' ')[0]).join(' · ');
}

function limpar() {
  selecionados = [];
  atualizarTray();
  document.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);
  toast('🗑️ Seleção limpa');
}

// Monta a página de comparação com os selecionados
function renderComparar() {
  const aviso = document.getElementById('avisoComparar');
  const grade = document.getElementById('gradeComparar');

  if (selecionados.length < 2) {
    aviso.style.display = 'block'; grade.innerHTML = ''; return;
  }
  aviso.style.display = 'none';

  // O de maior avaliação ganha destaque
  const melhor = [...selecionados].sort((a, b) => b.avaliacao - a.avaliacao)[0];

  grade.innerHTML = selecionados.map(p => `
    <div class="card-comparar ${p.id === melhor.id ? 'melhor' : ''}">
      ${p.id === melhor.id ? '<div class="badge" style="position:relative;display:inline-block;margin-bottom:10px">🏆 Melhor opção</div>' : ''}
      <div style="font-size:2rem">${p.emoji}</div>
      <div style="font-weight:700;margin:8px 0 4px">${p.nome}</div>
      <div style="font-size:.8rem;color:var(--sub);margin-bottom:16px">${p.categoria}</div>

      <div class="linha-metrica"><span>Avaliação</span>  <strong>${p.avaliacao} ★</strong></div>
      <div class="linha-metrica"><span>Preço/hora</span> <strong>R$ ${p.preco}</strong></div>
      <div class="linha-metrica"><span>Distância</span>  <strong>${p.distancia} km</strong></div>

      <button class="btn-verde" style="width:100%;margin-top:14px"
        onclick="toast('📩 Orçamento solicitado para ${p.nome}!')">
        Solicitar orçamento
      </button>
    </div>`
  ).join('');
}


// ─────────────────────────────────────────
// 8. MODAL — abre e fecha o cadastro
// ─────────────────────────────────────────
function abrirModal() {
  document.getElementById('modal').classList.add('aberto');
}
function fecharModal(evento) {
  // Fecha ao clicar no fundo escuro, ou ao chamar direto
  if (!evento || evento.target.id === 'modal') {
    document.getElementById('modal').classList.remove('aberto');
  }
}


// ─────────────────────────────────────────
// 9. TOAST — notificação temporária
// ─────────────────────────────────────────
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}


// ─────────────────────────────────────────
// 10. INÍCIO — roda ao carregar a página
// ─────────────────────────────────────────
renderHome();
