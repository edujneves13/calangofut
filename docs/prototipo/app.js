/* Protótipo navegável — Pelada dos Brabos. Vanilla JS, um estado, render por string. */
(function () {
  "use strict";
  const L = window.Logic;
  const $app = document.getElementById("app");
  const REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const DAYS_S = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const EXAMPLE = `📅 Quarta-feira - 18/11/2026
⏰ 20:30h às 22:00h
📍 Colibris Club Arena (Na rua do Burguer King)

Lista de Presença:

1- Juninho ⭐✅
2- Márcio (cvd. Jackson)👤✅
3- Eduardo ⭐✅
4- Josué ⭐✅
5- Rafael ⭐✅
6- Derik ⭐✅
7- Fabiano ⭐✅
8- Yhan ⭐✅
9- Hugo 👤✅
10- Junior ⭐✅
11- Herlly ⭐✅
12- Cleyton ⭐✅
13- Léo ⭐✅
14- Arllen ⭐✅
15- Leandro ⭐✅
16- Adelson ⭐✅
17- Eduardo Lucas👤✅
18- Matheus Rei👤✅️
19- João Vitor 👤✅️
20- Guilherme 👤✅️
21- Paulinho 👤✅️
22- Jackson 👤 ✅️
23- Murilo 👤✅
24- Pedro 👤✅
25- Stênio ✅

Goleiros
1- Renan Araujo
2- Richard
3-

Lista de Espera
1- Renê (convidado juninho)
2- Mago (convidado juninho)`;

  /* ---------- estado ---------- */
  const S = {
    screen: "login",           // login | app
    tab: "times",              // times | timer | settings
    group: { name: "Pelada dos Brabos", avatar: "mascote/avatar-circulo.webp", day: 3, start: "20:30", end: "22:00", place: "Colibris Club Arena", format: "qgf", minutes: 10, maxWins: 3, maxFive: 2, dateOverride: null },
    roster: Roster.players.map(p => Object.assign({}, p, { aliases: p.aliases.slice() })),
    login: { email: "", pass: "", show: false, error: false },
    stage: "idle",             // idle | flow | drawing | live
    flow: null,
    live: null,
    drawResult: null,
    settingsView: "main",      // main | players | group
    playersFilter: "all",
    playersQuery: "",
    sheet: null,
    modal: null,
    toast: null,
    timer: { dur: 600, remaining: 600, phase: "idle", endAt: 0, lastBuzz: false },
  };
  let toastTimer = null, uid = 100;

  /* ---------- utilidades ---------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = (n, size) => `<span class="ic" aria-hidden="true"${size ? ` style="width:${size}px;height:${size}px"` : ""}><svg viewBox="0 0 256 256" fill="currentColor">${ICONS[n] || ""}</svg></span>`;
  const P = id => S.roster.find(p => p.id === id);
  const byName = (a, b) => a.name.localeCompare(b.name, "pt-BR");
  const plural = (n, s, p) => n + " " + (n === 1 ? s : p);

  function peladaDate() {
    if (S.group.dateOverride) return new Date(S.group.dateOverride + "T12:00:00");
    const d = new Date(); d.setHours(12, 0, 0, 0);
    const diff = (S.group.day - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
    return d;
  }
  const ddmm = d => String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
  function isToday(d) { const t = new Date(); return t.toDateString() === d.toDateString(); }
  const dateLong = () => { const d = peladaDate(); return (isToday(d) ? "Hoje" : DAYS[d.getDay()]) + ", " + ddmm(d); };
  const dateShort = () => { const d = peladaDate(); return DAYS_S[d.getDay()] + " " + ddmm(d); };

  function avatarHtml(size) {
    const st = size ? ` style="width:${size}px;height:${size}px"` : "";
    if (S.group.avatar) return `<span class="avatar"${st}><img src="${esc(S.group.avatar)}" alt="${esc(S.group.name)}"></span>`;
    const ini = S.group.name.split(/\s+/).filter(w => w.length > 2).map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return `<span class="avatar"${st} aria-label="${esc(S.group.name)}">${esc(ini)}</span>`;
  }

  function showToast(text, opts) {
    S.toast = Object.assign({ text }, opts || {});
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { S.toast = null; render(); }, S.toast.undo ? 6000 : 4000);
    render();
  }

  /* ---------- render ---------- */
  function render() {
    const act = document.activeElement;
    const focusId = act && act.id, selS = act && act.selectionStart, selE = act && act.selectionEnd;
    const scr = $app.querySelector(".screen"), scrKey = scr && scr.dataset.key, scrTop = scr ? scr.scrollTop : 0;
    const car = $app.querySelector(".carousel"), carLeft = car ? car.scrollLeft : 0;

    let html = "";
    if (S.screen === "login") html = viewLogin();
    else {
      if (S.tab === "times") html = viewTimes();
      else if (S.tab === "timer") html = viewTimer();
      else html = viewSettings();
      if (showTabs()) html += viewTabbar();
      if (S.timer.phase === "done") html += viewEnd();
    }
    if (S.toast) html += `<div class="toast${S.toast.kind === "err" ? " err" : ""}${showTabs() ? "" : " notabs"}" role="${S.toast.kind === "err" ? "alert" : "status"}"><span>${esc(S.toast.text)}</span>${S.toast.undo ? `<button class="link" data-act="undo">Desfazer</button>` : ""}</div>`;
    if (S.sheet) html += `<div class="scrim" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${viewSheet()}</div>`;
    if (S.modal) html += `<div class="scrim" data-act="closeModal"></div><div class="modal" role="alertdialog" aria-modal="true">${viewModal()}</div>`;
    $app.innerHTML = html;

    const nscr = $app.querySelector(".screen");
    if (nscr && nscr.dataset.key === scrKey) { nscr.classList.remove("enter"); nscr.scrollTop = scrTop; }
    const ncar = $app.querySelector(".carousel");
    if (ncar) {
      if (S.live && S.live.scrollTo != null) { scrollToTeam(S.live.scrollTo, false); S.live.scrollTo = null; }
      else ncar.scrollLeft = carLeft;
      ncar.addEventListener("scroll", onCarouselScroll, { passive: true });
    }
    if (focusId) { const el = document.getElementById(focusId); if (el) { el.focus(); try { if (selS != null) el.setSelectionRange(selS, selE); } catch (e) {} } }
    if (S.tab === "timer") paintTimer();
  }
  const showTabs = () => S.screen === "app" && !(S.tab === "times" && (S.stage === "flow" || S.stage === "drawing"));

  function viewTabbar() {
    const t = [["times", "ball", "Times"], ["timer", "timer", "Cronômetro"], ["settings", "tune", "Ajustes"]];
    return `<nav class="tabbar" aria-label="Navegação principal">${t.map(([k, i, l]) =>
      `<button data-act="tab" data-arg="${k}" class="${S.tab === k ? "on" : ""}" ${S.tab === k ? 'aria-current="page"' : `aria-label="${l}"`}>${ic(i)}${S.tab === k ? `<span>${l}</span>` : ""}</button>`).join("")}</nav>`;
  }

  /* ---------- login ---------- */
  function viewLogin() {
    const l = S.login;
    return `<main class="screen no-tabs login enter" data-key="login">
      <div class="login-img"><img src="mascote/login.webp" alt="Calango, mascote da ${esc(S.group.name)}, saindo do túnel do estádio"></div>
      <div class="px" style="display:flex;flex-direction:column;gap:16px;margin-top:-40px;position:relative">
        <div><h1 class="display-l" style="margin:0">${esc(S.group.name)}</h1><div class="t2 body" style="margin-top:4px">Entrada dos organizadores</div></div>
        <form data-form="login" style="display:flex;flex-direction:column;gap:14px" novalidate>
          <label class="field"><span>E-mail</span><input class="input" id="lg-email" data-in="login.email" type="email" inputmode="email" autocomplete="username" placeholder="seu@email.com" value="${esc(l.email)}"></label>
          <label class="field"><span>Senha</span><div class="pw"><input class="input" id="lg-pass" data-in="login.pass" type="${l.show ? "text" : "password"}" autocomplete="current-password" value="${esc(l.pass)}"><button type="button" data-act="togglePw">${l.show ? "Esconder" : "Mostrar"}</button></div></label>
          ${l.error ? `<div class="toast err" style="position:static;animation:none">E-mail ou senha não conferem. Esqueceu? Peça para outro organizador trocar sua senha.</div>` : ""}
          <button class="btn" type="submit">Entrar</button>
        </form>
        <p class="protobar">Protótipo: qualquer e-mail e senha preenchidos entram.</p>
      </div>
    </main>`;
  }

  /* ---------- times ---------- */
  function viewTimes() {
    if (S.stage === "flow") return viewFlow();
    if (S.stage === "drawing") return viewDrawing();
    if (S.stage === "live") return viewLive();
    return `<main class="screen enter" data-key="idle">
      <header class="header px">${avatarHtml()}<div class="grow"><h1 class="title">${esc(S.group.name)}</h1></div></header>
      <section class="card hero" style="margin:0 var(--m)" aria-label="Próxima pelada">
        <div class="hero-img"><img src="mascote/proxima-pelada.webp" alt="Calango, mascote da ${esc(S.group.name)}, no gramado"></div>
        <div style="padding:4px 22px 22px;display:flex;flex-direction:column;gap:6px">
          <div class="label" style="color:var(--brand-label)">Próxima pelada</div>
          <div class="display-l">${esc(dateLong())}</div>
          <div class="meta body" style="margin-top:6px"><div>${ic("clock", 18)}<span>${esc(S.group.start)} – ${esc(S.group.end)}</span></div><div>${ic("pin", 18)}<span>${esc(S.group.place)}</span></div></div>
          <button class="btn" style="margin-top:18px" data-act="startFlow">${ic("shuffle", 22)}<span>Sortear times</span></button>
        </div>
      </section>
    </main>`;
  }

  function stepper(n) {
    return `<div class="px"><div class="stepper" aria-label="Etapa ${n} de 3"><i class="on"></i><i class="${n >= 2 ? "on" : ""}"></i><i class="${n >= 3 ? "on" : ""}"></i></div>
      <div class="steplbl">${["Lista", "Quem chegou", "Sortear"].map((t, i) => i + 1 === n ? `<b>${t}</b>` : `<span>${t}</span>`).join("")}</div></div>`;
  }
  function flowHeader(title, back) {
    return `<header class="header px"><button class="icon-btn plain" data-act="${back}" aria-label="Voltar">${ic("back", 22)}</button><div class="grow"><h1 class="title">${title}</h1></div></header>`;
  }

  function viewFlow() {
    const f = S.flow;
    if (f.step === "paste") {
      return `<main class="screen no-tabs enter" data-key="paste">
        ${flowHeader("Cole a lista do WhatsApp", "cancelFlow")}${stepper(1)}
        <div class="px" style="display:flex;flex-direction:column;gap:12px;flex:1">
          <p class="body t2" style="margin:0">No WhatsApp, segure a mensagem da lista e toque em Copiar. Pode colar inteira: o app separa jogadores e goleiros e ignora a lista de espera.</p>
          <label class="sr" for="paste">Lista do WhatsApp</label>
          <textarea class="paste" id="paste" data-in="flow.text" placeholder="Cole a mensagem aqui">${esc(f.text)}</textarea>
          ${f.error ? `<div class="warnbox">${ic("warning")}<span>Não encontrei jogadores nesse texto. Copie a mensagem da lista de presença inteira e cole de novo.</span></div>` : ""}
          ${f.dateWarn ? `<div class="warnbox">${ic("warning")}<div style="display:flex;flex-direction:column;gap:10px;flex:1"><span>Essa lista é de <b>${esc(f.dateWarn)}</b>. Usar mesmo assim?</span><div style="display:flex;gap:8px"><button class="btn small" data-act="useListAnyway">Usar esta lista</button><button class="btn small sec" style="height:40px" data-act="pasteOther">Colar outra</button></div></div></div>` : ""}
          <button class="btn sec" data-act="useExample">Usar lista de exemplo (18/11)</button>
          <div style="flex:1"></div>
          <button class="btn" data-act="pasteContinue">Continuar</button>
        </div>
      </main>`;
    }
    if (f.step === "confirm") {
      const pending = f.unknown.filter(u => !u.choice).length;
      return `<main class="screen no-tabs enter" data-key="confirm">
        ${flowHeader(`Quem é quem? (${f.unknown.length})`, "backToPaste")}
        <div class="px" style="display:flex;flex-direction:column;gap:12px;flex:1">
          <p class="body t2" style="margin:0">Esses nomes não estão no cadastro. Escolha quem é cada um.</p>
          ${f.unknown.map((u, i) => `<section class="card" style="padding:16px">
            <div class="label">Escrito na lista</div>
            <div class="body-l" style="font-size:1.0625rem;margin:2px 0 6px">${esc(u.name)}</div>
            ${u.suggestions.map(id => { const p = P(id); return `<button class="row" data-act="pickUnknown" data-arg="${i}|${id}"><span class="check${u.choice === id ? " on" : ""}">${u.choice === id ? ic("check") : ""}</span><span class="name">É o ${esc(p.name)}</span><span class="lvl">${p.stars}★</span></button>`; }).join("")}
            <button class="row" data-act="pickUnknown" data-arg="${i}|new"><span class="check${u.choice === "new" ? " on" : ""}">${u.choice === "new" ? ic("check") : ""}</span><span class="name">É jogador novo</span></button>
            ${u.choice === "new" ? `<div style="display:flex;flex-direction:column;gap:10px;padding-top:12px">
              <label class="field"><span>Nome completo</span><input class="input" id="un-${i}" data-in="unknownName.${i}" value="${esc(u.newName)}"></label>
              <div class="field"><span>Estrelas</span>${starPicker("unknownStars", i, u.stars)}</div></div>` : ""}
            ${u.choice && u.choice !== "new" ? `<p class="body-s t2" style="margin:8px 0 0">"${esc(u.name)}" vai ser lembrado como apelido do ${esc(P(u.choice).name)}.</p>` : ""}
          </section>`).join("")}
          <div style="flex:1"></div>
          <button class="btn" data-act="confirmContinue" ${pending ? "disabled" : ""}>${pending ? `Falta escolher ${plural(pending, "nome", "nomes")}` : "Continuar"}</button>
        </div>
      </main>`;
    }
    if (f.step === "arrived") {
      const q = L.normalize(f.search || "");
      const line = f.entries.map(e => Object.assign({ p: P(e.id) }, e)).filter(e => e.p).sort((a, b) => byName(a.p, b.p));
      const shown = q ? line.filter(e => L.normalize(e.p.name).includes(q)) : line;
      const keepers = f.keepers.map(P).filter(Boolean).sort(byName);
      const yes = line.filter(e => e.present).length, no = line.length - yes;
      return `<main class="screen no-tabs enter" data-key="arrived">
        ${flowHeader("Quem já chegou?", "backFromArrived")}${stepper(2)}
        <div class="px" style="display:flex;flex-direction:column;gap:10px">
          <p class="body" style="margin:0">Desmarque quem ainda não chegou.</p>
          <p class="body-s t2" style="margin:-6px 0 0">Quem chegar depois entra no último time.</p>
          <div class="body-s"><b>${yes}</b> <span class="t2">${yes === 1 ? "chegou" : "chegaram"} ·</span> <b>${no}</b> <span class="t2">não ${no === 1 ? "chegou" : "chegaram"}</span></div>
          <div class="search">${ic("search")}<label class="sr" for="arr-q">Buscar jogador</label><input class="input" id="arr-q" data-in="flow.search" placeholder="Buscar jogador" value="${esc(f.search || "")}"></div>
          ${yes === 0 ? `<div class="warnbox">${ic("warning")}<span>Ninguém marcado. Marque quem já chegou.</span></div>` : ""}
          <ul class="list">${shown.map(e => `<li><button class="row${e.present ? "" : " off"}" data-act="togglePresent" data-arg="${e.id}" aria-pressed="${e.present}" aria-label="${e.present ? "Chegou" : "Não chegou"}: ${esc(e.p.name)}">
            <span class="check${e.present ? " on" : ""}">${e.present ? ic("check") : ""}</span><span class="ic${e.present ? " ico-brand" : " t3"}" style="width:22px;height:22px">${ic("sneaker")}</span>
            <span class="name">${esc(e.p.name)}</span><span class="lvl">${e.p.stars}★</span></button></li>`).join("")}</ul>
          ${keepers.length ? `<div class="sect">Goleiros · fora do sorteio</div><ul class="list">${keepers.map(p => `<li class="row"><span class="ic ico-brand" style="width:22px;height:22px;margin-left:36px">${ic("glove")}</span><span class="name">${esc(p.name)}</span></li>`).join("")}</ul>` : ""}
        </div>
        <div style="flex:1"></div>
        <div class="px" style="display:flex;gap:8px;position:sticky;bottom:0;background:var(--bg);padding-top:12px;padding-bottom:4px">
          <button class="btn sec" style="width:auto;padding:0 18px;height:58px" data-act="openAdd" data-arg="flow">${ic("plus", 20)}<span>Adicionar</span></button>
          <button class="btn" data-act="toDraw">Continuar</button>
        </div>
      </main>`;
    }
    if (f.step === "draw") {
      const players = presentPlayers();
      const n = players.length;
      if (n < 10) {
        return `<main class="screen no-tabs enter" data-key="draw-min">
          ${flowHeader("Como vai ser hoje?", "backToArrived")}${stepper(3)}
          <div class="px" style="display:flex;flex-direction:column;gap:12px;flex:1">
            <div class="card center" style="padding:18px;text-align:center;background:var(--surface-2);border-color:var(--surface-2)"><div class="display-m">${plural(n, "jogador", "jogadores")}</div><div class="body t2">Faltam ${10 - n} para sortear</div></div>
            <div class="warnbox">${ic("warning")}<span>O sorteio precisa de pelo menos 10 jogadores de linha. Marque quem chegou ou adicione alguém.</span></div>
            <button class="btn sec" data-act="backToArrived">Ver quem chegou</button>
            <button class="btn sec" data-act="openAdd" data-arg="flow">${ic("plus", 20)}<span>Adicionar jogador</span></button>
            <div style="flex:1"></div>
            <button class="btn" disabled>Sortear times</button>
          </div></main>`;
      }
      const full = Math.floor(n / 5), rest = n % 5;
      const sub = rest ? `${plural(full, "time", "times")} de 5 e 1 time com ${rest}` : `${plural(full, "time", "times")} de 5`;
      return `<main class="screen no-tabs enter" data-key="draw">
        ${flowHeader("Como vai ser hoje?", "backToArrived")}${stepper(3)}
        <div class="px" style="display:flex;flex-direction:column;gap:12px;flex:1">
          <div class="card" style="padding:18px;text-align:center;background:var(--surface-2);border-color:var(--surface-2)"><div class="display-m">${n} jogadores</div><div class="body t2" style="margin-top:2px">${sub}</div></div>
          <div class="sect">Formato</div>
          <div class="seg" role="group" aria-label="Formato"><button class="${f.format === "qgf" ? "on" : ""}" data-act="setFlow" data-arg="format|qgf">Quem ganha fica</button><button class="${f.format === "campeonato" ? "on" : ""}" data-act="setFlow" data-arg="format|campeonato">Estilo campeonato</button></div>
          <div class="sect">Tempo de jogo</div>
          <div class="seg" role="group" aria-label="Tempo de jogo"><button class="${f.minutes === 8 ? "on" : ""}" data-act="setFlow" data-arg="minutes|8">8 min</button><button class="${f.minutes === 10 ? "on" : ""}" data-act="setFlow" data-arg="minutes|10">10 min</button></div>
          <p class="body-s t2" style="margin:4px 0 0">Times equilibrados pelas estrelas, com no máximo ${S.group.maxFive === 1 ? "um craque" : S.group.maxFive + " craques"} (5★) por time.</p>
          <div style="flex:1"></div>
          <button class="btn" style="height:60px;font-size:1.125rem" data-act="doDraw">${ic("shuffle", 22)}<span>Sortear times</span></button>
        </div></main>`;
    }
    return "";
  }

  function starPicker(kind, arg, value) {
    return `<div class="stars" role="radiogroup" aria-label="Estrelas">${[1, 2, 3, 4, 5].map(v =>
      `<button type="button" role="radio" aria-checked="${v === value}" aria-label="${v} ${v === 1 ? "estrela" : "estrelas"}" class="${v <= value ? "on" : ""}" data-act="${kind}" data-arg="${arg}|${v}">${ic(v <= value ? "starFill" : "star")}</button>`).join("")}</div>`;
  }

  function presentPlayers() { return S.flow.entries.filter(e => e.present).map(e => P(e.id)).filter(Boolean); }

  /* ---------- sorteando ---------- */
  function viewDrawing() {
    const teams = S.drawResult.teams.slice(0, 4);
    let k = 0;
    const grid = teams.map((t, i) => `<div class="slotteam"><b>Time ${i + 1}</b><div>${t.map(p => `<span class="chipfall" style="animation-delay:${(k++) * 55}ms">${ic("sneaker")}${esc(p.name.split(" ")[0])}</span>`).join("")}</div></div>`).join("");
    return `<main class="screen no-tabs drawing" data-key="drawing" style="justify-content:center;padding-left:var(--m);padding-right:var(--m)">
      <img src="mascote/sorteando.webp" alt="Calango sorteando os times">
      <div><div class="display-m">Sorteando…</div><div class="body t2">Equilibrando os times</div></div>
      <div class="drawgrid">${grid}</div>
    </main>`;
  }

  /* ---------- durante a pelada ---------- */
  function liveTeams() { return S.live.teams.map(t => t.map(P)); }
  function viewLive() {
    const lv = S.live, teams = liveTeams();
    const absent = lv.absent.map(P).filter(Boolean).sort(byName);
    const cards = teams.map((t, i) => {
      const inc = t.length < 5, onlyLate = inc && t.every(p => lv.late.includes(p.id));
      const rows = t.map(p => `<li class="row${lv.highlight === p.id ? " new" : ""}"><span class="ic ico-brand" style="width:22px;height:22px">${ic("sneaker")}</span><span class="name">${esc(p.name)}</span><span class="lvl" aria-label="${p.stars} estrelas">${p.stars}★</span></li>`).join("");
      const slots = inc ? Array(5 - t.length).fill(`<li class="row vaga"><span class="slot"></span><span class="name">Vaga</span></li>`).join("") : "";
      return `<section class="card team${inc ? " inc" : ""}" aria-label="Time ${i + 1}" data-team="${i}">
        <div class="th"><h2 class="display-m" style="margin:0">Time ${i + 1}</h2>${inc ? `<span class="inc-badge">Incompleto · ${t.length}/5</span>` : `<span class="sum" aria-label="${L.sumStars(t)} estrelas">${L.sumStars(t)}★</span>`}</div>
        <ul class="list">${rows}${slots}</ul>
        ${onlyLate ? `<p class="body-s t2" style="margin:8px 0 10px">Esse time foi montado por ordem de chegada, sem equilibrar. Para equilibrar, use Sortear de novo.</p>` : ""}
      </section>`;
    }).join("");
    return `<main class="screen enter" data-key="live">
      <header class="header px">${avatarHtml()}<div class="grow"><h1 class="title">${esc(S.group.name)}</h1><div class="body-s t2">${esc(dateShort())} · ${esc(S.group.start)}</div></div>
        <button class="icon-btn" data-act="openRedraw" aria-label="Sortear de novo">${ic("refresh", 20)}</button>
        <button class="icon-btn plain" data-act="openMenu" aria-label="Mais opções">${ic("dots", 22)}</button></header>
      <div class="tidx px" role="tablist" aria-label="Times">${teams.map((t, i) => `<button role="tab" data-act="goTeam" data-arg="${i}" class="${i === lv.active ? "on" : ""}${t.length < 5 ? " inc" : ""}" aria-selected="${i === lv.active}">${i === lv.active ? "Time " + (i + 1) : i + 1}</button>`).join("")}</div>
      <div class="carousel">${cards}</div>
      <div class="dots" aria-hidden="true">${teams.map((t, i) => `<i class="${i === lv.active ? "on" : ""}"></i>`).join("")}</div>
      <div class="px" style="display:flex;flex-direction:column;gap:10px">
        <button class="btn dashed" data-act="toggleAbsent" aria-expanded="${lv.absentOpen}"><span><b>Não chegaram</b> <span class="t2">· ${absent.length}</span></span>${ic(lv.absentOpen ? "caretDown" : "caretRight", 20)}</button>
        ${lv.absentOpen ? `<div class="card" style="padding:4px 16px 12px;border-style:dashed;border-color:var(--border-strong)">
          ${absent.length ? `<ul class="list">${absent.map(p => `<li class="row"><span class="ic t2" style="width:22px;height:22px">${ic("sneaker")}</span><span class="name">${esc(p.name)}</span><button class="btn small" data-act="arrived" data-arg="${p.id}">Chegou</button></li>`).join("")}</ul>
            <p class="body-s t2" style="margin:8px 0 6px">Entra no último time.</p>` : `<p class="body t2" style="margin:12px 0 6px">Todo mundo chegou.</p>`}
          <button class="btn sec" style="height:44px;margin-top:6px" data-act="openAdd" data-arg="live">${ic("userPlus", 18)}<span>Adicionar quem não estava na lista</span></button>
        </div>` : ""}
        <button class="btn" data-act="copyList">${ic("copy", 21)}<span>Copiar lista dos times</span></button>
      </div>
    </main>`;
  }

  function onCarouselScroll(e) {
    const el = e.currentTarget, cards = el.querySelectorAll(".team");
    if (!cards.length || !S.live) return;
    const w = cards[0].offsetWidth + 12;
    const idx = Math.max(0, Math.min(cards.length - 1, Math.round(el.scrollLeft / w)));
    if (idx !== S.live.active) {
      S.live.active = idx;
      $app.querySelectorAll(".tidx button").forEach((b, i) => { b.classList.toggle("on", i === idx); b.setAttribute("aria-selected", i === idx); b.textContent = i === idx ? "Time " + (i + 1) : String(i + 1); });
      $app.querySelectorAll(".dots i").forEach((d, i) => d.classList.toggle("on", i === idx));
    }
  }
  function scrollToTeam(i, smooth) {
    const el = $app.querySelector(".carousel"); if (!el) return;
    const card = el.querySelectorAll(".team")[i]; if (!card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || 0), behavior: smooth && !REDUCED ? "smooth" : "auto" });
  }

  /* ---------- cronômetro ---------- */
  function fmt(sec) { sec = Math.max(0, Math.ceil(sec)); return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0"); }
  function viewTimer() {
    const t = S.timer, ph = t.phase;
    const durMin = Math.round(t.dur / 60);
    let ctrls;
    if (ph === "idle") ctrls = `<button class="btn big" data-act="tStart">Começar</button><div style="display:flex;gap:8px"><button class="btn sec" data-act="tAdj" data-arg="-1">−1 min</button><button class="btn sec" data-act="tAdj" data-arg="1">+1 min</button></div>`;
    else if (ph === "running") ctrls = `<button class="btn big" data-act="tPause">Pausar</button><div style="display:flex;gap:8px"><button class="btn sec" data-act="tReset">Zerar</button><button class="btn sec" data-act="tAdj" data-arg="1">+1 min</button></div>`;
    else ctrls = `<button class="btn big" data-act="tResume">Continuar</button><div style="display:flex;gap:8px"><button class="btn sec" data-act="tReset">Zerar</button><button class="btn sec" data-act="tAdj" data-arg="1">+1 min</button></div>`;
    return `<main class="screen enter" data-key="timer">
      <header class="header px"><div class="grow"><h1 class="title">Cronômetro</h1></div>${ph === "running" ? `<span class="pill-note">Tela fica acesa</span>` : ""}</header>
      <div class="px timerwrap">
        <div class="lastlabel" id="tlast"></div>
        <div class="display-xl timer-digits" id="tdig">${fmt(t.remaining)}</div>
        <div class="track" aria-hidden="true"><div class="fill" id="tfill"></div><div class="ball" id="tball">${ic("ball")}</div></div>
        ${ph === "idle" ? `<div class="seg" role="group" aria-label="Tempo de jogo" style="margin-top:12px"><button class="${durMin === 8 ? "on" : ""}" data-act="tDur" data-arg="8">8 min</button><button class="${durMin === 10 ? "on" : ""}" data-act="tDur" data-arg="10">10 min</button></div>` : `<div style="height:56px"></div>`}
        <div style="flex:1;min-height:20px"></div>
        ${ctrls}
      </div>
    </main>`;
  }
  function paintTimer() {
    const t = S.timer, dig = document.getElementById("tdig"); if (!dig) return;
    const rem = t.phase === "running" ? Math.max(0, (t.endAt - Date.now()) / 1000) : t.remaining;
    dig.textContent = fmt(rem);
    const last = t.phase !== "idle" && rem <= 60 && rem > 0;
    dig.classList.toggle("last", last);
    const lab = document.getElementById("tlast"); if (lab) lab.textContent = last ? "ÚLTIMO MINUTO" : "";
    const prog = t.dur ? Math.min(1, Math.max(0, 1 - rem / t.dur)) : 0;
    const fill = document.getElementById("tfill"); if (fill) fill.style.width = (prog * 100) + "%";
    const ball = document.getElementById("tball");
    if (ball) {
      if (REDUCED) ball.style.display = "none";
      const w = ball.parentElement.offsetWidth;
      ball.style.transform = `translateX(${prog * w}px) rotate(${prog * w * 3.2}deg)`;
    }
  }
  let tick = null;
  function startTicking() {
    clearInterval(tick);
    tick = setInterval(() => {
      const t = S.timer; if (t.phase !== "running") return;
      const rem = (t.endAt - Date.now()) / 1000;
      if (rem <= 60 && !t.lastBuzz) { t.lastBuzz = true; try { navigator.vibrate && navigator.vibrate(150); } catch (e) {} }
      if (rem <= 0) { t.phase = "done"; t.remaining = 0; clearInterval(tick); finalWhistle(); releaseWake(); render(); return; }
      if (S.tab === "timer") paintTimer();
    }, 200);
  }
  function viewEnd() {
    return `<div class="endscreen" role="alertdialog" aria-label="Fim de jogo">
      <div class="display-xl" style="color:#fff">00:00</div>
      <div style="text-align:center"><div class="display-m">Fim de jogo</div></div>
      <div style="flex:1;max-height:120px"></div>
      <button class="btn white big" data-act="tNext">Zerar para o próximo</button>
      <button class="btn ghost-white" data-act="tStopWhistle">Parar apito</button>
    </div>`;
  }

  /* som do apito (Web Audio) */
  let actx = null, nodes = [];
  function unlockAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) {} }
  function blast(start, dur) {
    const osc = actx.createOscillator(), trill = actx.createOscillator(), tg = actx.createGain(), g = actx.createGain();
    osc.type = "sine"; osc.frequency.value = 2900; trill.frequency.value = 38; tg.gain.value = 180;
    trill.connect(tg).connect(osc.frequency);
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(.3, start + .02);
    g.gain.setValueAtTime(.3, start + dur - .05); g.gain.linearRampToValueAtTime(0, start + dur);
    osc.connect(g).connect(actx.destination);
    osc.start(start); trill.start(start); osc.stop(start + dur); trill.stop(start + dur);
    nodes.push(osc, trill);
  }
  function finalWhistle() {
    try { if (!actx) return; const t = actx.currentTime; blast(t, .25); blast(t + .35, .25); blast(t + .7, 1.1); } catch (e) {}
    try { navigator.vibrate && navigator.vibrate([200, 100, 200, 100, 600]); } catch (e) {}
  }
  function stopWhistle() { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); nodes = []; }
  let wake = null;
  async function requestWake() { try { if ("wakeLock" in navigator) wake = await navigator.wakeLock.request("screen"); } catch (e) { wake = null; } }
  function releaseWake() { try { wake && wake.release(); } catch (e) {} wake = null; }

  /* ---------- ajustes ---------- */
  function viewSettings() {
    if (S.settingsView === "players") return viewPlayers();
    if (S.settingsView === "group") return viewGroup();
    const g = S.group, active = S.roster.filter(p => p.active).length;
    const row = (act, label, val, arg) => `<button class="setrow" data-act="${act}"${arg ? ` data-arg="${arg}"` : ""}><span style="flex:1">${label}</span><span class="v">${val}${ic("caretRight")}</span></button>`;
    return `<main class="screen enter" data-key="settings">
      <header class="header px"><div class="grow"><h1 class="title">Ajustes</h1></div></header>
      <div class="px">
        <button class="setrow" data-act="openGroup" style="min-height:72px">${avatarHtml(52)}<span style="flex:1"><span class="body-l" style="display:block">${esc(g.name)}</span><span class="body-s t2">Nome e avatar</span></span><span class="v">${ic("caretRight")}</span></button>
        <button class="setrow" data-act="openPlayers"><span class="ic ico-brand" style="width:22px;height:22px">${ic("users")}</span><span style="flex:1;font-weight:600">Jogadores</span><span class="v">${active}${ic("caretRight")}</span></button>
        <div class="sect" style="margin-top:18px">Toda semana</div>
        ${row("openSheet", "Dia e horário", `${DAYS_S[g.day]} · ${esc(g.start)}–${esc(g.end)}`, "schedule")}
        ${row("openSheet", "Local", esc(g.place.split(" ")[0]), "place")}
        ${row("openSheet", "Mudar só a próxima", esc(ddmm(peladaDate())), "nextDate")}
        <div class="sect" style="margin-top:18px">Jogo</div>
        ${row("openSheet", "Formato padrão", g.format === "qgf" ? "Quem ganha fica" : "Estilo campeonato", "format")}
        ${row("openSheet", "Tempo de jogo", g.minutes + " min", "minutes")}
        ${row("openSheet", "Quem ganha fica até", g.maxWins + " jogos", "maxWins")}
        <div class="sect" style="margin-top:18px">Sorteio</div>
        ${row("openSheet", "Craques (5★) por time", "até " + g.maxFive, "maxFive")}
        <div class="setrow" style="cursor:default"><span style="flex:1">Jogadores por time</span><span class="v">5</span></div>
        <button class="setrow" data-act="askLogout" style="color:var(--danger);margin-top:18px">${ic("signOut", 20)}<span style="flex:1">Sair</span></button>
        <p class="protobar" style="margin-top:16px">Protótipo: as mudanças valem até recarregar a página.</p>
      </div>
    </main>`;
  }

  function viewPlayers() {
    const q = L.normalize(S.playersQuery), f = S.playersFilter;
    let list = S.roster.slice().sort(byName);
    if (f === "line") list = list.filter(p => !p.keeper && p.active);
    else if (f === "keepers") list = list.filter(p => p.keeper && p.active);
    else if (f === "inactive") list = list.filter(p => !p.active);
    else list = list.filter(p => p.active);
    if (q) list = list.filter(p => L.normalize(p.name).includes(q) || p.aliases.some(a => L.normalize(a).includes(q)));
    const count = S.roster.filter(p => p.active).length;
    const chip = (k, l) => `<button class="chip${f === k ? " on" : ""}" data-act="pFilter" data-arg="${k}">${l}</button>`;
    return `<main class="screen enter" data-key="players">
      <header class="header px"><button class="icon-btn plain" data-act="settingsMain" aria-label="Voltar">${ic("back", 22)}</button><div class="grow"><h1 class="title">Jogadores</h1></div><button class="icon-btn" data-act="newPlayer" aria-label="Novo jogador">${ic("plus", 20)}</button></header>
      <div class="px" style="display:flex;flex-direction:column;gap:10px">
        <div class="search">${ic("search")}<label class="sr" for="pl-q">Buscar por nome ou apelido</label><input class="input" id="pl-q" data-in="playersQuery" placeholder="Buscar por nome ou apelido" value="${esc(S.playersQuery)}"></div>
        <div class="chips">${chip("all", "Todos " + count)}${chip("line", "Linha")}${chip("keepers", "Goleiros")}${chip("inactive", "Inativos")}</div>
        ${list.length ? `<ul class="list">${list.map(p => `<li><button class="row" data-act="editPlayer" data-arg="${p.id}"><span class="ic ico-brand" style="width:22px;height:22px">${ic(p.keeper ? "glove" : "sneaker")}</span><span class="name">${esc(p.name)}<span class="sub" style="display:block">${p.keeper ? "Goleiro" : p.type}</span></span>${p.keeper ? "" : `<span class="lvl">${p.stars}★</span>`}<span class="ic t3" style="width:16px;height:16px">${ic("caretRight")}</span></button></li>`).join("")}</ul>`
          : q ? `<div class="empty"><p class="body t2">Ninguém com "${esc(S.playersQuery)}".</p><button class="btn small" data-act="newPlayer" data-arg="q">Cadastrar "${esc(S.playersQuery)}"</button></div>`
            : `<div class="empty">${ic("users")}<p class="body t2">Nenhum jogador aqui.</p></div>`}
        <p class="protobar">Estrelas de exemplo, inventadas para o protótipo.</p>
      </div>
    </main>`;
  }

  function viewGroup() {
    const d = S.groupDraft || (S.groupDraft = { name: S.group.name, avatar: S.group.avatar });
    return `<main class="screen enter" data-key="group">
      <header class="header px"><button class="icon-btn plain" data-act="settingsMain" aria-label="Voltar">${ic("back", 22)}</button><div class="grow"><h1 class="title">Nome e avatar</h1></div></header>
      <div class="px" style="display:flex;flex-direction:column;gap:14px;align-items:stretch">
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:8px">
          <span class="avatar" style="width:110px;height:110px;font-size:2rem">${d.avatar ? `<img src="${esc(d.avatar)}" alt="Avatar da pelada">` : esc(d.name.split(/\s+/).filter(w => w.length > 2).map(w => w[0]).join("").slice(0, 2).toUpperCase())}</span>
          <label class="btn sec" style="width:auto;padding:0 18px;height:44px" for="avatar-file">${d.avatar ? "Trocar foto" : "Escolher foto"}</label>
          <input id="avatar-file" type="file" accept="image/*" class="sr" data-file="avatar">
          <p class="body-s t2" style="margin:0;text-align:center">Foto do grupo, escudo ou mascote. Aparece em círculo.</p>
        </div>
        <label class="field"><span>Nome da pelada</span><input class="input" id="grp-name" data-in="groupDraft.name" value="${esc(d.name)}"></label>
        <p class="body-s t2" style="margin:-6px 0 0">Aparece no app e na lista dos times copiada.</p>
        <button class="btn" data-act="saveGroup" ${d.name.trim() ? "" : "disabled"}>Salvar</button>
      </div>
    </main>`;
  }

  /* ---------- sheets ---------- */
  function viewSheet() {
    const sh = S.sheet;
    if (sh.type === "add") {
      const q = L.normalize(sh.q);
      const inList = id => sh.ctx === "flow" ? (S.flow.entries.some(e => e.id === id) || S.flow.keepers.includes(id)) : (S.live.teams.flat().includes(id) || S.live.absent.includes(id) || S.live.keepers.includes(id));
      const res = q.length >= 2 ? S.roster.filter(p => p.active && (L.normalize(p.name).includes(q) || p.aliases.some(a => L.normalize(a).includes(q)))).sort(byName).slice(0, 5) : [];
      const exact = S.roster.some(p => L.normalize(p.name) === q);
      if (sh.mode === "new") {
        return `<h2 class="title">Adicionar jogador</h2>
          <label class="field"><span>Nome</span><input class="input" id="add-q" data-in="sheet.q" value="${esc(sh.q)}"></label>
          <p class="body t2" style="margin:0">Jogador novo. Quantas estrelas?</p>
          ${sh.keeper ? `<p class="body-s t2" style="margin:0">Goleiro não precisa de estrelas: não entra no sorteio.</p>` : starPicker("addStars", 0, sh.stars)}
          <div class="row" style="border:0"><span class="ic ico-brand" style="width:22px;height:22px">${ic("glove")}</span><span class="name">É goleiro</span><button class="toggle${sh.keeper ? " on" : ""}" data-act="addKeeper" role="switch" aria-checked="${sh.keeper}" aria-label="É goleiro"></button></div>
          <button class="btn" data-act="addNew" ${sh.q.trim().length < 2 ? "disabled" : ""}>${sh.keeper ? "Adicionar como goleiro" : "Adicionar ao sorteio"}</button>`;
      }
      return `<h2 class="title">Adicionar jogador</h2>
        <label class="field"><span>Nome</span><input class="input" id="add-q" data-in="sheet.q" placeholder="Digite o nome" value="${esc(sh.q)}" autocomplete="off"></label>
        <ul class="list">${res.map(p => inList(p.id)
          ? `<li class="row" style="opacity:.6"><span class="ic t3" style="width:22px;height:22px">${ic(p.keeper ? "glove" : "sneaker")}</span><span class="name">${esc(p.name)}<span class="sub" style="display:block">${sh.ctx === "flow" ? "Já está na lista de hoje" : "Já está na pelada"}</span></span></li>`
          : `<li><button class="row" data-act="addExisting" data-arg="${p.id}"><span class="ic ico-brand" style="width:22px;height:22px">${ic(p.keeper ? "glove" : "sneaker")}</span><span class="name">${esc(p.name)}</span>${p.keeper ? `<span class="lvl">Goleiro</span>` : `<span class="lvl">${p.stars}★</span>`}</button></li>`).join("")}
          ${sh.q.trim().length >= 3 && !exact ? `<li><button class="row" data-act="addAsNew">${ic("userPlus", 22)}<span class="name">Adicionar "${esc(sh.q.trim())}" como jogador novo</span></button></li>` : ""}
        </ul>
        ${q.length < 2 ? `<p class="body-s t2" style="margin:0">Digite pelo menos 2 letras para buscar no cadastro.</p>` : ""}`;
    }
    if (sh.type === "redraw") {
      const teams = liveTeams(), n = sh.sel.length;
      return `<h2 class="title">Sortear de novo</h2>
        <p class="body t2" style="margin:0">Marque os times que vão ser misturados. Os outros ficam iguais.</p>
        <ul class="list">${teams.map((t, i) => { const on = sh.sel.includes(i); return `<li><button class="row${on ? "" : " off"}" data-act="redrawSel" data-arg="${i}" aria-pressed="${on}"><span class="check${on ? " on" : ""}">${on ? ic("check") : ""}</span><span class="name">Time ${i + 1} <span class="t2" style="font-weight:500">· ${t.length < 5 ? t.length + "/5" : L.sumStars(t) + "★"}</span></span>${on ? "" : `<span class="body-s t2">fica igual</span>`}</button></li>`; }).join("")}</ul>
        ${n < 2 ? `<p class="body-s t2" style="margin:0">Marque pelo menos 2 times.</p>` : ""}
        <button class="btn" data-act="doRedraw" ${n < 2 ? "disabled" : ""}>${ic("shuffle", 20)}<span>Sortear ${n} times</span></button>
        <button class="btn sec" data-act="closeSheet">Cancelar</button>`;
    }
    if (sh.type === "menu") {
      return `<h2 class="title">Mais opções</h2>
        <button class="setrow" data-act="askRestart">${ic("refresh", 20)}<span style="flex:1">Tentar novamente</span><span class="body-s t2">com outra lista</span></button>
        <button class="btn sec" data-act="closeSheet">Cancelar</button>`;
    }
    if (sh.type === "copyFallback") {
      return `<h2 class="title">Copie a lista</h2>
        <p class="body t2" style="margin:0">Não deu para copiar. Toque e segure o texto para copiar manualmente.</p>
        <div class="preview">${esc(sh.text)}</div>
        <button class="btn sec" data-act="closeSheet">Fechar</button>`;
    }
    if (sh.type === "player") {
      const d = sh.draft;
      return `<h2 class="title">${sh.isNew ? "Novo jogador" : "Editar jogador"}</h2>
        <label class="field"><span>Nome completo</span><input class="input" id="pd-name" data-in="draft.name" value="${esc(d.name)}"></label>
        ${sh.dup ? `<p class="body-s" style="margin:-6px 0 0;color:var(--danger)">Já existe um ${esc(d.name.trim())}. Use o nome completo para diferenciar, como "Eduardo Lucas".</p>` : ""}
        <div class="field"><span>Apelidos (opcional)</span><div class="chips">${d.aliases.map((a, i) => `<button class="chip" data-act="rmAlias" data-arg="${i}" aria-label="Remover apelido ${esc(a)}">${esc(a)} ${ic("x", 14)}</button>`).join("")}
          <span style="display:inline-flex;gap:6px"><input class="input" id="pd-alias" data-in="draft.newAlias" placeholder="+ Apelido" value="${esc(d.newAlias || "")}" style="height:36px;width:140px;border-radius:18px;font-size:16px"><button class="chip dashed" data-act="addAlias">Adicionar</button></span></div>
          <span class="body-s t2" style="font-weight:500">Como o nome aparece na lista do WhatsApp.</span></div>
        ${d.keeper ? "" : `<div class="field"><span>Estrelas</span>${starPicker("draftStars", 0, d.stars)}</div>`}
        <div class="seg" role="group" aria-label="Tipo"><button class="${d.type === "Mensalista" ? "on" : ""}" data-act="draftType" data-arg="Mensalista">Mensalista</button><button class="${d.type === "Diarista" ? "on" : ""}" data-act="draftType" data-arg="Diarista">Diarista</button></div>
        <div class="row"><span class="ic ico-brand" style="width:22px;height:22px">${ic("glove")}</span><span class="name">Goleiro</span><button class="toggle${d.keeper ? " on" : ""}" data-act="draftToggle" data-arg="keeper" role="switch" aria-checked="${d.keeper}" aria-label="Goleiro"></button></div>
        <div class="row" style="border:0"><span class="name">Ativo<span class="sub" style="display:block">Inativo some da busca e não é reconhecido na lista.</span></span><button class="toggle${d.active ? " on" : ""}" data-act="draftToggle" data-arg="active" role="switch" aria-checked="${d.active}" aria-label="Ativo"></button></div>
        <button class="btn" data-act="savePlayer" ${d.name.trim().length < 2 ? "disabled" : ""}>Salvar</button>`;
    }
    if (sh.type === "schedule") {
      const d = sh.draft;
      return `<h2 class="title">Dia e horário</h2>
        <div class="chips">${[0, 1, 2, 3, 4, 5, 6].map(i => `<button class="chip${d.day === i ? " on" : ""}" data-act="draftDay" data-arg="${i}">${DAYS_S[i]}</button>`).join("")}</div>
        <div style="display:flex;gap:10px"><label class="field" style="flex:1"><span>Começa</span><input class="input" id="sc-start" type="time" data-in="draft.start" value="${esc(d.start)}"></label><label class="field" style="flex:1"><span>Termina</span><input class="input" id="sc-end" type="time" data-in="draft.end" value="${esc(d.end)}"></label></div>
        <button class="btn" data-act="saveSheet">Salvar</button>`;
    }
    if (sh.type === "place") return `<h2 class="title">Local</h2><label class="field"><span>Local</span><input class="input" id="pl-place" data-in="draft.place" value="${esc(sh.draft.place)}"></label><button class="btn" data-act="saveSheet">Salvar</button>`;
    if (sh.type === "nextDate") return `<h2 class="title">Mudar só a próxima</h2><p class="body t2" style="margin:0">Muda a data só desta semana. A regra de toda ${DAYS[S.group.day].toLowerCase()} continua.</p><label class="field"><span>Data</span><input class="input" id="nd-date" type="date" data-in="draft.date" value="${esc(sh.draft.date)}"></label><button class="btn" data-act="saveSheet">Salvar</button>${S.group.dateOverride ? `<button class="btn sec" data-act="clearOverride">Voltar para ${DAYS[S.group.day].toLowerCase()}</button>` : ""}`;
    if (sh.type === "format") return `<h2 class="title">Formato padrão</h2><div class="seg"><button class="${sh.draft.format === "qgf" ? "on" : ""}" data-act="draftSet" data-arg="format|qgf">Quem ganha fica</button><button class="${sh.draft.format === "campeonato" ? "on" : ""}" data-act="draftSet" data-arg="format|campeonato">Estilo campeonato</button></div><button class="btn" data-act="saveSheet">Salvar</button>`;
    if (sh.type === "minutes") return `<h2 class="title">Tempo de jogo</h2><div class="seg"><button class="${sh.draft.minutes === 8 ? "on" : ""}" data-act="draftSet" data-arg="minutes|8">8 min</button><button class="${sh.draft.minutes === 10 ? "on" : ""}" data-act="draftSet" data-arg="minutes|10">10 min</button></div><button class="btn" data-act="saveSheet">Salvar</button>`;
    if (sh.type === "maxWins" || sh.type === "maxFive") {
      const k = sh.type, v = sh.draft[k];
      const title = k === "maxWins" ? "Quem ganha fica até" : "Craques (5★) por time";
      const unit = k === "maxWins" ? (v === 1 ? "jogo" : "jogos") : "no máximo";
      return `<h2 class="title">${title}</h2><div class="stepnum" style="justify-content:center"><button data-act="draftStep" data-arg="-1" aria-label="Menos">−</button><span class="display-m" style="min-width:120px;text-align:center">${v} <span class="body t2">${unit}</span></span><button data-act="draftStep" data-arg="1" aria-label="Mais">+</button></div><button class="btn" data-act="saveSheet">Salvar</button>`;
    }
    return "";
  }

  function viewModal() {
    const m = S.modal;
    if (m.type === "restart") return `<h2 class="title">Começar de novo com outra lista?</h2><p class="body t2" style="margin:0">A lista e os times de hoje serão apagados.</p><button class="btn" data-act="doRestart">Tentar novamente</button><button class="btn sec" data-act="closeModal">Cancelar</button>`;
    if (m.type === "five") return `<h2 class="title">Regra dos craques não fecha</h2><p class="body t2" style="margin:0">Tem ${m.count} craques (5★) para ${m.teams} times: não dá para ter no máximo ${S.group.maxFive} por time. Sortear sem essa regra?</p><button class="btn" data-act="drawIgnoreFive">Sortear assim mesmo</button><button class="btn sec" data-act="closeModal">Voltar</button>`;
    if (m.type === "logout") return `<h2 class="title">Sair do app neste celular?</h2><button class="btn" data-act="doLogout">Sair</button><button class="btn sec" data-act="closeModal">Cancelar</button>`;
    return "";
  }

  /* ---------- ações ---------- */
  function newFlow() { return { step: "paste", text: "", error: false, dateWarn: null, dateOk: false, unknown: [], entries: [], keepers: [], search: "", format: S.group.format, minutes: S.group.minutes }; }

  function processList() {
    const f = S.flow, parsed = L.parseList(f.text);
    f.error = false;
    if (!parsed.players.length) { f.error = true; f.dateWarn = null; return render(); }
    const target = ddmm(peladaDate());
    if (parsed.date && parsed.date !== target && !f.dateOk) { f.dateWarn = parsed.date; return render(); }
    f.dateWarn = null;
    const seen = new Set(); f.entries = []; f.unknown = []; f.keepers = [];
    parsed.players.forEach(e => {
      const m = L.matchName(e.name, S.roster.filter(p => !p.keeper));
      if (m.player) { if (!seen.has(m.player.id)) { seen.add(m.player.id); f.entries.push({ id: m.player.id, present: !e.unpaid }); } }
      else f.unknown.push({ name: e.name, unpaid: e.unpaid, choice: null, newName: e.name, stars: 3, suggestions: m.suggestions.map(p => p.id) });
    });
    parsed.keepers.forEach(e => {
      let k = L.matchName(e.name, S.roster.filter(p => p.keeper)).player;
      if (!k) { k = { id: "k" + (uid++), name: e.name, stars: 3, type: "Diarista", keeper: true, active: true, aliases: [] }; S.roster.push(k); }
      if (!f.keepers.includes(k.id)) f.keepers.push(k.id);
    });
    f.step = f.unknown.length ? "confirm" : "arrived";
    render();
  }

  function finishConfirm() {
    const f = S.flow;
    f.unknown.forEach(u => {
      let id = u.choice;
      if (id === "new") {
        const p = { id: "n" + (uid++), name: (u.newName || u.name).trim(), stars: u.stars, type: "Diarista", keeper: false, active: true, aliases: L.normalize(u.newName) !== L.normalize(u.name) ? [u.name] : [] };
        S.roster.push(p); id = p.id;
      } else {
        const p = P(id); if (p && !p.aliases.some(a => L.normalize(a) === L.normalize(u.name))) p.aliases.push(u.name);
      }
      if (!f.entries.some(e => e.id === id)) f.entries.push({ id, present: !u.unpaid });
    });
    f.step = "arrived"; render();
  }

  function doDraw(ignoreFive) {
    const f = S.flow, players = presentPlayers();
    const teamCount = Math.ceil(players.length / 5);
    const feas = L.fiveRuleFeasible(players, teamCount, S.group.maxFive);
    if (!feas.ok && !ignoreFive) { S.modal = { type: "five", count: feas.count, teams: teamCount }; return render(); }
    const res = L.draw(players, { maxFive: S.group.maxFive, ignoreFive: !!ignoreFive });
    S.drawResult = res; S.modal = null; S.stage = "drawing"; render();
    setTimeout(() => {
      S.live = { teams: res.teams.map(t => t.map(p => p.id)), keepers: f.keepers.slice(), absent: f.entries.filter(e => !e.present).map(e => e.id), late: [], format: f.format, minutes: f.minutes, active: 0, absentOpen: false, highlight: null, scrollTo: 0 };
      S.timer.dur = S.timer.remaining = f.minutes * 60;
      S.stage = "live"; S.flow = null; render();
    }, REDUCED ? 400 : 1900);
  }

  function snapshot() { return JSON.parse(JSON.stringify(S.live)); }

  function lateArrive(id) {
    const prev = snapshot(), lv = S.live;
    const r = L.addLate(lv.teams.map(t => t.map(P)), P(id));
    lv.teams = r.teams.map(t => t.map(p => p.id));
    lv.absent = lv.absent.filter(x => x !== id);
    if (!lv.late.includes(id)) lv.late.push(id);
    lv.active = r.index; lv.scrollTo = r.index; lv.highlight = id;
    const name = P(id).name;
    showToast(r.opened ? `${name} começou o Time ${r.index + 1}` : `${name} entrou no Time ${r.index + 1}`, { undo: () => { S.live = prev; S.live.scrollTo = prev.active; } });
    setTimeout(() => { if (S.live) S.live.highlight = null; }, 700);
  }

  function copyList() {
    const lv = S.live;
    const text = L.whatsappText({ groupName: S.group.name, dateLabel: dateLong().replace(/^Hoje/, DAYS[peladaDate().getDay()]), time: S.group.start, teams: liveTeams(), keepers: lv.keepers.map(P).filter(Boolean), format: lv.format, minutes: lv.minutes });
    const ok = () => showToast("Lista copiada. É só colar no grupo.");
    const fail = () => { S.sheet = { type: "copyFallback", text }; render(); };
    try { navigator.clipboard.writeText(text).then(ok, fail); } catch (e) { fail(); }
  }

  const actions = {
    togglePw() { S.login.show = !S.login.show; render(); },
    tab(arg) { S.tab = arg; S.toast = null; clearTimeout(toastTimer); if (arg === "settings") S.settingsView = "main"; render(); },
    startFlow() { S.flow = newFlow(); S.stage = "flow"; render(); setTimeout(() => { const t = document.getElementById("paste"); t && t.focus(); }, 50); },
    cancelFlow() { S.flow = null; S.stage = "idle"; render(); },
    useExample() { S.flow.text = EXAMPLE; S.flow.error = false; S.flow.dateWarn = null; render(); },
    pasteContinue() { processList(); },
    useListAnyway() { S.flow.dateOk = true; processList(); },
    pasteOther() { S.flow.text = ""; S.flow.dateWarn = null; S.flow.dateOk = false; render(); const t = document.getElementById("paste"); t && t.focus(); },
    backToPaste() { S.flow.step = "paste"; render(); },
    pickUnknown(arg) { const [i, id] = arg.split("|"); S.flow.unknown[+i].choice = id; render(); },
    unknownStars(arg) { const [i, v] = arg.split("|"); S.flow.unknown[+i].stars = +v; render(); },
    confirmContinue() { finishConfirm(); },
    backFromArrived() { S.flow.step = S.flow.unknown.length ? "confirm" : "paste"; render(); },
    togglePresent(id) { const e = S.flow.entries.find(x => x.id === id); e.present = !e.present; render(); },
    toDraw() { if (!S.flow.entries.some(e => e.present)) return; S.flow.step = "draw"; render(); },
    backToArrived() { S.flow.step = "arrived"; render(); },
    setFlow(arg) { const [k, v] = arg.split("|"); S.flow[k] = k === "minutes" ? +v : v; render(); },
    doDraw() { doDraw(false); },
    drawIgnoreFive() { doDraw(true); },
    openAdd(ctx) { S.sheet = { type: "add", ctx, q: "", mode: "search", stars: 3, keeper: false }; render(); setTimeout(() => { const i = document.getElementById("add-q"); i && i.focus(); }, 60); },
    addExisting(id) {
      const sh = S.sheet, p = P(id); S.sheet = null;
      if (sh.ctx === "flow") { if (p.keeper) S.flow.keepers.push(id); else S.flow.entries.push({ id, present: true }); showToast(`${p.name} adicionado.`); }
      else if (p.keeper) { S.live.keepers.push(id); showToast(`${p.name} adicionado como goleiro.`); }
      else lateArrive(id);
      render();
    },
    addAsNew() { S.sheet.mode = "new"; S.sheet.q = S.sheet.q.trim(); render(); },
    addStars(arg) { S.sheet.stars = +arg.split("|")[1]; render(); },
    addKeeper() { S.sheet.keeper = !S.sheet.keeper; render(); },
    addNew() {
      const sh = S.sheet, p = { id: "n" + (uid++), name: sh.q.trim(), stars: sh.stars, type: "Diarista", keeper: sh.keeper, active: true, aliases: [] };
      S.roster.push(p); S.sheet = null;
      if (sh.ctx === "flow") { if (p.keeper) S.flow.keepers.push(p.id); else S.flow.entries.push({ id: p.id, present: true }); showToast(`${p.name} adicionado.`); }
      else if (p.keeper) { S.live.keepers.push(p.id); showToast(`${p.name} adicionado como goleiro.`); }
      else lateArrive(p.id);
      render();
    },
    goTeam(i) { S.live.active = +i; render(); scrollToTeam(+i, true); },
    toggleAbsent() { S.live.absentOpen = !S.live.absentOpen; render(); },
    arrived(id) { lateArrive(id); },
    undo() { const u = S.toast && S.toast.undo; S.toast = null; clearTimeout(toastTimer); if (u) u(); render(); },
    copyList() { copyList(); },
    openRedraw() { S.sheet = { type: "redraw", sel: S.live.teams.map((t, i) => i) }; render(); },
    redrawSel(i) { i = +i; const s = S.sheet.sel; S.sheet.sel = s.includes(i) ? s.filter(x => x !== i) : s.concat(i).sort((a, b) => a - b); render(); },
    doRedraw() {
      const sel = S.sheet.sel, teams = liveTeams();
      const pool = sel.flatMap(i => teams[i]);
      const feas = L.fiveRuleFeasible(pool, sel.length, S.group.maxFive);
      const out = L.redraw(teams, sel, { maxFive: S.group.maxFive, ignoreFive: !feas.ok });
      S.live.teams = out.map(t => t.map(p => p.id)); S.live.late = S.live.late.filter(id => !sel.some(i => S.live.teams[i].includes(id)));
      S.sheet = null;
      const names = sel.map(i => i + 1); const lbl = names.length > 1 ? names.slice(0, -1).join(", ") + " e " + names[names.length - 1] : names[0];
      showToast(`Times ${lbl} sorteados de novo. Copie a lista nova.`);
    },
    openMenu() { S.sheet = { type: "menu" }; render(); },
    askRestart() { S.sheet = null; S.modal = { type: "restart" }; render(); },
    doRestart() { S.modal = null; S.live = null; S.flow = newFlow(); S.stage = "flow"; render(); },
    closeSheet() { S.sheet = null; render(); },
    closeModal() { S.modal = null; render(); },

    tDur(m) { S.timer.dur = S.timer.remaining = +m * 60; render(); },
    tStart() { unlockAudio(); const t = S.timer; t.phase = "running"; t.endAt = Date.now() + t.remaining * 1000; t.lastBuzz = t.remaining <= 60; requestWake(); startTicking(); render(); },
    tPause() { const t = S.timer; t.remaining = Math.max(0, (t.endAt - Date.now()) / 1000); t.phase = "paused"; clearInterval(tick); releaseWake(); render(); },
    tResume() { actions.tStart(); },
    tReset() { const t = S.timer; clearInterval(tick); t.phase = "idle"; t.remaining = t.dur; t.lastBuzz = false; releaseWake(); render(); },
    tAdj(d) {
      const t = S.timer, s = +d * 60;
      if (t.phase === "idle") { t.dur = Math.max(60, Math.min(60 * 30, t.dur + s)); t.remaining = t.dur; }
      else if (t.phase === "running") { t.endAt += s * 1000; t.dur += s; if ((t.endAt - Date.now()) / 1000 > 60) t.lastBuzz = false; }
      else { t.remaining = Math.max(0, t.remaining + s); t.dur += s; }
      render();
    },
    tNext() { stopWhistle(); const t = S.timer; t.phase = "idle"; t.remaining = t.dur; t.lastBuzz = false; render(); },
    tStopWhistle() { stopWhistle(); try { navigator.vibrate && navigator.vibrate(0); } catch (e) {} },

    settingsMain() { S.settingsView = "main"; S.groupDraft = null; render(); },
    openPlayers() { S.settingsView = "players"; render(); },
    openGroup() { S.groupDraft = null; S.settingsView = "group"; render(); },
    saveGroup() { S.group.name = S.groupDraft.name.trim(); S.group.avatar = S.groupDraft.avatar; S.groupDraft = null; S.settingsView = "main"; showToast("Pelada salva."); },
    pFilter(k) { S.playersFilter = k; render(); },
    editPlayer(id) { const p = P(id); S.sheet = { type: "player", id, draft: { name: p.name, aliases: p.aliases.slice(), stars: p.stars, type: p.type, keeper: p.keeper, active: p.active, newAlias: "" } }; render(); },
    newPlayer(arg) { S.sheet = { type: "player", isNew: true, draft: { name: arg === "q" ? S.playersQuery : "", aliases: [], stars: 3, type: "Diarista", keeper: false, active: true, newAlias: "" } }; render(); },
    draftStars(arg) { S.sheet.draft.stars = +arg.split("|")[1]; render(); },
    draftType(v) { S.sheet.draft.type = v; render(); },
    draftToggle(k) { S.sheet.draft[k] = !S.sheet.draft[k]; render(); },
    addAlias() { const d = S.sheet.draft, a = (d.newAlias || "").trim(); if (a && !d.aliases.includes(a)) d.aliases.push(a); d.newAlias = ""; render(); },
    rmAlias(i) { S.sheet.draft.aliases.splice(+i, 1); render(); },
    savePlayer() {
      const sh = S.sheet, d = sh.draft, name = d.name.trim();
      if (S.roster.some(p => p.id !== sh.id && L.normalize(p.name) === L.normalize(name))) { sh.dup = true; return render(); }
      if (sh.isNew) S.roster.push({ id: "n" + (uid++), name, aliases: d.aliases, stars: d.stars, type: d.type, keeper: d.keeper, active: d.active });
      else Object.assign(P(sh.id), { name, aliases: d.aliases, stars: d.stars, type: d.type, keeper: d.keeper, active: d.active });
      S.sheet = null; showToast("Jogador salvo.");
    },
    openSheet(type) {
      const g = S.group;
      const draft = { day: g.day, start: g.start, end: g.end, place: g.place, format: g.format, minutes: g.minutes, maxWins: g.maxWins, maxFive: g.maxFive, date: peladaDate().toISOString().slice(0, 10) };
      S.sheet = { type, draft }; render();
    },
    draftDay(i) { S.sheet.draft.day = +i; render(); },
    draftSet(arg) { const [k, v] = arg.split("|"); S.sheet.draft[k] = k === "minutes" ? +v : v; render(); },
    draftStep(d) { const k = S.sheet.type, lim = k === "maxWins" ? [1, 6] : [1, 3]; S.sheet.draft[k] = Math.max(lim[0], Math.min(lim[1], S.sheet.draft[k] + +d)); render(); },
    saveSheet() {
      const { type, draft } = S.sheet, g = S.group;
      if (type === "schedule") { g.day = draft.day; g.start = draft.start; g.end = draft.end; g.dateOverride = null; }
      else if (type === "nextDate") g.dateOverride = draft.date;
      else g[type] = draft[type];
      if (type === "minutes" && S.timer.phase === "idle") S.timer.dur = S.timer.remaining = draft.minutes * 60;
      S.sheet = null; showToast("Ajuste salvo.");
    },
    clearOverride() { S.group.dateOverride = null; S.sheet = null; showToast("Ajuste salvo."); },
    askLogout() { S.modal = { type: "logout" }; render(); },
    doLogout() { S.modal = null; S.screen = "login"; S.login = { email: "", pass: "", show: false, error: false }; render(); },
  };

  /* ---------- eventos ---------- */
  $app.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el || !$app.contains(el)) return;
    if (el.disabled) return;
    const fn = actions[el.dataset.act]; if (!fn) return;
    e.preventDefault(); fn(el.dataset.arg);
  });
  $app.addEventListener("submit", e => {
    e.preventDefault();
    if (e.target.dataset.form === "login") {
      const l = S.login;
      if (!l.email.trim() || !l.pass) { l.error = true; return render(); }
      l.error = false; S.screen = "app"; S.tab = "times"; render();
    }
  });
  $app.addEventListener("input", e => {
    const el = e.target, path = el.dataset.in; if (!path) return;
    const v = el.value, [a, b] = path.split(".");
    if (a === "login") { S.login[b] = v; if (S.login.error) { S.login.error = false; render(); } return; }
    if (a === "flow") { S.flow[b] = v; if (b === "search") render(); return; }
    if (a === "unknownName") { S.flow.unknown[+b].newName = v; return; }
    if (a === "sheet") { S.sheet[b] = v; render(); return; }
    if (a === "draft") { S.sheet.draft[b] = v; if (b === "name") { S.sheet.dup = false; render(); } return; }
    if (a === "playersQuery") { S.playersQuery = v; render(); return; }
    if (a === "groupDraft") { S.groupDraft.name = v; render(); return; }
  });
  $app.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.id === "pd-alias") { e.preventDefault(); actions.addAlias(); }
    if (e.key === "Escape") { if (S.sheet) actions.closeSheet(); else if (S.modal) actions.closeModal(); }
  });
  $app.addEventListener("change", e => {
    const el = e.target;
    if (el.dataset.file === "avatar" && el.files && el.files[0]) {
      const r = new FileReader(); r.onload = () => { S.groupDraft.avatar = r.result; render(); }; r.readAsDataURL(el.files[0]);
    }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && S.timer.phase === "running") { requestWake(); paintTimer(); } });

  render();
})();
