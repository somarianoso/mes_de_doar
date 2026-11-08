# Mês do Doar · PoliSat

Site estático da campanha, feito para GitHub Pages. Não pede credenciais do Instagram: a equipe baixa a imagem e publica pelo aplicativo do Instagram.

## Publicação no GitHub Pages

O workflow em `.github/workflows/pages.yml` publica o site sempre que há um push para `main`. Na primeira publicação, abra **Settings → Pages** no repositório e selecione **GitHub Actions** como fonte de build.

O endereço esperado para este repositório é `https://somarianoso.github.io/mes_de_doar/`.

O workflow envia ao Pages a página, a arte de exemplo e as duas logos em SVG usadas pelo editor. As imagens base e os demais arquivos locais não são incluídos no site.

## Como usar

- Escolha um post no calendário.
- No exemplo gerado, use **Editar imagem** para trocar a imagem, arrastá-la para reenquadrar, ajustar zoom, brilho, contraste e saturação ou inserir e reposicionar texto. Ao trocar a imagem, as logos da PoliSat e do Amigos da Poli e o espaço vazio para o link de doação são aplicados automaticamente.
- **Salvar edição** guarda a versão editada neste navegador. Use **Baixar imagem** para obter o PNG final e publicar no Instagram manualmente.
- **Copiar legenda** copia o texto sugerido.

As edições são locais ao navegador e não aparecem automaticamente para outras pessoas. Para compartilhar uma edição, baixe o PNG e envie-o à equipe.

## Prévia local

Inicie um servidor estático na pasta do projeto, por exemplo `python3 -m http.server 4173`, e acesse `http://localhost:4173`.
