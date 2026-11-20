/* Lógica pura do sorteio — Pelada dos Brabos (protótipo).
   Sem DOM. Testável com node: node test.js */
(function (root) {
  "use strict";

  const TEAM_SIZE = 5;

  function normalize(s) {
    return (s || "")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/\s+/g, " ").trim();
  }

  // Remove emojis, símbolos e parênteses; mantém letras (com acento), espaços, hífen e apóstrofo.
  function cleanName(raw) {
    let s = raw.replace(/\([^)]*\)/g, " ");
    s = s.replace(/[^\p{L}\s'’-]/gu, " ");
    return s.replace(/\s+/g, " ").trim();
  }

  /* Lê a mensagem do WhatsApp.
     Retorna { date: "18/11" | null, players: [{raw, name, paid, unpaid}], keepers: [...] } */
  function parseList(text) {
    const lines = (text || "").split(/\r?\n/);
    let section = "head"; // head | players | keepers | wait
    const players = [], keepers = [];
    let date = null;
    const dm = (text || "").match(/(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?/);
    if (dm) date = dm[1].padStart(2, "0") + "/" + dm[2].padStart(2, "0");

    for (const line of lines) {
      const n = normalize(cleanName(line));
      if (/^lista de presen/.test(normalize(line))) { section = "players"; continue; }
      if (/^goleiro/.test(n) && !/^\s*\d/.test(line)) { section = "keepers"; continue; }
      if (/^lista de espera/.test(n) || /^espera$/.test(n)) { section = "wait"; continue; }
      if (section === "wait") continue;
      const m = line.match(/^\s*(\d{1,3})\s*[-–—.)]\s*(.*)$/);
      if (!m) continue;
      const rest = m[2];
      const name = cleanName(rest);
      if (!name) continue;
      const entry = { raw: rest.trim(), name, paid: /✅/.test(rest), unpaid: /❌/.test(rest) };
      if (section === "keepers") keepers.push(entry);
      else players.push(entry); // numeradas antes de "Goleiros" contam como jogadores
    }
    return { date, players, keepers };
  }

  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  function similarity(a, b) {
    a = normalize(a); b = normalize(b);
    if (!a || !b) return 0;
    if (a === b) return 1;
    const fa = a.split(" ")[0], fb = b.split(" ")[0];
    const base = 1 - lev(a, b) / Math.max(a.length, b.length);
    const first = fa === fb ? 0.75 : 0;
    return Math.max(base, first);
  }

  /* Casa um nome da lista com o cadastro.
     Igualdade exata (sem acento/maiúscula) com nome ou apelido = casou.
     Senão devolve até 2 sugestões (nunca casa sozinho). */
  function matchName(name, roster) {
    const n = normalize(name);
    const exact = roster.find(p => p.active !== false &&
      (normalize(p.name) === n || (p.aliases || []).some(a => normalize(a) === n)));
    if (exact) return { player: exact, suggestions: [] };
    const sugg = roster
      .filter(p => p.active !== false)
      .map(p => ({ p, s: Math.max(similarity(name, p.name), ...(p.aliases || []).map(a => similarity(name, a))) }))
      .filter(x => x.s >= 0.6)
      .sort((x, y) => y.s - x.s)
      .slice(0, 2)
      .map(x => x.p);
    return { player: null, suggestions: sugg };
  }

  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const sumStars = t => t.reduce((s, p) => s + p.stars, 0);

  /* Divide jogadores em times com tamanhos dados, minimizando a diferença
     de soma de estrelas entre os times completos, respeitando no máximo
     `maxFive` jogadores 5★ por time (se possível). */
  function balance(players, sizes, opts) {
    const rnd = (opts && opts.random) || Math.random;
    const maxFive = (opts && opts.maxFive) || 2;
    const enforceFive = !(opts && opts.ignoreFive);
    const tries = (opts && opts.tries) || 4000;
    const full = sizes.map(s => s === TEAM_SIZE);
    let best = null, bestCost = Infinity;

    function cost(teams) {
      let penalty = 0;
      if (enforceFive) for (const t of teams) {
        const f = t.filter(p => p.stars >= 5).length;
        if (f > maxFive) penalty += 1000 * (f - maxFive);
      }
      const sums = teams.map((t, i) => full[i] ? sumStars(t) : null).filter(x => x !== null);
      const spread = sums.length ? Math.max(...sums) - Math.min(...sums) : 0;
      // variância como desempate fino
      const avg = sums.reduce((a, b) => a + b, 0) / (sums.length || 1);
      const varc = sums.reduce((a, b) => a + (b - avg) ** 2, 0) / (sums.length || 1);
      return penalty + spread * 10 + varc;
    }

    for (let k = 0; k < tries; k++) {
      const sh = shuffle(players, rnd);
      const teams = []; let i = 0;
      for (const s of sizes) { teams.push(sh.slice(i, i + s)); i += s; }
      // pequena melhora local: trocas entre times
      let c = cost(teams);
      for (let it = 0; it < 30; it++) {
        const a = Math.floor(rnd() * teams.length), b = Math.floor(rnd() * teams.length);
        if (a === b || !teams[a].length || !teams[b].length) continue;
        const ia = Math.floor(rnd() * teams[a].length), ib = Math.floor(rnd() * teams[b].length);
        [teams[a][ia], teams[b][ib]] = [teams[b][ib], teams[a][ia]];
        const nc = cost(teams);
        if (nc <= c) c = nc; else [teams[a][ia], teams[b][ib]] = [teams[b][ib], teams[a][ia]];
      }
      if (c < bestCost || (c === bestCost && rnd() < 0.5)) { bestCost = c; best = teams.map(t => t.slice()); }
    }
    return best;
  }

  /* Quantos 5★ cabem respeitando a regra? */
  function fiveRuleFeasible(players, teamCount, maxFive) {
    const f = players.filter(p => p.stars >= 5).length;
    return { ok: f <= teamCount * (maxFive || 2), count: f };
  }

  /* Sorteio completo. Retorna { teams: [[p...]], incompleteIndex } ou { error } */
  function draw(players, opts) {
    const n = players.length;
    if (n < 10) return { error: "min", missing: 10 - n };
    const fullCount = Math.floor(n / TEAM_SIZE), rest = n % TEAM_SIZE;
    const sizes = Array(fullCount).fill(TEAM_SIZE); if (rest) sizes.push(rest);
    const teams = balance(players, sizes, opts);
    const rnd = (opts && opts.random) || Math.random;
    // ordem dos times completos sorteada; incompleto sempre por último
    const fullTeams = shuffle(teams.slice(0, fullCount), rnd);
    const out = rest ? fullTeams.concat([teams[fullCount]]) : fullTeams;
    return { teams: out.map(sortTeam) };
  }

  function sortTeam(t) {
    return t.slice().sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name, "pt-BR"));
  }

  /* Re-sorteia só os times marcados (índices), mantendo os tamanhos. */
  function redraw(teams, indices, opts) {
    const pool = indices.flatMap(i => teams[i]);
    const sizes = indices.map(i => teams[i].length);
    const fresh = balance(pool, sizes, opts);
    const out = teams.map(t => t.slice());
    indices.forEach((ti, k) => { out[ti] = sortTeam(fresh[k]); });
    return out;
  }

  /* Quem chegou depois entra no último time incompleto; sem vaga, abre um novo. */
  function addLate(teams, player) {
    const out = teams.map(t => t.slice());
    const last = out[out.length - 1];
    if (last && last.length < TEAM_SIZE) { last.push(player); return { teams: out, index: out.length - 1, opened: false }; }
    out.push([player]);
    return { teams: out, index: out.length - 1, opened: true };
  }

  function removeFromTeams(teams, playerId) {
    return teams.map(t => t.filter(p => p.id !== playerId)).filter(t => t.length);
  }

  /* Ordem de jogos do estilo campeonato (todos contra todos). */
  function roundRobin(n) {
    if (n === 5) return [[1,2],[3,4],[5,1],[2,3],[4,5],[1,3],[2,4],[3,5],[1,4],[2,5]];
    if (n === 4) return [[1,2],[3,4],[1,3],[2,4],[1,4],[2,3]];
    const games = [];
    for (let i = 1; i <= n; i++) for (let j = i + 1; j <= n; j++) games.push([i, j]);
    return games;
  }

  const WEEKDAYS = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

  /* Texto puro para o WhatsApp (sem *, _, ~). */
  function whatsappText(o) {
    const lines = [];
    lines.push("⚽ " + o.groupName + " — Times");
    lines.push(o.dateLabel + " · " + o.time);
    lines.push("");
    o.teams.forEach((t, i) => {
      const inc = t.length < TEAM_SIZE ? " (incompleto)" : "";
      lines.push("Time " + (i + 1) + inc + ": " + t.map(p => p.name).join(", "));
    });
    if (o.keepers && o.keepers.length) { lines.push(""); lines.push("🧤 Goleiros: " + o.keepers.map(p => p.name).join(", ")); }
    lines.push("");
    if (o.format === "campeonato") {
      lines.push("Estilo campeonato · " + o.minutes + " min");
      const n = o.teams.length;
      roundRobin(n).forEach((g, i) => {
        lines.push((i + 1) + ") Time " + g[0] + " x Time " + g[1]);
      });
    } else {
      lines.push("Quem ganha fica · " + o.minutes + " min");
    }
    return lines.join("\n");
  }

  const api = { TEAM_SIZE, normalize, cleanName, parseList, matchName, similarity, balance, draw, redraw, addLate, removeFromTeams, roundRobin, fiveRuleFeasible, whatsappText, sumStars, sortTeam, WEEKDAYS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Logic = api;
})(typeof window !== "undefined" ? window : globalThis);
