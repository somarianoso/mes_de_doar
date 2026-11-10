/*
 * Conteúdo da campanha Mês do Doar · PoliSat (09/11 a 01/12/2026, dias úteis).
 *
 * Cada post define a arte (template + campos, desenhada por render.js), a mensagem
 * de WhatsApp e a legenda do Instagram. Nos textos da arte, *asteriscos* destacam
 * o trecho em roxo. Nas mensagens, *asteriscos* viram negrito no próprio WhatsApp.
 */
(function (global) {
  'use strict';

  const LINK = 'https://doa.re/RzAT';
  const f = (src, zoom = 1, x = 0, y = 0) => ({ src: 'assets/fotos/' + src, zoom, x, y });
  const tags = '#MêsDoDoar #DiaDeDoar #PoliSat #AmigosDaPoli #PoliUSP #EngenhariaEspacial';

  const posts = [
    {
      data: '2026-11-09', tema: 'Abertura da campanha', template: 'destaque', fundo: 'nebulosa',
      campos: {
        titulo: 'MÊS DO\nDOAR',
        subtitulo: 'Começou a *contagem regressiva!*',
        texto: 'Até *01/12*, cada doação ajuda estudantes da Poli a projetar, construir e testar *satélites de verdade*.',
        selo: '09/11 → 01/12',
      },
      whatsapp: `🚀 *Começou o Mês do Doar!*

Oi! Tudo bem? Eu faço parte do *PoliSat*, o grupo de satélites da Poli-USP. Até *01/12* estamos arrecadando doações, em parceria com a Amigos da Poli, para continuar projetando, construindo e testando satélites feitos por estudantes.

Qualquer valor ajuda, e é rapidinho 💙💜
👉 ${LINK}

Se puder, encaminha para quem também acredita na engenharia brasileira! 🛰️`,
      legenda: `Começou o Mês do Doar! 🚀

Até 01/12, sua doação ajuda o PoliSat a projetar, construir e testar satélites feitos por estudantes da Poli-USP. Qualquer valor faz diferença.

💜 Doe: doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-10', tema: 'Quem somos', template: 'foto', fundo: 'galaxia',
      campos: {
        foto: f('equipe-mission-patch.jpg', 1.05, 0, 0.2),
        legenda: 'Somos o PoliSat',
        sublegenda: 'Estudantes da *Poli-USP* construindo satélites',
      },
      whatsapp: `🛰️ Você conhece o *PoliSat*?

Somos estudantes da Escola Politécnica da USP que projetam e constroem satélites: da estrutura ao software de bordo. Tudo isso fora da sala de aula, com muita dedicação.

Neste *Mês do Doar*, sua contribuição faz esse trabalho continuar 💙
👉 ${LINK}`,
      legenda: `Prazer, somos o PoliSat! 🛰️

Um grupo de estudantes da Poli-USP que transforma teoria em satélite. Neste Mês do Doar, você pode fazer parte da nossa próxima missão.

💜 Doe: doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-11', tema: 'Um satélite, várias áreas', template: 'lista', fundo: 'profundo',
      campos: {
        titulo: 'UM SATÉLITE,\nVÁRIAS ÁREAS',
        itens: 'Controle de atitude | ADCS\nEnergia e baterias | EPS\nComputador de bordo | OBC\nComunicação com a Terra | TT&C\nControle térmico | TCS',
        rodape: 'Sua doação apoia *todas elas*.',
      },
      whatsapp: `🔧 Você sabia que um satélite é feito de vários sistemas trabalhando juntos?

No *PoliSat*, estudantes da Poli cuidam de cada um deles: controle de atitude (ADCS), energia (EPS), computador de bordo (OBC), comunicação (TT&C) e controle térmico (TCS).

É engenharia de verdade, aprendida na prática. Ajude a gente a continuar 💜
👉 ${LINK}`,
      legenda: `Um satélite, várias engenharias. ⚙️

ADCS, EPS, OBC, TT&C, TCS: cada subsistema é desenvolvido por estudantes do PoliSat. Sua doação no Mês do Doar apoia todos eles.

💜 Doe: doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-12', tema: 'Missão HERMES na LASC', template: 'numero', fundo: 'nebulosa',
      campos: {
        antes: 'Missão *HERMES-214*',
        numero: '7ª LASC',
        depois: 'Latin American Space Challenge',
        texto: 'Em setembro de 2026, levamos nosso satélite a *Iacanga/SP* para competir com equipes de vários países.',
      },
      whatsapp: `🏆 Em setembro, o *PoliSat* levou a missão *HERMES-214* para a 7ª *Latin American Space Challenge* (LASC), em Iacanga/SP, competindo com equipes de vários países.

Chegar lá exige muito trabalho, peças, testes e viagem. Com a sua ajuda, a próxima missão vai ainda mais longe 🚀
👉 ${LINK}`,
      legenda: `HERMES-214 na 7ª LASC 🚀

Em setembro levamos nosso satélite à Latin American Space Challenge, em Iacanga/SP. Quer ver o PoliSat ir ainda mais longe? Doe no Mês do Doar.

💜 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-13', tema: 'Bastidores da LASC', template: 'mosaico', fundo: 'galaxia',
      campos: {
        titulo: 'BASTIDORES\nDA LASC',
        fotos: [f('palco-lasc.jpg', 1, 0, -0.75), f('stand-lasc.jpg', 1, 0, -0.2), f('iacanga.jpg', 1, 0, -0.3), f('lancamento.jpg')],
        legenda: 'Experiências que *sua doação* torna possíveis.',
      },
      whatsapp: `📸 Bastidores da nossa ida à *LASC 2026*!

Noites de montagem, testes até o último minuto e a equipe inteira no palco com a bandeira do *PoliSat*. É esse tipo de experiência que forma engenheiros prontos para o setor espacial.

Ajude mais estudantes a viverem isso 💙💜
👉 ${LINK}`,
      legenda: `Bastidores da LASC 2026 📸

Stand, montagem, lançamento e muita equipe. Experiências assim só acontecem com apoio, e o seu faz diferença.

💜 Doe no Mês do Doar: doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-16', tema: 'Para onde vai sua doação', template: 'lista', fundo: 'nebulosa',
      campos: {
        titulo: 'PARA ONDE VAI\nSUA DOAÇÃO?',
        itens: 'Componentes e sensores | HARDWARE\nProtótipos e testes | BANCADA\nViagens para competições | MISSÕES\nFerramentas e materiais | LAB',
        rodape: '*Cada real* vira engenharia.',
      },
      whatsapp: `💡 *Para onde vai a sua doação?*

No *PoliSat*, ela vira componentes e sensores, protótipos e testes em bancada, viagens para competições e ferramentas para o laboratório.

Ou seja: cada real vira engenharia de verdade, feita por estudantes da Poli 🛰️
👉 ${LINK}`,
      legenda: `Para onde vai sua doação? 💡

Componentes, testes, competições e laboratório. No PoliSat, cada real vira engenharia.

💜 Doe: doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-17', tema: 'Por que doar', template: 'janela', fundo: 'galaxia',
      campos: {
        titulo: 'ALÉM DA\nSALA DE AULA',
        texto: 'Na aula, a gente aprende a teoria. No PoliSat, a gente *projeta, constrói, testa e erra* até dar certo. É assim que se forma quem vai levar o Brasil ao espaço.',
        rodape: 'Faça parte disso!',
      },
      whatsapp: `🎓 Na sala de aula a gente aprende a teoria. No *PoliSat*, a gente projeta, constrói, testa e erra até dar certo.

É assim que se forma quem vai levar o Brasil ao espaço. E você pode fazer parte disso com uma doação de qualquer valor 💜
👉 ${LINK}

Obrigado por apoiar! 🚀`,
      legenda: `Vá além da sala de aula. 🎓🚀

No PoliSat, teoria vira satélite. Ajude a formar a próxima geração da engenharia espacial brasileira.

💜 Doe: doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-18', tema: 'Como doar', template: 'lista', fundo: 'profundo',
      campos: {
        titulo: 'COMO DOAR\nEM 3 PASSOS',
        itens: 'Acesse *doa.re/RzAT* | 1\nEscolha o valor | 2\nConclua a doação | 3',
        rodape: 'É *rapidinho*. E faz muita diferença!',
      },
      whatsapp: `✅ *Doar para o PoliSat é simples:*

1️⃣ Acesse ${LINK}
2️⃣ Escolha o valor
3️⃣ Conclua a doação

Pronto! Você acabou de ajudar estudantes da Poli a construir satélites 🛰️💙
Se puder, manda para mais alguém também!`,
      legenda: `Como doar em 3 passos ✅

1. Acesse doa.re/RzAT
2. Escolha o valor
3. Conclua a doação

Simples assim. Obrigado por apoiar o PoliSat! 💜

${tags}`,
    },
    {
      data: '2026-11-19', tema: 'Feito por estudantes', template: 'numero', fundo: 'galaxia',
      campos: {
        antes: 'Projetado e construído por',
        numero: '100%',
        depois: '*estudantes da Poli*',
        texto: 'Do primeiro esboço à última solda, cada parte do satélite passa pelas mãos de quem está *aprendendo fazendo*.',
      },
      whatsapp: `🔩 Do primeiro esboço à última solda: o satélite do *PoliSat* é feito *100% por estudantes* da Poli-USP.

É o jeito mais concreto de aprender engenharia. E ele só acontece com apoio de gente como você 💜
👉 ${LINK}`,
      legenda: `100% feito por estudantes 🔩

Cada parte do nosso satélite passa pelas mãos de quem está aprendendo fazendo. Apoie no Mês do Doar.

💜 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-20', tema: 'Toda doação conta', template: 'destaque', fundo: 'nebulosa',
      campos: {
        titulo: 'TODA DOAÇÃO\nCONTA',
        subtitulo: '*Qualquer valor* faz diferença',
        texto: 'R$ 10, R$ 50 ou R$ 100: somadas, as doações viram *peças, testes e missões*.',
        selo: 'Doe em doa.re/RzAT',
      },
      whatsapp: `💜 *Toda doação conta!*

Não precisa ser muito: R$ 10, R$ 50 ou R$ 100. Somadas, as doações viram peças, testes e missões do *PoliSat*.

Se cada pessoa que receber esta mensagem doar um pouquinho, a gente vai longe 🚀
👉 ${LINK}`,
      legenda: `Toda doação conta 💜

R$ 10, R$ 50 ou R$ 100: juntas, as doações viram peças, testes e missões. Faça a sua no Mês do Doar.

👉 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-23', tema: 'Faltam 8 dias', template: 'numero', fundo: 'profundo',
      campos: {
        antes: 'Faltam',
        numero: '8 DIAS',
        depois: 'para o *Dia de Doar*',
        texto: 'A campanha termina em *01/12*. Não deixe para a última hora: doe hoje e ajude o PoliSat a decolar!',
      },
      whatsapp: `⏳ *Faltam 8 dias* para o Dia de Doar (01/12)!

O Mês do Doar está na reta final e cada doação ajuda o *PoliSat* a seguir construindo satélites na Poli-USP.

Não deixa para a última hora 😉
👉 ${LINK}`,
      legenda: `Faltam 8 dias! ⏳

O Mês do Doar termina em 01/12, no Dia de Doar. Doe hoje e ajude o PoliSat a decolar.

💜 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-24', tema: 'Para quem é da Poli', template: 'janela', fundo: 'nebulosa',
      campos: {
        titulo: 'PARA QUEM\nÉ DA POLI',
        texto: 'Você que passou pela Poli sabe: os grupos de extensão são onde a engenharia *ganha vida*. Retribua e ajude a formar a próxima geração.',
        rodape: 'Poli apoiando Poli!',
      },
      whatsapp: `🏛️ *Para quem é (ou foi) da Poli:*

Você sabe que os grupos de extensão são onde a engenharia ganha vida. Hoje, o *PoliSat* é um deles, formando estudantes que constroem satélites de verdade.

Que tal retribuir e ajudar a próxima geração? 💙💜
👉 ${LINK}`,
      legenda: `Para quem é da Poli 🏛️

Os grupos de extensão fazem parte da formação politécnica. Retribua e ajude o PoliSat a formar a próxima geração.

💜 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-25', tema: 'Uma equipe, uma missão', template: 'mosaico', fundo: 'nebulosa',
      campos: {
        titulo: 'UMA EQUIPE,\nUMA MISSÃO',
        fotos: [f('stand-lasc.jpg', 1, 0, -0.2), f('bancada.jpg'), f('palco-lasc.jpg', 1, 0, -0.75), f('lancamento.jpg')],
        legenda: 'Gente apaixonada por espaço, *construindo o futuro* na Poli.',
      },
      whatsapp: `👩‍🚀👨‍🚀 Por trás de cada satélite tem uma equipe inteira de estudantes apaixonados por espaço.

No *PoliSat* a gente aprende junto, constrói junto e comemora junto. Ajude essa equipe a continuar 💜
👉 ${LINK}`,
      legenda: `Uma equipe, uma missão 🛰️

Por trás de cada satélite, estudantes da Poli construindo o futuro juntos. Apoie no Mês do Doar.

💜 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-26', tema: 'Doe com confiança', template: 'destaque', fundo: 'galaxia',
      campos: {
        titulo: 'DOE COM\nCONFIANÇA',
        subtitulo: 'Em parceria com a *Amigos da Poli*',
        texto: 'Sua doação é feita pela Amigos da Poli, associação que apoia *projetos e estudantes* da Escola Politécnica.',
        selo: 'doa.re/RzAT',
      },
      whatsapp: `🤝 Ficou na dúvida de como funciona?

A doação para o *PoliSat* é feita pela *Amigos da Poli*, associação que apoia projetos e estudantes da Escola Politécnica da USP.

É só acessar o link e escolher o valor 💙
👉 ${LINK}`,
      legenda: `Doe com confiança 🤝

A campanha do PoliSat é feita em parceria com a Amigos da Poli, que apoia projetos e estudantes da Escola Politécnica.

💜 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-27', tema: 'Faltam 4 dias', template: 'numero', fundo: 'nebulosa',
      campos: {
        antes: 'Faltam só',
        numero: '4 DIAS',
        depois: 'para o *Dia de Doar*',
        texto: 'Que tal fazer sua doação hoje e *mandar para 3 amigos*?',
      },
      whatsapp: `⏰ *Faltam só 4 dias!*

O Mês do Doar termina em 01/12. Se você já doou, muito obrigado! 💜 Agora pedimos uma coisa: encaminha esta mensagem para 3 amigos.

Se ainda não doou, dá tempo:
👉 ${LINK}`,
      legenda: `Faltam só 4 dias! ⏰

Doe e marque 3 amigos que também apoiariam o PoliSat.

💜 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-11-30', tema: 'É amanhã', template: 'destaque', fundo: 'profundo',
      campos: {
        titulo: 'É AMANHÃ!',
        subtitulo: '*01/12* é o Dia de Doar',
        texto: 'Último dia do Mês do Doar. Se você ainda não doou, essa é a hora de ajudar o PoliSat a *ir mais longe*.',
        selo: 'Último dia: 01/12',
      },
      whatsapp: `🚨 *É amanhã!* 01/12 é o *Dia de Doar* e o último dia da nossa campanha.

Se você ainda não doou para o *PoliSat*, essa é a hora. Se já doou, obrigado demais! Encaminhar esta mensagem também ajuda muito 💜
👉 ${LINK}`,
      legenda: `É amanhã! 🚨

01/12 é o Dia de Doar e o último dia da campanha do PoliSat. Ainda dá tempo!

💜 doa.re/RzAT

${tags}`,
    },
    {
      data: '2026-12-01', tema: 'Dia de Doar', template: 'numero', fundo: 'nebulosa',
      campos: {
        antes: 'Hoje é',
        numero: '01/12',
        depois: '*Dia de Doar!*',
        texto: 'Último dia da campanha. Doe agora e ajude o PoliSat a construir a *próxima missão*.',
      },
      whatsapp: `💜 *Hoje é o Dia de Doar!*

É o último dia da campanha do *PoliSat* no Mês do Doar. Sua doação de hoje ajuda estudantes da Poli-USP a construir a próxima missão 🛰️

👉 ${LINK}

Obrigado a todo mundo que apoiou até aqui! 🚀`,
      legenda: `Hoje é Dia de Doar! 💜

Último dia da campanha do PoliSat. Doe agora e faça parte da nossa próxima missão.

👉 doa.re/RzAT

${tags}`,
    },
  ];

  const fotos = [
    { src: 'assets/fotos/equipe-mission-patch.jpg', nome: 'Equipe no mural de patches' },
    { src: 'assets/fotos/palco-lasc.jpg', nome: 'Equipe no palco da LASC' },
    { src: 'assets/fotos/stand-lasc.jpg', nome: 'Stand do PoliSat na LASC' },
    { src: 'assets/fotos/bancada.jpg', nome: 'Montagem em bancada' },
    { src: 'assets/fotos/lancamento.jpg', nome: 'Área de lançamento' },
    { src: 'assets/fotos/iacanga.jpg', nome: 'Iacanga/SP' },
  ];

  global.MES_DO_DOAR = { link: LINK, inicio: '2026-11-09', fim: '2026-12-01', posts, fotos };
})(typeof window !== 'undefined' ? window : globalThis);
