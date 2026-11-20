# MASCOTE.md — O calango da Pelada dos Brabos

Prompts prontos para gerar as imagens do calango. Cada cena tem **ângulo de câmera diferente** e **fundo de acordo com a situação**. Complementa o `DESIGN.md` (seção 9).

---

## 1. Como usar

1. **Sempre anexe a imagem de referência do calango** (a original, de pé com o pé na bola). É ela que segura o personagem igual.
2. Cada prompt abaixo já está completo: é só copiar o bloco inteiro.
3. Gere 3 ou 4 variações e escolha a que tiver o calango mais parecido com a referência (crista, olhos, uniforme). Ângulo e cenário podem variar; o personagem não.
4. Se o gerador insistir no mesmo ângulo da referência, reforce no começo do prompt: "Câmera em [ângulo]. NÃO repetir a pose nem o ângulo da imagem de referência; usar a referência só para o design do personagem."

### Blocos que se repetem (já estão dentro de cada prompt)

**Personagem**
> um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, corpo atlético esguio e cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante, calção esportivo cinza-carvão com listras laterais finas em laranja, meiões laranja-queimado, chuteiras escuras e um apito metálico prateado pendurado em um cordão preto no pescoço.

**Estilo**
> Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.

---

## 2. Visão geral das cenas

| # | Cena | Ângulo | Fundo | Formato | Prioridade |
| --- | --- | --- | --- | --- | --- |
| 1 | Ícone do app | Close, 3/4 frontal, câmera levemente baixa | Sólido grafite | 1:1 · 1024 px | **Alta** |
| 2 | Avatar | Busto, 3/4 virado para o outro lado | Transparente | 1:1 · 512 px | **Alta** |
| 3 | Próxima pelada | Corpo inteiro, 3/4, câmera baixa | Estádio à noite | 4:3 · 1600 × 1200 | **Alta** |
| 4 | Login | Plano americano, de frente, andando para a câmera | Túnel do vestiário | 4:5 · 1200 × 1500 | Média |
| 5 | Sorteando | 3/4 de cima (plongée leve) | Palco de cerimônia de sorteio | 1:1 · 1200 px | Média |
| 6 | Fim de jogo | Contra-plongée forte (de baixo para cima) | Céu laranja com refletores | 4:5 · 1200 × 1500 | Média |
| 7 | Esperando a galera | Perfil lateral, sentado | Transparente (só o banco) | 1:1 · 600 px | Baixa |
| 8 | Todo mundo chegou | De frente, câmera de cima, pulando | Transparente | 1:1 · 600 px | Baixa |
| 9 | Prancheta vazia | De costas, olhando por cima do ombro | Transparente | 1:1 · 600 px | Baixa |
| 10 | Cronômetro (B1) | Busto, 3/4, olhando para o cronômetro na mão | Transparente | 1:1 · 1024 px | **Alta** |
| 10b | Fim de jogo (B1) | Busto, de frente, apitando e mostrando o cronômetro | Transparente | 1:1 · 1024 px | **Alta** |

**Por que algumas sem fundo:** as cenas 7, 8 e 9 aparecem pequenas (cerca de 120 px) dentro de telas do app. Com cenário, viram uma mancha. A 2 é recortada em círculo.

---

## 3. Prompts

### Cena 1 — Ícone do app

```
Ícone de aplicativo quadrado 1:1, ilustração vetorial flat seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, corpo atlético esguio e cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante e um apito metálico prateado pendurado em um cordão preto no pescoço.

Enquadramento: close da cabeça e dos ombros, corpo em 3/4 virado para a direita, rosto voltado para quem vê, câmera levemente abaixo da linha dos olhos, cabeça levemente inclinada, sorriso de canto e uma sobrancelha erguida. A cabeça fica centralizada e ocupa cerca de 70% da largura, inteira dentro do círculo central da imagem, com a crista sem encostar na borda.

Fundo sólido cinza-grafite escuro #0E141B, com um anel circular fino laranja-queimado atrás da cabeça. Formas simples e grandes, legível mesmo em tamanho muito pequeno.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

### Cena 2 — Avatar

```
Ilustração vetorial flat quadrada 1:1 com fundo transparente, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante e um apito metálico prateado pendurado em um cordão preto no pescoço.

Enquadramento: busto (do peito para cima), corpo em 3/4 virado para a ESQUERDA, olhando de canto de olho para quem vê, braços cruzados na frente do peito, queixo levemente erguido. Personagem centralizado, cabeça no terço superior, preparado para ser recortado em círculo.

Fundo totalmente transparente, sem chão e sem sombra projetada.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

### Cena 3 — Próxima pelada (card da tela Times)

```
Ilustração vetorial flat editorial limpa para o topo de um card de aplicativo mobile em modo escuro, formato horizontal 4:3, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, corpo atlético esguio e cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante, calção esportivo cinza-carvão com listras laterais finas em laranja, meiões laranja-queimado, chuteiras escuras e um apito metálico prateado pendurado em um cordão preto no pescoço.

Câmera baixa, levemente abaixo da linha da cintura, olhando para cima, com o corpo em 3/4. Ele está em pé com postura orgulhosa, a mão direita na cintura, a outra mão girando o apito pelo cordão, e o pé esquerdo apoiado em cima de uma bola de futebol clássica preta e branca no gramado. Posicionado à direita do centro, corpo inteiro visível da crista à bola, ocupando cerca de 70% da altura. O terço inferior da imagem tem menos detalhe.

Fundo: estádio de futebol minimalista e estilizado à noite, marcações de campo em verde-petróleo escuro em perspectiva, torres de refletores sutis acesas com halos de luz e arquibancadas em cinza-ardósia escuro.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

> Se o gerador permitir, gere também **só o estádio** (mesmo prompt sem o personagem) e **só o calango com fundo transparente**. Com as duas camadas separadas, o app anima a entrada do calango.

### Cena 4 — Login

```
Ilustração vetorial flat vertical 4:5, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, corpo atlético esguio e cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante, calção esportivo cinza-carvão com listras laterais finas em laranja, meiões laranja-queimado, chuteiras escuras e um apito metálico prateado pendurado em um cordão preto no pescoço.

Câmera de frente, na altura do peito, plano americano (dos joelhos para cima). Ele caminha em direção a quem vê, no meio de um passo, acenando com uma mão aberta e segurando uma prancheta debaixo do outro braço, sorriso de canto acolhedor.

Fundo: túnel de acesso ao gramado de um estádio, paredes de concreto cinza-ardósia escuro com faixas de luz no teto, e no fim do túnel uma abertura iluminada mostrando o gramado verde-petróleo e a luz dos refletores, criando contraluz suave nas bordas do personagem. Personagem centralizado, metade inferior da imagem mais escura e simples.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

### Cena 5 — Sorteando

```
Ilustração vetorial flat quadrada 1:1, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, corpo atlético esguio e cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante e um apito metálico prateado pendurado em um cordão preto no pescoço.

Câmera em 3/4, levemente de cima para baixo (plongée suave). Ele está atrás de uma mesa de cerimônia de sorteio de campeonato, como num sorteio de Copa do Mundo: tem quatro grandes potes de vidro transparentes cheios de bolinhas plásticas, uma bolinha aberta ao meio na mão esquerda revelando um papelzinho dobrado, e a mão direita erguendo o papel em direção a quem vê, com expressão de suspense e sorriso de canto.

Fundo: palco de cerimônia de sorteio à noite, painel escuro cinza-ardósia ao fundo com holofotes cruzando em feixes suaves, piso brilhante escuro refletindo as luzes, pequenos pontos de luz desfocados. Destaques em laranja-queimado e verde-esmeralda nas luzes. Personagem e potes centralizados.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais (sem logotipo de federação ou campeonato), sem botões, sem mockup de celular e sem elementos de interface.
```

> Para a animação, gere também 2 quadros extras com a mesma câmera: **(a)** com a mão dentro do pote pegando a bolinha e **(b)** com a bolinha fechada na mão, olhando para ela.

### Cena 6 — Fim de jogo

```
Ilustração vetorial flat vertical 4:5, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, corpo atlético esguio e cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante, calção esportivo cinza-carvão com listras laterais finas em laranja, meiões laranja-queimado, chuteiras escuras e um apito metálico prateado pendurado em um cordão preto no pescoço.

Câmera bem baixa, perto do chão, olhando para cima (contra-plongée forte), dando sensação de grandeza. Ele sopra o apito com força, bochechas cheias e olhos fechados, um braço esticado apontando para o céu, o outro punho fechado junto ao corpo, cauda em movimento. Pequenas linhas de som saindo do apito.

Fundo: céu noturno em tons de laranja-queimado intenso e laranja-escuro, com silhuetas de torres de refletores em laranja ainda mais escuro e feixes de luz cruzando, combinando com uma tela de aplicativo toda laranja. Personagem centralizado, com bom contraste do verde contra o laranja.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

### Cena 7 — Esperando a galera

```
Ilustração vetorial flat quadrada 1:1, pequena e simples, com fundo transparente, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão levemente impaciente mas simpática, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante, calção cinza-carvão, meiões laranja-queimado, chuteiras escuras e um apito prateado no pescoço.

Câmera de perfil lateral, na altura dos olhos. Ele está sentado num banco de reservas simples, uma perna cruzada balançando, olhando para o relógio no pulso com uma sobrancelha erguida, a bola parada no chão ao lado do banco.

Só o personagem, o banco e a bola, sem cenário, com uma sombra suave no chão. Formas grandes e poucas, legível em tamanho pequeno.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

### Cena 8 — Todo mundo chegou

```
Ilustração vetorial flat quadrada 1:1, pequena e simples, com fundo transparente, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão alegre e confiante, sorriso aberto, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante, calção cinza-carvão, meiões laranja-queimado, chuteiras escuras e um apito prateado no pescoço.

Câmera de frente, levemente de cima para baixo. Ele está no meio de um pulinho de comemoração, os dois polegares para cima, joelhos dobrados, cauda erguida, apito balançando.

Só o personagem, sem cenário, com uma sombra suave no chão. Formas grandes e poucas, legível em tamanho pequeno.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

### Cena 9 — Prancheta vazia

```
Ilustração vetorial flat quadrada 1:1, pequena e simples, com fundo transparente, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confusa e bem-humorada, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga, cauda curvada. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante, calção cinza-carvão, meiões laranja-queimado, chuteiras escuras e um apito prateado no pescoço.

Câmera em 3/4 de costas, ele olhando para quem vê por cima do ombro. Com uma mão segura uma prancheta virada para a câmera, com a folha em branco, sem nada escrito. Com a outra mão coça a cabeça perto da crista.

Só o personagem, sem cenário, com uma sombra suave no chão. Formas grandes e poucas, legível em tamanho pequeno.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

### Cena 10 — Cronômetro (centro do anel, direção B1)

Fica num círculo de 200 px no centro do anel do cronômetro. O app coloca o fundo `#222D39` atrás e recorta em círculo, então o calango precisa caber inteiro no **círculo central** da imagem.

```
Ilustração vetorial flat quadrada 1:1 com fundo transparente, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante e um apito metálico prateado pendurado em um cordão preto no pescoço.

Enquadramento: busto (do peito para cima), corpo em 3/4 virado para a direita, câmera na altura dos olhos. Com a mão direita ele segura um cronômetro esportivo de mão, prateado e redondo, com botão no topo e mostrador branco limpo com ponteiro (sem números escritos), erguido na altura do rosto, ao lado da bochecha. Ele olha de canto de olho para o cronômetro, uma sobrancelha erguida e sorriso de canto, como quem está controlando o tempo do jogo. O polegar está apoiado no botão do cronômetro.

Composição para recorte circular: cabeça, crista, mão e cronômetro inteiros dentro de um círculo central que ocupa 85% da imagem; nada importante perto dos cantos. O cronômetro não pode encostar na borda.

Fundo totalmente transparente, sem chão e sem sombra projetada.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem números no mostrador, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

### Cena 10b — Fim de jogo (centro do anel, tela laranja)

Mesmo círculo de 200 px, agora sobre a tela laranja do fim de jogo (`#C24B17`), com borda branca. Arquivo: `cronometro-fim.png`.

```
Ilustração vetorial flat quadrada 1:1 com fundo transparente, seguindo estritamente o mesmo design de personagem, proporções, estilo de arte e paleta de cores da imagem de referência anexada: um mascote calango brasileiro antropomórfico verde com expressão confiante, competitiva e levemente marrenta, olhos angulados, crista pontiaguda verde-esmeralda na cabeça e nas costas, sombreado verde-limão claro na mandíbula e barriga. Ele veste a camisa esportiva cinza-carvão escura com gola e punhos laranja-queimado vibrante e um apito metálico prateado pendurado em um cordão preto no pescoço.

Enquadramento: busto (do peito para cima), corpo de frente levemente virado para a esquerda, câmera um pouco abaixo da linha dos olhos. Ele está apitando com força: o apito prateado na boca, bochechas cheias de ar, olhos fechados de esforço e sobrancelhas franzidas. Com a mão esquerda ele estica o braço e mostra para quem vê o mesmo cronômetro esportivo de mão, prateado e redondo, com o mostrador branco limpo virado para frente e o ponteiro no topo (sem números escritos). Três pequenas linhas curvas de som saem do apito.

Composição para recorte circular: cabeça, crista, apito, linhas de som, mão e cronômetro inteiros dentro de um círculo central que ocupa 85% da imagem; nada importante perto dos cantos.

Fundo totalmente transparente, sem chão e sem sombra projetada. O personagem precisa ter bom contraste sobre um fundo laranja intenso: nada de contornos ou brilhos laranja nas bordas do personagem.

Arte vetorial limpa sem contornos pretos, degradês suaves estilo cel-shading, bordas nítidas, sem textos, sem números no mostrador, sem logos ou marcas reais, sem botões, sem mockup de celular e sem elementos de interface.
```

---

## 4. Checklist de cada imagem gerada

- [ ] Crista, olhos angulados e sorriso de canto iguais aos da referência.
- [ ] Uniforme certo: camisa e calção grafite, gola e punhos laranja, meiões laranja, apito prateado.
- [ ] Ângulo diferente do da referência (exceto a cena 3, que pode ser parecida).
- [ ] Nada cortado: crista, cauda, chuteiras.
- [ ] Sem texto, número, logo ou marca em lugar nenhum (inclusive nos potes do sorteio e na prancheta).
- [ ] Fundo transparente nas cenas 2, 7, 8 e 9.
- [ ] Funciona sobre o fundo do app (`#0E141B`); a cena 6 também sobre laranja (`#C24B17`).

---

## 5. Entrega dos arquivos

- Coloque em `public/mascote/` no projeto, com estes nomes:
  `icone-1024.png`, `avatar.png`, `proxima-pelada.png` (ou `cena-estadio.png` + `calango-pe-na-bola.png`), `login.png`, `sorteando.png` (+ `sorteando-a.png`, `sorteando-b.png`), `fim-de-jogo.png`, `cronometro.png` (+ `cronometro-fim.png`), `esperando.png`, `todo-mundo-chegou.png`, `prancheta-vazia.png`.
- Depois de gerar, converter para **WebP** para o app (mais leve) e guardar os PNG originais fora do app.
- Peso alvo: até 150 KB por cena com fundo, até 60 KB para as pequenas.
- Quando o ícone 1024 estiver pronto, ele vira os arquivos do app: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` (180) e `favicon-32.png`.
