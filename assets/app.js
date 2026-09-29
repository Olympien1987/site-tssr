// ==========================================================
// TSSR Lab – fonctions communes à toutes les pages
// ==========================================================
(function(){
  const root = document.documentElement;

  // ---- Stockage local (ne plante pas si le navigateur le bloque) ----
  function store(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
  function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function loadJ(k, d){ try{ const v = JSON.parse(load(k)); return v == null ? d : v; }catch(e){ return d; } }
  function saveJ(k, v){ store(k, JSON.stringify(v)); }

  // ---- Thème (appliqué au plus tôt pour éviter le flash) ----
  const t = load('theme'); if(t) root.setAttribute('data-theme', t);
  function toggleTheme(){
    const cur = root.getAttribute('data-theme');
    const dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const n = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', n); store('theme', n);
  }

  // ---- En-tête commun ----
  const PAGES = [
    ['index.html',    'accueil',  '🏠', 'Accueil'],
    ['diag.html',     'diag',     '🔎', 'Diagnostic'],
    ['commandes.html','cmds',     '⌨️', 'Commandes'],
    ['revision.html', 'revision', '📚', 'Révision'],
    ['examen.html',   'examen',   '🎓', 'Examen blanc'],
    ['memo.html',     'memo',     '🛠️', 'Mémo'],
  ];
  function buildHeader(){
    const h = document.getElementById('site-head');
    if(!h) return;
    const page = h.dataset.page;
    // Les éléments propres à la page (onglets, recherche) sont déplacés, pas recopiés :
    // ils gardent ainsi les gestionnaires d'événements déjà posés.
    const sub = [...h.childNodes];
    h.className = 'site-head';
    h.innerHTML =
      '<div class="in">' +
        '<a class="brand" href="index.html"><span class="logo">T</span><span class="name">TSSR Lab</span></a>' +
        '<nav class="mainnav">' + PAGES.map(p =>
          `<a href="${p[0]}"${p[1] === page ? ' class="on" aria-current="page"' : ''}>${p[2]} ${p[3]}</a>`).join('') +
        '</nav>' +
        '<button class="iconbtn" id="themeBtn" title="Changer de thème" aria-label="Changer de thème">🌓</button>' +
      '</div>';
    if(sub.some(n => n.nodeType === 1)){
      const bar = document.createElement('div'); bar.className = 'subbar';
      sub.forEach(n => bar.appendChild(n));
      h.appendChild(bar);
    }
    document.getElementById('themeBtn').onclick = toggleTheme;
    const on = h.querySelector('.mainnav a.on');
    if(on) on.scrollIntoView({inline:'center', block:'nearest'});
  }

  // ---- Petit message temporaire ----
  let toastEl, toastT;
  function toast(msg){
    if(!toastEl){ toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role','status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  // ---- Confirmation (remplace confirm()) ----
  function ask(msg, okLabel){
    return new Promise(res => {
      const m = document.createElement('div'); m.className = 'modal';
      m.innerHTML = `<div class="box" role="dialog" aria-modal="true"><p></p><div class="bar" style="justify-content:flex-end">
        <button class="no">Annuler</button><button class="pri yes"></button></div></div>`;
      m.querySelector('p').textContent = msg;
      m.querySelector('.yes').textContent = okLabel || 'Confirmer';
      const close = v => { m.remove(); res(v); };
      m.querySelector('.no').onclick = () => close(false);
      m.querySelector('.yes').onclick = () => close(true);
      m.onclick = e => { if(e.target === m) close(false); };
      document.body.appendChild(m); m.querySelector('.yes').focus();
    });
  }

  // ---- Copier dans le presse-papier ----
  function copy(txt, btn){
    const done = () => {
      toast('Copié ✓');
      if(btn){ const o = btn.textContent; btn.textContent = '✓'; setTimeout(() => btn.textContent = o, 1100); }
    };
    const fallback = () => {
      const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); done(); }catch(e){}
      ta.remove();
    };
    if(navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(done, fallback);
    else fallback();
  }
  // Ajoute un bouton « Copier » à chaque <pre> d'un conteneur
  function addCopyButtons(scope){
    (scope || document).querySelectorAll('pre').forEach(p => {
      if(p.querySelector('.cp')) return;
      const b = document.createElement('button'); b.className = 'cp'; b.textContent = 'Copier';
      b.onclick = () => copy(p.querySelector('code') ? p.querySelector('code').textContent : p.textContent, b);
      p.appendChild(b);
    });
  }

  // ---- Variables d'examen partagées ({{FQDN}}, {{SRV}}…) ----
  const VAR_DEFAULTS = {FQDN:'domaine.local', NB:'DOMAINE', SRV:'SRV-DC1', IPSRV:'192.168.10.10', NET:'192.168.10', GW:'192.168.10.254', USER:'jdupont', SHARE:'Compta',
    LIN:'192.168.10.20', CLU:'CLUSTER01', NODE1:'NOEUD1', NODE2:'NOEUD2', VM:'VM-SRV01', NAS:'192.168.10.50'};
  const VAR_LABELS = {FQDN:'Domaine (FQDN)', NB:'Nom NetBIOS', SRV:'Serveur (DC)', IPSRV:'IP du DC', NET:'Réseau (3 octets)', GW:'Passerelle', USER:'Utilisateur test', SHARE:'Partage',
    LIN:'IP serveur Linux', CLU:'Nom du cluster', NODE1:'Nœud 1', NODE2:'Nœud 2', VM:'VM Hyper-V', NAS:'IP du NAS (iSCSI)'};
  function vars(){
    const v = {};
    Object.keys(VAR_DEFAULTS).forEach(k => v[k] = load('v_' + k) || VAR_DEFAULTS[k]);
    v.DN = v.FQDN.split('.').filter(Boolean).map(p => 'DC=' + p).join(',');
    return v;
  }
  function fill(tpl, v){ return tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => v[k] !== undefined ? v[k] : m); }

  // ---- Utilitaires ----
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function shuffle(a){ for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const fmt = n => (Math.round(n * 10) / 10).toString().replace('.', ',');

  // Date de l'examen (modifiable depuis l'accueil)
  function examDate(){ return load('examDate') || '2026-10-08'; }

  // Panneau de saisie des variables (dans un conteneur .vars) ; onChange appelé à chaque frappe
  function varsPanel(el, keys, onChange){
    keys = keys || Object.keys(VAR_DEFAULTS);
    el.innerHTML = keys.map(k => `<label>${VAR_LABELS[k]}<input data-v="${k}" value="${esc(load('v_' + k) || VAR_DEFAULTS[k])}" spellcheck="false"></label>`).join('');
    el.querySelectorAll('input').forEach(i => i.addEventListener('input', () => { store('v_' + i.dataset.v, i.value.trim()); if(onChange) onChange(); }));
  }

  window.TSSR = {store, load, loadJ, saveJ, toast, ask, copy, addCopyButtons, vars, fill, VAR_DEFAULTS, VAR_LABELS, varsPanel, norm, esc, shuffle, fmt, examDate};

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildHeader);
  else buildHeader();

  // « / » place le curseur dans la recherche de la page
  document.addEventListener('keydown', e => {
    const q = document.querySelector('[data-search]');
    if(e.key === '/' && q && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ e.preventDefault(); q.focus(); }
  });
})();
