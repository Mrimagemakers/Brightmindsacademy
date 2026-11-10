import re,sys
src=open('nia-world-orig.html',encoding='utf-8').read()
# strip the artifact wrapper skeleton (publish re-adds it)
pre='<!doctype html><html><head><meta charset=utf8>'
if src.startswith(pre):
    i=src.index('<body>')+len('<body>'); src=src[i:]
    if src.rstrip().endswith('</body></html>'): src=src.rstrip()[:-len('</body></html>')]
exp=open('expansion.js',encoding='utf-8').read()
def rep(old,new,count=1):
    global src
    n=src.count(old)
    if n<1: sys.exit('MISSING: '+old[:80])
    src=src.replace(old,new,count)
rep("function choicesStr(ans, wrong) { const opts = shuffle([ans, ...wrong]);","function choicesStr(ans, wrong) { const opts = shuffle([ans, ...[...new Set(wrong.map(String))].filter(v => v !== String(ans))]);")
rep("gEl('g-level').textContent = `${LVL[GAME.level]} · ${GAME.i + 1}/${GAME.total}`;","gEl('g-level').textContent = `${G.graded ? gradeName(grade()) : LVL[GAME.level]} · ${GAME.i + 1}/${GAME.total}`;")
# 1. landmarks
rep("  library:    { x: -25, z: 60,  r: 15, n: '📚 Story Library & Bookshop',   ch: null, icon: '📚' },\n",
"  library:    { x: -25, z: 60,  r: 15, n: '📚 Story Library & Bookshop',   ch: null, icon: '📚' },\n"
"  // ── Bright Minds Explorers Academy expansion ──\n"
"  academy:    { x: 26,  z: 62,  r: 11, n: '🏫 Explorers Academy',          ch: null, icon: '🏫' },\n"
"  safari:     { x: 104, z: 2,   r: 13, n: '🦁 Leo\\'s Word Safari',         ch: null, icon: '🦁' },\n"
"  river:      { x: -98, z: 12,  r: 12, n: '🦉 Reading River',              ch: null, icon: '🦉' },\n"
"  lab:        { x: 56,  z: -92, r: 12, n: '🤖 Explorers STEM Lab',         ch: null, icon: '🤖' },\n"
"  observatory:{ x: -56, z: -92, r: 12, n: '🔭 Sky Observatory',            ch: null, icon: '🔭' },\n")
rep("'glade', 'lift', 'library']) {","'glade', 'lift', 'library', 'academy', 'safari', 'river', 'lab', 'observatory']) {")
rep("  [[0, 60], [-8, 60.5], [-14.5, 60]],      // avenue → library door\n",
"  [[0, 60], [-8, 60.5], [-14.5, 60]],      // avenue → library door\n"
"  [[0, 60], [10, 61.5], [17, 62]],          // avenue → Explorers Academy\n"
"  [[86, -10], [95, -4], [99, 0]],           // → Word Safari\n"
"  [[-80, 12], [-88, 12.5], [-93, 12.5]],    // → Reading River\n"
"  [[50, -76], [53, -82], [55, -86]],        // → STEM Lab\n"
"  [[-50, -76], [-53, -82], [-55, -86]],     // → Sky Observatory\n")
rep("    if (Math.abs(x) < 9 && z > 60) continue; // keep the view through the Magic Gate",
    "    if (Math.abs(x) < 9 && z > 60) continue; // keep the view through the Magic Gate\n    if (nearLandmark(x, z, 3)) continue;")
# 2. expansion block before celebration effects
rep("// ─── 3D celebration effects ──", exp+"\n// ─── 3D celebration effects ──")
# 3. hooks into the game engine
rep("level: Math.min(2, saved.level || 0)","level: Math.min(2, saved.level ?? gradeStartLevel(key))")
rep("if (gEl('g-autoread').checked) speak(GAME.q.prompt);","if (gEl('g-autoread').checked) speak(GAME.q.say || GAME.q.prompt);")
rep("window.readGame = () => GAME.q && speak(GAME.q.prompt);","window.readGame = () => GAME.q && speak(GAME.q.say || GAME.q.prompt);")
rep("saved.badge = true; PROG.games[k] = saved; saveProgress();","saved.badge = true; PROG.games[k] = saved; BME_onFinish(k, GAME.stars); saveProgress();")
rep("function stoneAct(st) { if (st.game === 'journal')","function stoneAct(st) { if (st.act) return st.act(); if (st.game === 'journal')")
rep("{ label: st.game === 'journal' ? 'open the Garden Journal' : `play ${st.label}`, icon: st.game === 'journal' ? '📖' : '▶',",
    "{ label: st.hint || (st.game === 'journal' ? 'open the Garden Journal' : `play ${st.label}`), icon: st.icon || (st.game === 'journal' ? '📖' : '▶'),")
rep("butterfly: '✨', subby: '🐌', pip: '🐦', daisy: '🦌' }","butterfly: '✨', subby: '🐌', pip: '🐦', daisy: '🦌', leo: '🦁', oliver: '🦉', toby: '🐢', katie: '🦘', gizmo: '🤖', sloth: '🦥' }")
rep("gEl('j-summary').textContent = `⭐ ${totalStars()} stars","gEl('j-summary').textContent = `💎 ${CRYSTALS.filter(c => PROG.crystals[c.key]).length}/5 Reading Crystals · ⭐ ${totalStars()} stars")
# shop spot used confirm(), which the Claude viewer blocks
rep("else if (sp.action === 'shop') { if (confirm('Open the book\\'s page on Amazon in a new tab?')) window.open('https://www.amazon.com/Number-Garden-Bright-Minds-Explorers/dp/B0GDCNBFYL/', '_blank', 'noopener'); }",
    "else if (sp.action === 'shop') { const w = window.open('https://www.amazon.com/Number-Garden-Bright-Minds-Explorers/dp/B0GDCNBFYL/', '_blank', 'noopener'); if (!w) showToast('📚 Tap \"Get the Book!\" at the top left to open the shop.'); }")
# 4. branding & UI
rep("<title>Nia's Number Garden World</title>","<title>Bright Minds Explorers World</title>")
rep('<div class="series-badge">✨ Bright Minds Explorers Series ✨</div>','<div class="series-badge">✨ Bright Minds Explorers Academy ✨</div>')
rep('<span class="title-nia">Nia</span>','<span class="title-nia">Bright Minds</span>')
rep('<span class="title-and">and the</span>','<span class="title-and">Explorers</span>')
rep('<span class="title-garden">Number Garden</span>','<span class="title-garden">World</span>')
rep('<div class="title-sub">World ✦ 3D Adventure</div>','<div class="title-sub">K–5 Learning Adventure ✦ 3D &amp; VR</div>')
rep('<button id="start-btn" onclick="startGame()">🌱 Enter the Garden</button>',
 '<div class="grade-pick"><span>I\'m in</span>'+''.join(f'<button data-grade="{i}" onclick="setGrade({i})">{g}</button>' for i,g in enumerate(['K','1st','2nd','3rd','4th','5th']))+'</div>\n    <button id="start-btn" onclick="startGame()">🌱 Enter the World</button>')
src=src.replace("btn.textContent = '🌱 Enter the Garden'","btn.textContent = '🌱 Enter the World'")
rep('      <div class="char-badge">🦌 Daisy</div>\n','      <div class="char-badge">🦌 Daisy</div>\n'+''.join(f'      <div class="char-badge new">{c}</div>\n' for c in ['🦁 Leo','🦉 Oliver Owl','🐢 Toby','🦘 Katie','🤖 Gizmo','🦥 Sloth Sage']))
rep('<p class="tip">🖥️ WASD','<p class="tip">📚 Reading · 🔢 Math · 🤖 Coding · 🔬 Science &nbsp;·&nbsp; 🖥️ WASD')
rep('<div class="publisher-bar">© PenGame Publishing · Nia and the Number Garden</div>','<div class="publisher-bar">© PenGame Publishing · Bright Minds Explorers</div>')
rep('<div class="wm-title">🗺️ The Magic Number Garden</div>','<div class="wm-title">🗺️ Bright Minds Explorers World</div>')
rep('  <span class="hb stat" id="hud-stars">⭐ 0</span>',
'  <button class="hb hb-grade" id="hud-grade" onclick="openGradePanel()">🎒 Grade</button>\n  <button class="hb" onclick="openParents()">👪 Grown-ups</button>\n  <span class="hb stat" id="hud-crystals" title="Reading Crystals">💎 0/5</span>\n  <span class="hb stat" id="hud-stars">⭐ 0</span>')
panels='''<div id="grade-panel" class="panel"><div class="card">
  <button class="x" onclick="closeGradePanel()">✕</button>
  <h2>🎒 What grade are you in?</h2>
  <p class="p-lede">Every reading, math, coding, and science game changes to fit your grade. You can switch any time.</p>
  <div class="grade-grid">'''+''.join(f'<button data-grade="{i}" onclick="setGrade({i})"><b>{g}</b><span>{n}</span></button>' for i,(g,n) in enumerate([('K','Kindergarten'),('1','1st grade'),('2','2nd grade'),('3','3rd grade'),('4','4th grade'),('5','5th grade')]))+'''</div>
  <button class="btn gold" style="margin-top:0.9rem" onclick="closeGradePanel()">Let's explore!</button>
</div></div>
<div id="parents-panel" class="panel"><div class="card wide">
  <button class="x" onclick="closeParents()">✕</button>
  <h2>👪 Grown-ups: progress</h2>
  <div id="p-summary"></div>
  <div class="p-grade"><span>Grade level:</span>'''+''.join(f'<button data-grade="{i}" onclick="setGrade({i});openParents()">{g}</button>' for i,g in enumerate(['K','1','2','3','4','5']))+'''</div>
  <div class="p-table"><table><thead><tr><th>Game</th><th>Subject</th><th>Rounds</th><th>First-try</th><th>Level</th></tr></thead><tbody id="p-rows"></tbody></table></div>
  <p id="p-next"></p>
  <p class="p-note">Progress is saved in this browser. First-try is the share of questions answered right on the first tap. Each round has 5 questions; 3 or more stars on a zone's main game earns its Reading Crystal.</p>
  <button class="btn ghost" onclick="resetProgress(this)">↺ Reset progress on this device</button>
</div></div>
<div id="cert-panel" class="panel"><div class="card cert">
  <button class="x" onclick="closeCertificate()">✕</button>
  <div class="cert-badge">Bright Minds Explorers Academy</div>
  <h2>Explorers Passport</h2>
  <p>This certifies that a brave <b id="cert-grade">explorer</b> restored all five Reading Crystals and chased the Silence Shadow from Explorer Island.</p>
  <div class="cert-row">🔢 🦁 🦉 🤖 🔭</div>
  <p class="cert-date" id="cert-date"></p>
  <button class="btn gold" onclick="closeCertificate()">Keep exploring</button>
</div></div>
'''
rep('<div id="journal" class="panel">',panels+'<div id="journal" class="panel">')
css='''
/* ══ Bright Minds Explorers expansion UI ══ */
.grade-pick { display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap; justify-content:center; margin:0 0 0.7rem; }
.grade-pick span { color:#FFE27A; font:800 0.9rem 'Nunito',sans-serif; margin-right:0.2rem; text-shadow:0 1px 3px rgba(0,0,0,0.6); }
.grade-pick button, .p-grade button { min-width:2.6rem; padding:0.4rem 0.7rem; border-radius:999px; border:2px solid #FFD24A; background:rgba(25,10,50,0.78); color:#FFE27A; font:800 0.9rem 'Nunito',sans-serif; cursor:pointer; }
.grade-pick button.on, .p-grade button.on, .grade-grid button.on { background:linear-gradient(135deg,#FFD700,#FF8C00); color:#2B0A4E; border-color:#fff; }
.char-badge.new { border-color:#2EE6E3; background:rgba(15,47,54,0.55); }
.hb-grade { background:linear-gradient(135deg,#0F2F36,#1C5561) !important; border-color:#2EE6E3 !important; }
.p-lede { color:#E8D9FF; font-size:0.95rem; margin-bottom:0.8rem; }
.grade-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0.55rem; }
.grade-grid button { display:flex; flex-direction:column; align-items:center; gap:0.1rem; padding:0.8rem 0.4rem; border-radius:18px; border:2px solid #FFD24A; background:#5A189A; color:#fff; cursor:pointer; font-family:'Nunito',sans-serif; }
.grade-grid b { font:400 2rem 'Fredoka One',cursive; line-height:1; } .grade-grid span { font-size:0.78rem; font-weight:800; }
.card.wide { width:min(760px,94vw); }
#p-summary { color:#FFE27A; font-weight:800; margin-bottom:0.6rem; }
.p-grade { display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap; margin-bottom:0.7rem; font-size:0.9rem; color:#D9C8FF; }
.p-table { overflow-x:auto; border:1.5px solid rgba(255,215,0,0.3); border-radius:14px; }
.p-table table { width:100%; border-collapse:collapse; font-size:0.86rem; min-width:520px; }
.p-table th { text-align:left; color:#FFE27A; padding:0.5rem 0.6rem; background:rgba(255,215,0,0.08); }
.p-table td { padding:0.42rem 0.6rem; border-top:1px solid rgba(255,255,255,0.08); font-variant-numeric:tabular-nums; }
.p-table td.good { color:#9FFFB0; font-weight:800; } .p-table td.ok { color:#FFE27A; font-weight:800; } .p-table td.low { color:#FFB3B3; font-weight:800; }
#p-next { color:#9FFFE0; font-weight:700; margin:0.7rem 0 0.3rem; } .p-note { font-size:0.8rem; color:#D9C8FF; margin-bottom:0.6rem; }
.card.cert { text-align:center; background:linear-gradient(180deg,#0F2F36,#1A0833); }
.cert-badge { display:inline-block; background:#FFC83A; color:#0F2F36; font-weight:900; font-size:0.78rem; letter-spacing:0.08em; text-transform:uppercase; padding:0.25rem 0.8rem; border-radius:999px; margin-top:0.4rem; }
.card.cert h2 { margin:0.5rem 0; font-size:2rem; } .card.cert p { color:#E8F7F7; line-height:1.5; }
.cert-row { font-size:2.2rem; letter-spacing:0.3rem; margin:0.8rem 0; } .cert-date { color:#FFE27A; font-weight:800; margin-bottom:0.8rem; }
@media (max-width:600px) { .grade-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
'''
rep('</style>',css+'</style>')
open('bright-minds-world.html','w',encoding='utf-8').write(src)
print('ok',len(src))
