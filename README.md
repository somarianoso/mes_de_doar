# Mês do Doar · PoliSat

Central de conteúdo da campanha **Mês do Doar** do PoliSat com a Amigos da Poli (09/11 a 01/12/2026). O site é estático e roda no GitHub Pages. Para cada dia útil da campanha ele oferece:

- uma **arte no formato de post do Instagram** (1080 × 1350), no estilo visual do PoliSat;
- uma **mensagem pronta para o WhatsApp**, com botões para copiar ou abrir direto no WhatsApp;
- uma **legenda para o Instagram**.

Toda arte inclui, sempre, a logo do PoliSat, a logo da Amigos da Poli, o link de doação **[doa.re/RzAT](https://doa.re/RzAT)** e um QR code para esse link.

## Como usar

1. Escolha um dia no calendário. O dia de hoje aparece marcado.
2. **Baixar imagem** salva o PNG para publicar no Instagram. No celular, **Compartilhar imagem + texto** envia a arte e a mensagem juntas (WhatsApp, Instagram etc.).
3. Na aba **WhatsApp**, copie a mensagem ou toque em **Abrir no WhatsApp**. Na aba **Instagram**, copie a legenda.
4. Na aba **Editar arte**, mude qualquer texto, troque o modelo, o fundo e as fotos. A prévia atualiza na hora.
   - `*asteriscos*` destacam trechos em roxo na arte e viram negrito no WhatsApp.
   - Nas fotos, arraste na prévia para reenquadrar e use a roda do mouse ou o controle de zoom.
   - As edições são salvas automaticamente **neste navegador**. **Restaurar original** desfaz as alterações do post. Para compartilhar uma versão editada, baixe a imagem e copie a mensagem.

## Como as artes são feitas

As artes não são imagens fixas: cada post é descrito por dados e desenhado em canvas pelo mesmo código no site, nas miniaturas, no editor e na exportação.

| Arquivo | Papel |
| --- | --- |
| `assets/js/posts.js` | Conteúdo da campanha: modelo, textos, fotos, mensagem de WhatsApp e legenda de cada dia. |
| `assets/js/render.js` | Renderizador e os modelos: **Destaque**, **Número em destaque**, **Lista (estilo cronograma)**, **Janela**, **Foto polaroid** e **Mosaico de fotos**. Desenha também a moldura fixa (logos, link e QR code). |
| `assets/js/app.js` | Interface: calendário, prévia, editor, mensagens e download. |
| `assets/fotos/` | Fotos da equipe recortadas de `imagens_base/`. |
| `assets/logos/` | Logos usadas nas artes (cópias das originais em `logo_para_colocar_nas_imagens_geradas/`). |
| `assets/fonts/` | Poppins (licença OFL), parecida com a tipografia das artes base. |
| `posts/` | PNGs exportados e `MENSAGENS.md` com todos os textos. |

O visual segue `imagens_base/`: fundo preto estrelado com nebulosa azul e roxa, títulos azul PoliSat com contorno ciano e magenta, destaques em lilás e roxo, caixas brancas com etiquetas roxas e CubeSats decorativos. Os textos se ajustam sozinhos ao espaço disponível, então editar não quebra o layout.

Para mudar o conteúdo de forma permanente para todo mundo, edite `assets/js/posts.js` e faça push. O GitHub Pages publica sozinho.

## Desenvolvimento

Requer Node 18 ou mais recente.

```bash
npm run dev          # prévia local em http://localhost:4173
npm install          # instala o Playwright (só necessário para exportar)
npx playwright install chromium
npm run exportar     # gera posts/*.png e posts/MENSAGENS.md
```

Abra o site por um servidor (`npm run dev`), não pelo arquivo direto: o navegador bloqueia a geração do PNG em páginas `file://`.

## Publicação no GitHub Pages

O workflow `.github/workflows/pages.yml` publica `index.html`, `assets/` e `posts/` a cada push na `main`. Na primeira vez, em **Settings → Pages**, selecione **GitHub Actions** como fonte. Endereço esperado: `https://somarianoso.github.io/mes_de_doar/`.
