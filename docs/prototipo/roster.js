/* Cadastro de exemplo. Estrelas INVENTADAS para o protótipo — corrigir em Ajustes → Jogadores. */
(function (root) {
  const R = [
    ["Juninho",5,"m"],["Márcio",3,"d"],["Eduardo",4,"m"],["Josué",3,"m"],["Rafael",3,"m"],["Derik",4,"m"],
    ["Fabiano",3,"m"],["Yhan",4,"m"],["Hugo",3,"d"],["Junior",4,"m"],["Herlly",3,"m"],["Cleyton",3,"m"],
    ["Léo",2,"m"],["Arllen",5,"m"],["Leandro",3,"m"],["Adelson",3,"m"],["Eduardo Lucas",3,"d"],
    ["João Vitor",2,"d"],["Guilherme",3,"d"],["Paulinho",2,"d"],["Jackson",4,"d"],["Murilo",3,"d"],["Pedro",2,"d"],
    ["Felipe Gomes",5,"m"],["Isaac",3,"m"],["Kauã",2,"d"],["João Pedro",3,"d"],["Renê",3,"d"],["Mago",4,"d"],
    ["Thiago",3,"d"],["Azineu",2,"d"]
  ];
  const players = R.map((r, i) => ({ id: "p" + (i + 1), name: r[0], stars: r[1], type: r[2] === "m" ? "Mensalista" : "Diarista", keeper: false, active: true, aliases: [] }));
  players.push({ id: "g1", name: "Renan Araujo", stars: 3, type: "Mensalista", keeper: true, active: true, aliases: ["Renan"] });
  players.push({ id: "g2", name: "Richard", stars: 3, type: "Diarista", keeper: true, active: true, aliases: [] });
  const api = { players };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Roster = api;
})(typeof window !== "undefined" ? window : globalThis);
