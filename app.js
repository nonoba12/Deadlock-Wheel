
const groups = {
    Carry: ['Grey Talon', 'Haze', 'Holliday', 'Infernus', 'Ivy', 'Mirage', 'Paradox', 'Seven', 'Vindicta', 'Wraith'],
    Tank: ['Abrams', 'Bebop', 'Billy', 'Kelvin', 'Lash', 'Mo & Krill', 'Shiv', 'Victor', 'Warden', 'Viscous'],
    Support: ['Celeste', 'Dynamo', 'Lady Geist', 'McGinnis', 'Paige', 'Rem', 'Sinclair', 'The Doorman'],
    Assassin: ['Apollo', 'Calico', 'Drifter', 'Graves', 'Mina', 'Pocket', 'Silver', 'Venator', 'Vyper', 'Yamato'],
    'New Heroes': ['Rat King', 'Baba', 'Solomon', 'Deadman Danny', 'Violet', 'Nurse Harrow']
};
const newcomers = new Set(['Rat King', 'Baba', 'Solomon', 'Deadman Danny', 'Violet', 'Nurse Harrow']);
const roster = Object.entries(groups).flatMap(([role, names]) => names.map(name => ({ name, role }))).sort((a, b) => a.name.localeCompare(b.name));
const selected = new Set(roster.map(x => x.name)); let activeRole = 'All', spinning = false, angle = 0, history = [], tickIndex = -1, audioCtx = null;
const $ = id => document.getElementById(id), canvas = $('wheel'), ctx = canvas.getContext('2d');
const palette = { Carry: ['#a94c38', '#c1694a', '#dc885f'], Tank: ['#3c659d', '#4a7aad', '#6597c5'], Support: ['#4c873b', '#66a14e', '#85b56a'], Assassin: ['#ad852d', '#c49b40', '#ddba63'], 'New Heroes': ['#654b85', '#84649f', '#a17cb5'] };
function pool() { return roster.filter(h => selected.has(h.name)); }
function list() { let q = $('search').value.trim().toLowerCase(); $('heroes').replaceChildren(); for (const h of roster) { if ((activeRole !== 'All' && h.role !== activeRole) || !h.name.toLowerCase().includes(q)) continue; const label = document.createElement('label'); label.className = 'hero' + (newcomers.has(h.name) ? ' new' : ''); const input = document.createElement('input'); input.type = 'checkbox'; input.checked = selected.has(h.name); input.disabled = spinning; input.addEventListener('change', () => { input.checked ? selected.add(h.name) : selected.delete(h.name); update(); }); const span = document.createElement('span'); span.textContent = h.name; if (newcomers.has(h.name)) { const badge = document.createElement('span'); badge.className = 'pill'; badge.textContent = 'NEW'; span.appendChild(badge); } label.append(input, span); $('heroes').append(label); } }
function update() { const n = selected.size; $('count').textContent = n + ' / ' + roster.length; $('spin').disabled = spinning || n === 0; $('quick').disabled = spinning || n === 0; draw(); list(); }
function draw() {
    const d = 1200, c = d / 2, r = 548, items = pool(), n = items.length; ctx.clearRect(0, 0, d, d); ctx.save(); ctx.translate(c, c); ctx.rotate(angle); ctx.beginPath(); ctx.arc(0, 0, r + 12, 0, Math.PI * 2); ctx.fillStyle = '#bc9356'; ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, r + 4, 0, Math.PI * 2); ctx.fillStyle = '#1f2430'; ctx.fill(); if (!n) { ctx.fillStyle = '#f0d39d'; ctx.textAlign = 'center'; ctx.font = 'bold 38px system-ui'; ctx.fillText('SELECT A HERO', 0, -140); ctx.restore(); return; } const slice = 2 * Math.PI / n; for (let i = 0; i < n; i++) {
        const h = items[i], start = -Math.PI / 2 - slice / 2 + i * slice, end = start + slice; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, start, end); ctx.closePath(); ctx.fillStyle = palette[h.role][i % 3]; ctx.fill(); ctx.strokeStyle = '#121820'; ctx.lineWidth = n > 30 ? 2.2 : 4; ctx.stroke(); ctx.save();
        // 
        const theta = start + slice / 2;
        ctx.rotate(theta);
        const onLeft = Math.cos(theta + angle) < 0;
        if (onLeft) ctx.rotate(Math.PI);
        ctx.textBaseline = 'middle';
        ctx.textAlign = onLeft ? 'left' : 'right';
        ctx.fillStyle = '#fff8e8';
        ctx.shadowColor = '#000e'; ctx.shadowBlur = 5;
        const font = n >= 38 ? 20 : n >= 25 ? 23 : n >= 14 ? 27 : 34;
        ctx.font = '800 ' + font + 'px system-ui';
        // 
        const endRadius = r - 35;
        ctx.fillText(h.name, onLeft ? -endRadius : endRadius, 0, r - 145);
        ctx.restore();
    } ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = '#eac589'; ctx.stroke(); ctx.restore();
}
function winnerAt(a, items) { const n = items.length; if (!n) return null; const slice = 2 * Math.PI / n; let index = ((Math.round((-a) / slice) % n) + n) % n; return items[index]; }
function rand(max) { if (globalThis.crypto?.getRandomValues) { const v = new Uint32Array(1); crypto.getRandomValues(v); return v[0] / 4294967296 * max; } return Math.random() * max; }
function tick() { if (!$('sound').checked) return; try { audioCtx ??= new (window.AudioContext || window.webkitAudioContext)(); const o = audioCtx.createOscillator(), gain = audioCtx.createGain(), now = audioCtx.currentTime; o.type = 'triangle'; o.frequency.value = 470; gain.gain.setValueAtTime(.045, now); gain.gain.exponentialRampToValueAtTime(.001, now + .045); o.connect(gain); gain.connect(audioCtx.destination); o.start(now); o.stop(now + .05) } catch (e) { } }
function lock(on) { spinning = on; for (const id of ['selectAll', 'clearAll', 'reset']) $(id).disabled = on; document.querySelectorAll('.chip').forEach(e => e.disabled = on); update(); }
function finish(hero) { history.unshift(hero.name); $('history').textContent = history.slice(0, 14).join('  ·  '); $('result').innerHTML = 'YOUR HERO IS <strong></strong>'; $('result').querySelector('strong').textContent = hero.name; if ($('eliminate').checked) selected.delete(hero.name); lock(false); }
function spin() { const items = pool(); if (spinning || !items.length) return; lock(true); $('result').innerHTML = 'SPINNING… <strong>Fate is choosing</strong>'; const n = items.length, step = Math.PI * 2 / n, target = Math.floor(rand(n)), current = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2), dest = (((-target * step) % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2), delta = (dest - current + Math.PI * 2) % (Math.PI * 2), start = angle, finishAngle = start + (6 + Math.floor(rand(3))) * Math.PI * 2 + delta, duration = 5700, startTime = performance.now(); tickIndex = -1; function frame(now) { const p = Math.min(1, (now - startTime) / duration), ease = 1 - Math.pow(1 - p, 4); angle = start + (finishAngle - start) * ease; draw(); const wedge = Math.floor(angle / step); if (wedge !== tickIndex) { tickIndex = wedge; if (p < .92) tick(); } if (p < 1) { requestAnimationFrame(frame); } else { angle = finishAngle; draw(); finish(items[target]); } } requestAnimationFrame(frame); }
function instant() { const items = pool(); if (spinning || !items.length) return; const target = Math.floor(rand(items.length)); angle = -target * 2 * Math.PI / items.length; draw(); finish(items[target]); }
$('spin').addEventListener('click', spin); canvas.addEventListener('click', spin); canvas.addEventListener('keydown', e => { if (e.code === 'Enter') { e.preventDefault(); spin(); } }); $('quick').addEventListener('click', instant); $('search').addEventListener('input', list); $('selectAll').addEventListener('click', () => { roster.forEach(x => selected.add(x.name)); update(); }); $('clearAll').addEventListener('click', () => { selected.clear(); update(); }); $('reset').addEventListener('click', () => { selected.clear(); roster.forEach(x => selected.add(x.name)); angle = 0; history = []; $('history').textContent = 'No spins yet.'; $('result').innerHTML = 'Ready to spin <strong>Who will you play?</strong>'; update(); }); $('clearHistory').addEventListener('click', () => { history = []; $('history').textContent = 'No spins yet.'; }); document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { activeRole = c.dataset.role; document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c)); list(); })); document.addEventListener('keydown', e => { if (e.code === 'Space' && !['INPUT', 'BUTTON', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); spin(); } }); update();
