// ==========================================================
// Moteur de QCM
//   TSSR.runQCM(conteneur, questions, {mode:'train'|'exam', title, onFinish(result), onQuit})
//   - train : correction immédiate après chaque réponse
//   - exam  : navigation libre, correction à la fin
// Statistiques par question enregistrées dans localStorage « qcm_stats ».
// ==========================================================
(function(){
  const {esc, shuffle, loadJ, saveJ, fmt} = TSSR;
  const LETTERS = 'ABCD';

  function statsKey(q){ return q.q.slice(0, 80); }
  function record(q, ok){
    const s = loadJ('qcm_stats', {}), k = statsKey(q);
    s[k] = s[k] || {ok:0, ko:0};
    ok ? s[k].ok++ : s[k].ko++;
    saveJ('qcm_stats', s);
  }
  // Questions ratées plus souvent que réussies
  function weakOnes(bank){
    const s = loadJ('qcm_stats', {});
    return bank.filter(q => { const x = s[statsKey(q)]; return x && x.ko > 0 && x.ko >= x.ok; });
  }
  function seenCount(bank){
    const s = loadJ('qcm_stats', {});
    return bank.filter(q => s[statsKey(q)]).length;
  }

  function prepare(list){
    return list.map(q => ({src:q, t:q.t, q:q.q, e:q.e,
      opts: shuffle(q.o.map((txt, i) => ({txt, right:i === q.a})))}));
  }

  function runQCM(box, list, opt){
    opt = opt || {};
    const mode = opt.mode || 'train';
    const Q = prepare(list);
    const ans = Q.map(() => null);     // index de l'option choisie
    let idx = 0, done = false;

    function scoreOf(){ return Q.reduce((s, q, i) => s + (ans[i] != null && q.opts[ans[i]].right ? 1 : 0), 0); }
    function answered(){ return ans.filter(a => a != null).length; }

    function render(){
      const q = Q[idx], a = ans[idx];
      const reveal = done || (mode === 'train' && a != null);
      const good = mode === 'train' ? Q.slice(0, idx + 1).filter((x, i) => ans[i] != null && x.opts[ans[i]].right).length : null;
      box.innerHTML = `<div class="card qcm">
        <div class="qhead">
          <span class="pill">Question ${idx + 1} / ${Q.length}</span>
          <span class="muted">${esc(q.t)}</span>
          <span class="spacer"></span>
          ${mode === 'train' ? `<span class="pill ok">${good} bonne${good > 1 ? 's' : ''}</span>` : `<span class="muted">${answered()} / ${Q.length} répondues</span>`}
        </div>
        <div class="prog" style="margin-bottom:12px"><i style="width:${(idx + 1) / Q.length * 100}%"></i></div>
        <div class="qtext">${esc(q.q)}</div>
        <div class="opts">${q.opts.map((o, i) => {
          let c = 'opt';
          if(reveal){ if(o.right) c += ' right'; else if(a === i) c += ' wrong'; }
          else if(a === i) c += ' sel';
          return `<button class="${c}" data-i="${i}" ${reveal ? 'disabled' : ''}><span class="k">${LETTERS[i]}</span><span>${esc(o.txt)}</span></button>`;
        }).join('')}</div>
        ${reveal ? `<div class="expl ${a != null && q.opts[a].right ? 'okbox' : 'badbox'}"><b>${a == null ? 'Pas de réponse.' : q.opts[a].right ? 'Bonne réponse.' : 'Raté.'}</b> ${esc(q.e || '')}</div>` : ''}
        <div class="bar" style="margin-top:14px">
          <button id="qPrev" ${idx === 0 ? 'disabled' : ''}>← Précédente</button>
          ${idx < Q.length - 1
            ? `<button class="pri" id="qNext" ${mode === 'train' && a == null && !done ? 'disabled' : ''}>Suivante →</button>`
            : (done ? '' : `<button class="pri" id="qEnd" ${mode === 'train' && a == null ? 'disabled' : ''}>Terminer</button>`)}
          <span class="spacer"></span>
          ${done ? '<button id="qBack">Retour au résultat</button>' : (opt.onQuit ? '<button id="qQuit">Abandonner</button>' : '')}
        </div>
        ${mode === 'exam' || done ? `<div class="dots" style="margin-top:14px">${Q.map((x, i) => {
          let c = i === idx ? 'cur' : '';
          if(done) c += ans[i] != null && x.opts[ans[i]].right ? ' right' : ' wrong';
          else if(ans[i] != null) c += ' ans';
          return `<button class="${c}" data-go="${i}">${i + 1}</button>`;
        }).join('')}</div>` : ''}
        <p class="muted" style="margin:10px 0 0">Raccourcis : touches A B C D (ou 1 à 4) pour répondre, Entrée pour passer à la suivante.</p>
      </div>`;
      box.querySelectorAll('.opt').forEach(b => b.onclick = () => choose(+b.dataset.i));
      box.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { idx = +b.dataset.go; render(); });
      const p = box.querySelector('#qPrev'), n = box.querySelector('#qNext'), e = box.querySelector('#qEnd');
      if(p) p.onclick = () => { idx--; render(); };
      if(n) n.onclick = () => { idx++; render(); };
      if(e) e.onclick = finish;
      const bk = box.querySelector('#qBack'); if(bk) bk.onclick = results;
      const qt = box.querySelector('#qQuit'); if(qt) qt.onclick = () => TSSR.ask('Abandonner ce QCM ? Tes réponses seront perdues.', 'Abandonner').then(ok => { if(ok){ detach(); opt.onQuit(); } });
    }

    function choose(i){
      if(done) return;
      if(mode === 'train'){
        if(ans[idx] != null) return;
        ans[idx] = i; record(Q[idx].src, Q[idx].opts[i].right);
      } else {
        ans[idx] = i;
        if(idx < Q.length - 1){ render(); setTimeout(() => { idx++; render(); }, 180); return; }
      }
      render();
    }

    function finish(){
      if(mode === 'exam'){
        const miss = Q.length - answered();
        if(miss > 0 && !opt._force){
          TSSR.ask(`Il reste ${miss} question${miss > 1 ? 's' : ''} sans réponse. Terminer quand même ?`, 'Terminer').then(ok => { if(ok){ opt._force = true; finish(); } });
          return;
        }
        Q.forEach((q, i) => record(q.src, ans[i] != null && q.opts[ans[i]].right));
      }
      done = true; results();
    }

    function results(){
      const s = scoreOf(), n = Q.length, on20 = s / n * 20;
      const byT = {};
      Q.forEach((q, i) => { byT[q.t] = byT[q.t] || [0, 0]; byT[q.t][1]++; if(ans[i] != null && q.opts[ans[i]].right) byT[q.t][0]++; });
      const wrong = Q.map((q, i) => ({q, i})).filter(x => !(ans[x.i] != null && x.q.opts[ans[x.i]].right));
      const verdict = on20 >= 14 ? ['ok', 'Très bien, continue comme ça.'] : on20 >= 10 ? ['warn', 'Correct, retravaille les thèmes en rouge.'] : ['bad', 'À retravailler : refais les questions ratées.'];
      box.innerHTML = `<div class="card">
        <h2>${esc(opt.title || 'Résultat')}</h2>
        <div class="bar" style="gap:24px;margin:6px 0 12px">
          <div class="stat"><b>${fmt(on20)} / 20</b><span>${s} bonne${s > 1 ? 's' : ''} réponse${s > 1 ? 's' : ''} sur ${n}</span></div>
          ${opt.elapsed ? `<div class="stat"><b>${opt.elapsed()}</b><span>temps utilisé</span></div>` : ''}
        </div>
        <div class="${verdict[0] === 'ok' ? 'okbox' : verdict[0] === 'bad' ? 'badbox' : 'tip'}">${verdict[1]}</div>
        <h3>Par thème</h3>
        <div style="display:flex;flex-direction:column;gap:8px">${Object.keys(byT).map(t => {
          const [g, tot] = byT[t], r = g / tot;
          return `<div><div class="bar" style="justify-content:space-between"><span>${esc(t)}</span><span class="muted">${g} / ${tot}</span></div>
            <div class="prog ${r >= .7 ? 'ok' : ''}"><i style="width:${r * 100}%;${r < .5 ? 'background:var(--bad)' : ''}"></i></div></div>`;
        }).join('')}</div>
        ${wrong.length ? `<h3>Questions ratées (${wrong.length})</h3>` + wrong.map(x => {
          const a = ans[x.i], right = x.q.opts.find(o => o.right);
          return `<details><summary>${x.i + 1}. ${esc(x.q.q)}</summary>
            <p style="margin:6px 0">${a == null ? '<span class="pill warn">sans réponse</span>' : `Ta réponse : <span class="pill bad">${esc(x.q.opts[a].txt)}</span>`}<br>
            Bonne réponse : <span class="pill ok">${esc(right.txt)}</span></p><p class="muted" style="margin:0">${esc(x.q.e || '')}</p></details>`;
        }).join('') : ''}
        <div class="bar" style="margin-top:14px">
          <button id="rReview">Revoir question par question</button>
          ${wrong.length ? '<button class="pri" id="rRetry">Refaire les ratées</button>' : ''}
          <button id="rClose">Terminer</button>
        </div>
      </div>`;
      box.querySelector('#rReview').onclick = () => { idx = 0; render(); };
      const rr = box.querySelector('#rRetry');
      if(rr) rr.onclick = () => { detach(); runQCM(box, wrong.map(x => x.q.src), {mode:'train', title:'Reprise des questions ratées', onFinish:opt.retryFinish, onQuit:opt.onQuit}); };
      box.querySelector('#rClose').onclick = () => { detach(); if(opt.onQuit) opt.onQuit(); };
      box.scrollIntoView({block:'start'});
      if(opt.onFinish && !results.called){ results.called = true; opt.onFinish({score:s, total:n, on20, byTheme:byT}); }
    }

    function key(e){
      if(!document.body.contains(box) || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.querySelector('.modal')) return;
      if(!box.querySelector('.qcm') || !box.offsetParent) return;
      const k = e.key.toUpperCase(), i = LETTERS.indexOf(k) > -1 ? LETTERS.indexOf(k) : '1234'.indexOf(e.key);
      if(i > -1 && i < Q[idx].opts.length){ choose(i); e.preventDefault(); }
      else if(e.key === 'Enter'){ const b = box.querySelector('#qNext:not(:disabled)') || box.querySelector('#qEnd:not(:disabled)'); if(b){ b.click(); e.preventDefault(); } }
      else if(e.key === 'ArrowRight'){ const b = box.querySelector('#qNext:not(:disabled)'); if(b) b.click(); }
      else if(e.key === 'ArrowLeft'){ const b = box.querySelector('#qPrev:not(:disabled)'); if(b) b.click(); }
    }
    function detach(){ document.removeEventListener('keydown', key); }
    document.addEventListener('keydown', key);

    render();
    return {finish: () => { opt._force = true; finish(); }, detach};
  }

  TSSR.runQCM = runQCM;
  TSSR.qcmWeak = weakOnes;
  TSSR.qcmSeen = seenCount;
})();
