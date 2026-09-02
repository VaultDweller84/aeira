/**
 * ================================================================
 *  A Eira — Worker do portal da Aldeia de João Pires
 *  Um único Cloudflare Worker com cinco portas:
 *
 *    POST /carta      escreve a exposição para a Câmara
 *    GET  /agenda     devolve a agenda cultural do concelho
 *    GET  /noticias   avisos da terra + notícias da Câmara
 *    POST /sugestao   guarda uma sugestão de um munícipe
 *    GET  /admin      publicar avisos e ler sugestões (com chave)
 *
 *  PORQUÊ ISTO EXISTE
 *  O portal é um ficheiro público. Se as chaves estivessem lá
 *  dentro, qualquer pessoa as podia copiar. Aqui ficam guardadas
 *  no Cloudflare e nunca saem.
 *
 *  VARIÁVEIS (Settings → Variables and Secrets)
 *    FORNECEDOR      'gemini' ou 'groq'
 *    API_KEY         chave do fornecedor de IA          [Secret]
 *    ORIGENS         domínios autorizados, por vírgulas
 *                    ex.: https://aldeiajoaopires.pt
 *    CALENDARIO_ICS  endereço .ics do Google Calendar público
 *                    (horas convertidas para hora de Portugal; eventos
 *                     que se repetem são desdobrados — ver dataICS)
 *    ROBO_CAMARA     'sim' para ler a agenda e as notícias da Câmara,
 *                    'nao' para desligar as duas
 *    CHAVE_ADMIN     palavra-passe da página de gestão   [Secret]
 *
 *  LIGAÇÃO KV (Settings → Bindings → KV namespace)
 *    Nome da variável: SUGESTOES
 *    Guarda tanto as sugestões (sug:...) como os avisos (aviso:...)
 * ================================================================
 */

/* ================================================================
   1. ASSISTENTE DE ESCRITA
   ================================================================ */

const MODELOS = {
  gemini: {
    /* NOME DO MODELO — é aqui que isto parte, mais tarde ou mais cedo.
       A Google desliga modelos ao fim de um ou dois anos, e chega a
       restringir os mais antigos a quem já os usava. Sintoma: a carta
       deixa de sair pela IA e o portal responde {"erro":"fornecedor",
       "estado":404}.

       COMO RESOLVER, sem depender de documentação:
       1. Numa janela anónima do browser, abra
          generativelanguage.googleapis.com/v1beta/models?key=A-SUA-CHAVE
       2. Escolha um nome com «flash» que tenha "generateContent" na lista
          dos métodos suportados, e escreva-o aqui em baixo.
       3. Deploy, e confirme em Deployments que a versão nova ficou activa.

       Entretanto ninguém fica sem carta: sai pelo modelo escrito à mão,
       como manda o ADR-007. */
    url: (k) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${k}`,
    corpo: (sistema, pedido) => ({
      systemInstruction: { parts: [{ text: sistema }] },
      contents: [{ role: 'user', parts: [{ text: pedido }] }],
      /* Os modelos novos «pensam» antes de responder, e esse pensamento
         gasta o mesmo orçamento de maxOutputTokens que o texto. Com 900
         a carta saía cortada a meio de uma frase. Duas defesas:
         thinkingBudget a 0 desliga o pensamento (mais rápido, ~3 s em vez
         de ~14 s), e 3000 tokens deixam folga de sobra mesmo que um
         modelo futuro ignore esse pedido. Não baixe estes valores. */
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 3000,
        thinkingConfig: { thinkingBudget: 0 }
      }
    }),
    extrair: (j) => j?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  },
  groq: {
    url: () => 'https://api.groq.com/openai/v1/chat/completions',
    cabecalhos: (k) => ({ Authorization: `Bearer ${k}` }),
    corpo: (sistema, pedido) => ({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 900,
      messages: [
        { role: 'system', content: sistema },
        { role: 'user', content: pedido }
      ]
    }),
    extrair: (j) => j?.choices?.[0]?.message?.content || ''
  }
};

const SISTEMA = `És um jurista-redactor português que escreve exposições formais de munícipes dirigidas a uma câmara municipal do interior de Portugal.

REGRAS ABSOLUTAS
1. Escreves em português europeu, registo formal mas claro. Nada de brasileirismos.
2. Escreves APENAS o corpo da exposição: os pontos numerados e o parágrafo final de pedido. NÃO escreves o cabeçalho, nem a data, nem a saudação, nem a despedida, nem a assinatura — isso é acrescentado depois.
3. NÃO INVENTAS FACTOS. Usas só o que o munícipe descreveu. Não inventas datas, números, nomes de ruas, quantidades, leis nem artigos. Se um facto não foi dado, não o mencionas.
4. Não inventas nem repetes o nome, a morada ou o telefone do munícipe — não os recebes e não fazem parte do corpo.
5. Estrutura: pontos numerados "1.", "2.", "3." separados por linha em branco. Entre três e cinco pontos.
   - o primeiro descreve o problema, arrumando por palavras próprias o que o munícipe contou;
   - o segundo localiza-o e diz desde quando, se essa informação foi dada;
   - os seguintes explicam as consequências concretas para os moradores (segurança, salubridade, mobilidade, acesso a serviços) e que a matéria é da competência do Município.
6. Terminas com um parágrafo isolado, sem número, começado por "Nestes termos, solicita-se a V. Exa." que retoma exactamente o pedido que te for indicado e acrescenta o pedido de indicação do prazo previsto para a intervenção.
7. Tom firme e cortês. Nunca insultuoso, nunca ameaçador, nunca choroso. Não acusas pessoas concretas.
8. Devolves texto simples. Sem markdown, sem asteriscos, sem títulos, sem aspas à volta de tudo.
9. Se a descrição do munícipe for confusa, curta ou tiver erros, arrumas e corriges — é essa a tua função. Nunca comentas a qualidade do que ele escreveu.
10. Se a descrição não tiver nada que ver com um assunto municipal, ou for ofensiva, devolves apenas: RECUSA`;

async function rotaCarta(request, env, cors) {
  let dados;
  try { dados = await request.json(); }
  catch { return responder({ erro: 'json invalido' }, 400, cors); }

  const descricao = limpar(dados.descricao, 1500);
  const rubrica   = limpar(dados.rubrica, 120);
  const pedido    = limpar(dados.pedido, 300);
  const local     = limpar(dados.local, 200);
  const desde     = limpar(dados.desde, 120);
  const fotos     = dados.fotos === true;
  const grupo     = dados.grupo === true;

  if (descricao.length < 10 || !rubrica || !pedido) {
    return responder({ erro: 'campos em falta' }, 400, cors);
  }

  const instrucao = [
    `ASSUNTO DA EXPOSIÇÃO: ${rubrica}`,
    `LOCAL: ${local || 'não indicado'}`,
    `HÁ QUANTO TEMPO: ${desde || 'não indicado'}`,
    `FOTOGRAFIAS EM ANEXO: ${fotos ? 'sim — menciona-as num ponto próprio' : 'não'}`,
    `PEDIDO SUBSCRITO POR VÁRIOS MORADORES: ${grupo ? 'sim — usa a primeira pessoa do plural quando fizer sentido' : 'não'}`,
    `PEDIDO FINAL A RETOMAR LITERALMENTE: ${pedido}`,
    '',
    'O QUE O MUNÍCIPE CONTOU, POR PALAVRAS DELE:',
    descricao
  ].join('\n');

  const nome = (env.FORNECEDOR || 'gemini').toLowerCase();
  const m = MODELOS[nome];
  if (!m || !env.API_KEY) return responder({ erro: 'proxy mal configurado' }, 500, cors);

  let texto = '';
  try {
    const cabecalhos = { 'Content-Type': 'application/json', ...(m.cabecalhos ? m.cabecalhos(env.API_KEY) : {}) };
    const pedidoCompleto = m.corpo(SISTEMA, instrucao);

    let resposta = await fetch(m.url(env.API_KEY), {
      method: 'POST', headers: cabecalhos, body: JSON.stringify(pedidoCompleto)
    });

    /* Segunda tentativa sem thinkingConfig. Se um dia o fornecedor deixar
       de aceitar esse campo, devolve 400 e a carta morria aqui por causa
       de uma afinação de velocidade. Assim, tira-se o campo e tenta-se
       outra vez: mais lento, mas a pessoa recebe a carta na mesma. */
    if (resposta.status === 400 && pedidoCompleto?.generationConfig?.thinkingConfig) {
      const semPensamento = { ...pedidoCompleto, generationConfig: { ...pedidoCompleto.generationConfig } };
      delete semPensamento.generationConfig.thinkingConfig;
      resposta = await fetch(m.url(env.API_KEY), {
        method: 'POST', headers: cabecalhos, body: JSON.stringify(semPensamento)
      });
    }

    if (!resposta.ok) return responder({ erro: 'fornecedor', estado: resposta.status }, 502, cors);
    texto = m.extrair(await resposta.json());
  } catch {
    return responder({ erro: 'fornecedor inacessivel' }, 502, cors);
  }

  texto = String(texto || '').trim()
    .replace(/^```[a-z]*\s*/i, '').replace(/```$/, '')
    .replace(/\*\*/g, '')
    .trim();

  if (!texto || texto === 'RECUSA' || texto.length < 60) {
    return responder({ erro: 'sem texto util' }, 422, cors);
  }
  return responder({ ok: true, corpo: texto }, 200, cors);
}

/* ================================================================
   2. AGENDA CULTURAL
   Duas fontes, juntas numa lista só:
     a) um Google Calendar público (quem organiza mete lá o evento)
     b) a agenda cultural do site da Câmara, lida uma vez de x em x horas
   ================================================================ */

const HORAS_CACHE_AGENDA = 6;

/* ---- a) Google Calendar: ler o ficheiro .ics público ---- */
function desdobrarICS(texto) {
  /* o formato ICS parte linhas compridas; junta-as outra vez */
  return texto.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/);
}

function valorICS(s) {
  return String(s || '')
    .replace(/\\n/gi, '\n').replace(/\\,/g, ',')
    .replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
}

/* ------------------------------------------------------------------
   Datas do Google Calendar — fuso horário e eventos que se repetem.

   O ficheiro .ics escreve as horas de três maneiras:
     DTSTART:20260908T190000Z            → hora universal (UTC)
     DTSTART;TZID=Europe/Lisbon:20260908T200000  → hora de um fuso
     DTSTART;VALUE=DATE:20260908         → dia inteiro, sem hora
   Ler os algarismos tal e qual dava uma hora errada no Verão — e num
   evento depois da meia-noite, o dia errado. Ver 06-RISKS.md, R-03.
------------------------------------------------------------------ */
const FUSO_PORTAL = 'Europe/Lisbon';

function partesNoFuso(ms, zona) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const p = {};
  for (const x of f.formatToParts(new Date(ms))) p[x.type] = x.value;
  return { ano: +p.year, mes: +p.month, dia: +p.day,
           hora: p.hour === '24' ? 0 : +p.hour, minuto: +p.minute };
}

function comoData(p) {
  const dois = n => String(n).padStart(2, '0');
  return { data: `${p.ano}-${dois(p.mes)}-${dois(p.dia)}`,
           hora: `${dois(p.hora)}:${dois(p.minuto)}` };
}

/* hora de parede num fuso → instante universal (duas passagens chegam) */
function instanteDeParede(ano, mes, dia, hora, minuto, zona) {
  const querido = Date.UTC(ano, mes - 1, dia, hora, minuto);
  let ms = querido;
  for (let i = 0; i < 2; i++) {
    const p = partesNoFuso(ms, zona);
    ms += querido - Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto);
  }
  return ms;
}

function dataICS(valor, parametros) {
  /* devolve { data:'2026-09-08', hora:'19:00'|null } já em hora de Portugal */
  const so = String(valor || '').trim();
  const par = String(parametros || '');
  const diaInteiro = /VALUE=DATE/i.test(par) || /^\d{8}$/.test(so);
  const m = so.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return null;

  const data = `${m[1]}-${m[2]}-${m[3]}`;
  if (diaInteiro || !m[4]) return { data, hora: null };

  const ano = +m[1], mes = +m[2], dia = +m[3], hora = +m[4], minuto = +m[5];
  const tz = par.match(/TZID=([^;:]+)/i);

  try {
    if (/Z$/i.test(so)) {
      return comoData(partesNoFuso(Date.UTC(ano, mes - 1, dia, hora, minuto), FUSO_PORTAL));
    }
    if (tz && tz[1] && tz[1] !== FUSO_PORTAL) {
      const ms = instanteDeParede(ano, mes, dia, hora, minuto, tz[1]);
      return comoData(partesNoFuso(ms, FUSO_PORTAL));
    }
  } catch {
    /* fuso desconhecido ou Intl em falta: fica a hora escrita, sem converter.
       Um evento à hora errada é mau; um portal sem agenda é pior (ADR-007). */
  }
  return { data, hora: `${m[4]}:${m[5]}` };
}

/* ------------------------------------------------------------------
   Eventos que se repetem (RRULE).
   Suporta o que uma aldeia usa: DIÁRIO, SEMANAL (com dias da semana),
   MENSAL e ANUAL, com INTERVAL, COUNT, UNTIL e EXDATE.
   Não suporta BYMONTHDAY, BYSETPOS e afins — quem precisar disso cria
   os eventos um a um, e é melhor assim do que inventar datas.
------------------------------------------------------------------ */
const DIAS_SEMANA = { SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6 };
const MAX_OCORRENCIAS = 60;

const emDias = iso => Date.UTC(+iso.slice(0,4), +iso.slice(5,7) - 1, +iso.slice(8,10));
const paraISO = ms => new Date(ms).toISOString().slice(0, 10);

function ocorrencias(dataInicial, rrule, excluidas, hoje, diasAdiante) {
  const janelaFim = paraISO(emDias(hoje) + (diasAdiante || 400) * 86400000);
  const fora = new Set(excluidas || []);
  const guarda = d => d >= hoje && d <= janelaFim && !fora.has(d);

  if (!rrule) return guarda(dataInicial) ? [dataInicial] : [];

  const r = {};
  for (const par of String(rrule).split(';')) {
    const [k, v] = par.split('=');
    if (k) r[k.toUpperCase()] = (v || '').toUpperCase();
  }
  const freq = r.FREQ;
  if (!freq) return guarda(dataInicial) ? [dataInicial] : [];

  const intervalo = Math.max(1, parseInt(r.INTERVAL || '1', 10) || 1);
  const conta = r.COUNT ? parseInt(r.COUNT, 10) : null;
  const ate = r.UNTIL ? `${r.UNTIL.slice(0,4)}-${r.UNTIL.slice(4,6)}-${r.UNTIL.slice(6,8)}` : null;
  const dias = r.BYDAY ? r.BYDAY.split(',').map(d => DIAS_SEMANA[d.slice(-2)]).filter(n => n !== undefined) : [];

  const todas = [];
  const inicio = emDias(dataInicial);

  const juntar = ms => {
    const d = paraISO(ms);
    if (ate && d > ate) return false;
    if (d >= dataInicial) todas.push(d);
    return true;
  };

  if (freq === 'DAILY') {
    for (let i = 0; todas.length < MAX_OCORRENCIAS * 3; i++) {
      const ms = inicio + i * intervalo * 86400000;
      if (paraISO(ms) > janelaFim) break;
      if (!juntar(ms)) break;
    }
  } else if (freq === 'WEEKLY') {
    const base = dias.length ? dias : [new Date(inicio).getUTCDay()];
    const domingoDaSemana = inicio - new Date(inicio).getUTCDay() * 86400000;
    for (let semana = 0; todas.length < MAX_OCORRENCIAS * 3; semana++) {
      const ms0 = domingoDaSemana + semana * intervalo * 7 * 86400000;
      if (paraISO(ms0) > janelaFim) break;
      let parar = false;
      for (const d of base.slice().sort((a, b) => a - b)) {
        if (!juntar(ms0 + d * 86400000)) { parar = true; break; }
      }
      if (parar) break;
    }
  } else if (freq === 'MONTHLY' || freq === 'YEARLY') {
    const passo = freq === 'MONTHLY' ? intervalo : intervalo * 12;
    const a0 = +dataInicial.slice(0,4), m0 = +dataInicial.slice(5,7), d0 = +dataInicial.slice(8,10);
    for (let i = 0; todas.length < MAX_OCORRENCIAS * 3; i++) {
      const total = (m0 - 1) + i * passo;
      const ano = a0 + Math.floor(total / 12), mes = (total % 12) + 1;
      const ms = Date.UTC(ano, mes - 1, d0);
      /* 31 de Fevereiro não existe: salta-se em vez de escorregar para Março */
      if (new Date(ms).getUTCDate() !== d0) continue;
      if (paraISO(ms) > janelaFim) break;
      if (!juntar(ms)) break;
    }
  } else {
    return guarda(dataInicial) ? [dataInicial] : [];
  }

  const limitadas = conta ? todas.slice(0, conta) : todas;
  return limitadas.filter(guarda).slice(0, MAX_OCORRENCIAS);
}

async function lerGoogleCalendar(url) {
  if (!url) return [];
  let texto = '';
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'AEira-AldeiaJoaoPires/1.0' } });
    if (!r.ok) return [];
    texto = await r.text();
  } catch { return []; }

  const linhas = desdobrarICS(texto);
  const eventos = [];
  let actual = null;

  for (const linha of linhas) {
    if (linha === 'BEGIN:VEVENT') { actual = {}; continue; }
    if (linha === 'END:VEVENT') {
      if (actual && actual.titulo && actual.inicio) {
        /* um evento que se repete dá origem a uma entrada por ocorrência */
        const ontem = paraISO(Date.now() - 86400000);
        const inicio = actual.inicio.data;
        const datas = ocorrencias(inicio, actual.rrule, actual.exdatas, ontem, 400);
        const duracao = actual.fim && actual.fim.data
          ? Math.round((emDias(actual.fim.data) - emDias(inicio)) / 86400000)
          : null;
        for (const d of datas) {
          eventos.push({
            id: 'gcal:' + (actual.uid || actual.titulo).slice(0, 60) + (datas.length > 1 ? ':' + d : ''),
            titulo: actual.titulo,
            descricao: actual.descricao || '',
            local: actual.local || '',
            mapa: actual.local || '',
            data: d,
            hora: actual.inicio.hora,
            dataFim: duracao === null ? null : paraISO(emDias(d) + duracao * 86400000),
            fonte: 'agenda',
            link: actual.url || ''
          });
        }
      }
      actual = null; continue;
    }
    if (!actual) continue;

    const sep = linha.indexOf(':');
    if (sep < 0) continue;
    const cabeca = linha.slice(0, sep);
    const corpo = linha.slice(sep + 1);
    const campo = cabeca.split(';')[0].toUpperCase();
    const params = cabeca.slice(campo.length);

    if (campo === 'SUMMARY')      actual.titulo = valorICS(corpo).slice(0, 200);
    else if (campo === 'DESCRIPTION') actual.descricao = valorICS(corpo).slice(0, 2000);
    else if (campo === 'LOCATION')    actual.local = valorICS(corpo).slice(0, 200);
    else if (campo === 'UID')         actual.uid = valorICS(corpo);
    else if (campo === 'URL')         actual.url = valorICS(corpo).slice(0, 400);
    else if (campo === 'DTSTART')     actual.inicio = dataICS(corpo, params);
    else if (campo === 'DTEND')       actual.fim = dataICS(corpo, params);
    else if (campo === 'RRULE')       actual.rrule = corpo.trim();
    else if (campo === 'EXDATE') {
      actual.exdatas = (actual.exdatas || []).concat(
        corpo.split(',').map(v => { const d = dataICS(v.trim(), params); return d && d.data; }).filter(Boolean)
      );
    }
  }
  return eventos;
}

/* ---- b) robô que lê a agenda cultural do site da Câmara ----
   Não há RSS nem iCal: lê-se o HTML. Se a Câmara mudar o site isto
   deixa de trazer eventos — mas nunca parte a agenda, porque o
   Google Calendar e as romarias fixas continuam a aparecer.
------------------------------------------------------------------ */
const BASE_CM = 'https://www.cm-penamacor.pt';
const LISTA_CM = BASE_CM + '/autarquia/comunicacao/agenda-cultural/todos-os-eventos';
const MESES_CURTOS = {
  jan:1, fev:2, mar:3, abr:4, mai:5, jun:6,
  jul:7, ago:8, set:9, out:10, nov:11, dez:12
};

function meta(html, propriedade) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${propriedade}["'][^>]*content=["']([^"']*)["']`, 'i');
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${propriedade}["']`, 'i');
  const m = html.match(re) || html.match(alt);
  return m ? descodificar(m[1]) : '';
}

function descodificar(s) {
  return String(s || '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .trim();
}

function datasNoTexto(html, anoBase) {
  /* procura "04 Mar" / "30 Dez" no corpo da página */
  const semTags = html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                      .replace(/<[^>]+>/g, ' ');
  const achados = [];
  const re = /\b(\d{1,2})\s*(?:de\s+)?(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-zç]*\.?\b/gi;
  let m;
  while ((m = re.exec(semTags)) && achados.length < 6) {
    const dia = parseInt(m[1], 10);
    const mes = MESES_CURTOS[m[2].toLowerCase().slice(0, 3)];
    if (dia >= 1 && dia <= 31 && mes) {
      achados.push(`${anoBase}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`);
    }
  }
  const hora = semTags.match(/\b([01]?\d|2[0-3])[:hH]([0-5]\d)\s*h?\b/);
  return {
    inicio: achados[0] || null,
    fim: achados[1] || null,
    hora: hora ? `${String(hora[1]).padStart(2, '0')}:${hora[2]}` : null
  };
}

async function lerAgendaCamara(limite = 15) {
  let indice = '';
  try {
    const r = await fetch(LISTA_CM, {
      headers: { 'User-Agent': 'AEira-AldeiaJoaoPires/1.0 (portal comunitario)' }
    });
    if (!r.ok) return [];
    indice = await r.text();
  } catch { return []; }

  const ligacoes = new Set();
  const re = /href=["']([^"']*\/agenda-cultural\/todos-os-eventos\/evento\/[^"'#?]+)["']/gi;
  let m;
  while ((m = re.exec(indice))) {
    let u = descodificar(m[1]);
    if (u.startsWith('/')) u = BASE_CM + u;
    if (u.startsWith(BASE_CM)) ligacoes.add(u);
    if (ligacoes.size >= limite) break;
  }
  if (!ligacoes.size) return [];

  const ano = new Date().getFullYear();
  const eventos = await Promise.all([...ligacoes].map(async (url) => {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'AEira-AldeiaJoaoPires/1.0 (portal comunitario)' }
      });
      if (!r.ok) return null;
      const html = await r.text();
      const titulo = (meta(html, 'og:title') || '').replace(/\s*-\s*Município de Penamacor\s*$/i, '').trim();
      if (!titulo) return null;
      const d = datasNoTexto(html, ano);
      return {
        id: 'cm:' + url.split('/').pop(),
        titulo: titulo.slice(0, 200),
        descricao: (meta(html, 'og:description') || '').slice(0, 1200),
        local: '',
        mapa: 'Penamacor',
        data: d.inicio,
        hora: d.hora,
        dataFim: d.fim,
        fonte: 'camara',
        link: url,
        imagem: meta(html, 'og:image') || ''
      };
    } catch { return null; }
  }));

  return eventos.filter(Boolean);
}

async function rotaAgenda(request, env, cors) {
  const cache = caches.default;
  const chaveCache = new Request(new URL(request.url).origin + '/__agenda_cache', { method: 'GET' });
  const guardado = await cache.match(chaveCache);
  if (guardado) {
    const j = await guardado.json();
    return responder(j, 200, cors);
  }

  const tarefas = [lerGoogleCalendar(env.CALENDARIO_ICS)];
  if ((env.ROBO_CAMARA || 'sim').toLowerCase() !== 'nao') tarefas.push(lerAgendaCamara());

  const partes = await Promise.all(tarefas);
  let eventos = [].concat(...partes);

  /* fora eventos que já passaram há mais de um dia */
  const ontem = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  eventos = eventos.filter(e => !e.data || (e.dataFim || e.data) >= ontem);

  /* sem repetidos pelo título e data */
  const vistos = new Set();
  eventos = eventos.filter(e => {
    const c = (e.titulo || '').toLowerCase().replace(/\s+/g, ' ') + '|' + (e.data || '');
    if (vistos.has(c)) return false;
    vistos.add(c); return true;
  });

  eventos.sort((a, b) => String(a.data || '9999').localeCompare(String(b.data || '9999')));

  const saida = { ok: true, actualizado: new Date().toISOString(), eventos: eventos.slice(0, 120) };

  await cache.put(chaveCache, new Response(JSON.stringify(saida), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${HORAS_CACHE_AGENDA * 3600}` }
  }));

  return responder(saida, 200, cors);
}

/* ================================================================
   3. NOTÍCIAS E AVISOS
   Duas coisas diferentes na mesma página:
     a) AVISOS DA TERRA — escritos por quem trata do portal, na
        página de gestão. São o que faz alguém abrir isto todos os
        dias: corte de água, farmácia de serviço, missa mudada.
     b) NOTÍCIAS DA CÂMARA — lidas do site do Município, porque
        também não há RSS. Só o título, o resumo e a ligação:
        o texto fica onde foi publicado.
   ================================================================ */

const HORAS_CACHE_NOTICIAS = 3;
const LISTA_NOTICIAS = BASE_CM + '/autarquia/comunicacao/noticias';

const MESES_LONGOS = {
  janeiro:1, fevereiro:2, março:3, marco:3, abril:4, maio:5, junho:6,
  julho:7, agosto:8, setembro:9, outubro:10, novembro:11, dezembro:12
};

function dataPorExtenso(html) {
  /* apanha "28 Agosto 2026" ou "28 de Agosto de 2026" */
  const texto = html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
                    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
                    .replace(/<[^>]+>/g, ' ');
  const m = texto.match(
    /\b(\d{1,2})\s*(?:de\s+)?(janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s*(?:de\s+)?(20\d{2})\b/i);
  if (!m) return null;
  const mes = MESES_LONGOS[m[2].toLowerCase()];
  if (!mes) return null;
  return `${m[3]}-${String(mes).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
}

async function lerNoticiasCamara(limite = 12) {
  let indice = '';
  try {
    const r = await fetch(LISTA_NOTICIAS, {
      headers: { 'User-Agent': 'AEira-AldeiaJoaoPires/1.0 (portal comunitario)' }
    });
    if (!r.ok) return [];
    indice = await r.text();
  } catch { return []; }

  /* as ligações vêm pela ordem do site: a mais recente primeiro */
  const vistas = new Set();
  const ligacoes = [];
  const re = /href=["']([^"']*\/comunicacao\/noticias\/noticia\/[^"'#?]+)["']/gi;
  let m;
  while ((m = re.exec(indice)) && ligacoes.length < limite) {
    let u = descodificar(m[1]);
    if (u.startsWith('/')) u = BASE_CM + u;
    if (!u.startsWith(BASE_CM) || vistas.has(u)) continue;
    vistas.add(u); ligacoes.push(u);
  }
  if (!ligacoes.length) return [];

  const itens = await Promise.all(ligacoes.map(async (url, ordem) => {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'AEira-AldeiaJoaoPires/1.0 (portal comunitario)' }
      });
      if (!r.ok) return null;
      const html = await r.text();
      const titulo = (meta(html, 'og:title') || '')
        .replace(/\s*-\s*Município de Penamacor\s*$/i, '').trim();
      if (!titulo) return null;
      return {
        id: 'cm:' + url.split('/').pop(),
        titulo: titulo.slice(0, 220),
        resumo: (meta(html, 'og:description') || '').slice(0, 400),
        imagem: meta(html, 'og:image') || '',
        data: dataPorExtenso(html) || (meta(html, 'article:published_time') || '').slice(0, 10) || null,
        link: url,
        ordem
      };
    } catch { return null; }
  }));

  return itens.filter(Boolean);
}

async function lerAvisos(env) {
  if (!env.SUGESTOES) return [];
  const hoje = new Date().toISOString().slice(0, 10);
  const lista = await env.SUGESTOES.list({ prefix: 'aviso:' });
  const itens = [];
  for (const k of lista.keys) {
    const bruto = await env.SUGESTOES.get(k.name);
    if (!bruto) continue;
    try {
      const a = JSON.parse(bruto);
      if (a.expira && a.expira < hoje) continue;   /* já passou */
      itens.push(a);
    } catch {}
  }
  itens.sort((a, b) => String(b.quando).localeCompare(String(a.quando)));
  return itens;
}

async function rotaNoticias(request, env, cors) {
  /* os avisos leem-se sempre frescos: um corte de água não pode
     esperar três horas pela cache */
  const avisos = await lerAvisos(env);

  const cache = caches.default;
  const chaveCache = new Request(new URL(request.url).origin + '/__noticias_cache');
  let noticias = null;
  const guardado = await cache.match(chaveCache);
  if (guardado) {
    try { noticias = (await guardado.json()).noticias; } catch {}
  }
  if (!noticias) {
    noticias = (env.ROBO_CAMARA || 'sim').toLowerCase() === 'nao' ? [] : await lerNoticiasCamara();
    await cache.put(chaveCache, new Response(JSON.stringify({ noticias }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `max-age=${HORAS_CACHE_NOTICIAS * 3600}`
      }
    }));
  }

  return responder({
    ok: true,
    actualizado: new Date().toISOString(),
    avisos,
    noticias
  }, 200, cors);
}

/* ================================================================
   4. SUGESTÕES
   ================================================================ */

async function rotaSugestao(request, env, cors) {
  if (!env.SUGESTOES) return responder({ erro: 'armazenamento nao ligado' }, 500, cors);

  let d;
  try { d = await request.json(); }
  catch { return responder({ erro: 'json invalido' }, 400, cors); }

  const tipo = ['melhoria', 'erro', 'evento', 'outro'].includes(d.tipo) ? d.tipo : 'outro';
  const texto = limpar(d.texto, 2000);
  const nome = limpar(d.nome, 120);
  const contacto = limpar(d.contacto, 160);

  if (texto.length < 10) return responder({ erro: 'texto curto' }, 400, cors);

  const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  await env.SUGESTOES.put('sug:' + id, JSON.stringify({
    id, tipo, texto, nome, contacto,
    quando: new Date().toISOString(),
    tratada: false
  }));

  return responder({ ok: true }, 200, cors);
}

/* ================================================================
   5. PÁGINA DE GESTÃO
   Publica avisos da terra e lê as sugestões dos munícipes.
   ================================================================ */

const escapar = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const CATEGORIAS_AVISO = {
  urgente:    { rotulo: 'Urgente',      icone: '🚨', dias: 3 },
  servico:    { rotulo: 'Serviços',     icone: '🛒', dias: 7 },
  comunidade: { rotulo: 'Comunidade',   icone: '🎈', dias: 14 },
  luto:       { rotulo: 'Falecimento',  icone: '🕯️', dias: 10 }
};

function maisDias(n) {
  const d = new Date(Date.now() + n * 86400000);
  return d.toISOString().slice(0, 10);
}

async function rotaAdmin(request, env) {
  const url = new URL(request.url);
  const chave = url.searchParams.get('chave') || '';
  const cabTexto = { 'Content-Type': 'text/plain; charset=utf-8' };

  if (!env.CHAVE_ADMIN || chave !== env.CHAVE_ADMIN) {
    return new Response('Chave errada.', { status: 401, headers: cabTexto });
  }
  if (!env.SUGESTOES) {
    return new Response('Armazenamento KV não está ligado. Veja o Passo 5 do INSTALAR.md.',
      { status: 500, headers: cabTexto });
  }

  /* ---------------- acções ---------------- */
  if (request.method === 'POST') {
    const form = await request.formData();
    const accao = String(form.get('accao') || '');

    if (accao === 'novo-aviso') {
      const titulo = limpar(form.get('titulo'), 120);
      const texto = limpar(form.get('texto'), 1200);
      const cat = CATEGORIAS_AVISO[String(form.get('categoria'))] ? String(form.get('categoria')) : 'servico';
      let expira = limpar(form.get('expira'), 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(expira)) expira = maisDias(CATEGORIAS_AVISO[cat].dias);
      if (titulo.length >= 3) {
        const id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        await env.SUGESTOES.put('aviso:' + id, JSON.stringify({
          id, titulo, texto, categoria: cat,
          quando: new Date().toISOString(), expira
        }));
      }
    }

    if (accao === 'apagar-aviso') {
      const alvo = String(form.get('id') || '');
      if (alvo) await env.SUGESTOES.delete('aviso:' + alvo);
    }

    if (accao === 'terminar-aviso') {
      const alvo = String(form.get('id') || '');
      const bruto = alvo ? await env.SUGESTOES.get('aviso:' + alvo) : null;
      if (bruto) {
        const a = JSON.parse(bruto);
        a.expira = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        await env.SUGESTOES.put('aviso:' + alvo, JSON.stringify(a));
      }
    }

    if (accao === 'apagar' || accao === 'tratar') {
      const alvo = String(form.get('id') || '');
      if (alvo && accao === 'apagar') await env.SUGESTOES.delete('sug:' + alvo);
      if (alvo && accao === 'tratar') {
        const bruto = await env.SUGESTOES.get('sug:' + alvo);
        if (bruto) {
          const o = JSON.parse(bruto); o.tratada = !o.tratada;
          await env.SUGESTOES.put('sug:' + alvo, JSON.stringify(o));
        }
      }
    }

    return Response.redirect(url.origin + '/admin?chave=' + encodeURIComponent(chave), 303);
  }

  /* ---------------- ler tudo ---------------- */
  const hoje = new Date().toISOString().slice(0, 10);

  const listaAv = await env.SUGESTOES.list({ prefix: 'aviso:' });
  const avisos = [];
  for (const k of listaAv.keys) {
    const b = await env.SUGESTOES.get(k.name);
    if (b) { try { avisos.push(JSON.parse(b)); } catch {} }
  }
  avisos.sort((a, b) => String(b.quando).localeCompare(String(a.quando)));

  const listaSug = await env.SUGESTOES.list({ prefix: 'sug:' });
  const sugestoes = [];
  for (const k of listaSug.keys) {
    const b = await env.SUGESTOES.get(k.name);
    if (b) { try { sugestoes.push(JSON.parse(b)); } catch {} }
  }
  sugestoes.sort((a, b) => String(b.quando).localeCompare(String(a.quando)));

  /* ---------------- desenhar ---------------- */
  const opcoesCat = Object.keys(CATEGORIAS_AVISO).map((c) =>
    `<option value="${c}">${CATEGORIAS_AVISO[c].icone} ${CATEGORIAS_AVISO[c].rotulo} — apaga-se sozinho em ${CATEGORIAS_AVISO[c].dias} dias</option>`
  ).join('');

  const linhasAvisos = avisos.map((a) => {
    const c = CATEGORIAS_AVISO[a.categoria] || CATEGORIAS_AVISO.servico;
    const passou = a.expira && a.expira < hoje;
    return `
    <article class="${passou ? 'feita' : ''}">
      <p class="topo"><b>${c.icone} ${c.rotulo}</b>
        <span>${passou ? 'já não aparece' : 'até ' + escapar(a.expira)}</span></p>
      <p class="titulo">${escapar(a.titulo)}</p>
      ${a.texto ? `<p class="texto">${escapar(a.texto).replace(/\n/g, '<br>')}</p>` : ''}
      <form method="post">
        <input type="hidden" name="id" value="${escapar(a.id)}">
        ${passou ? '' : '<button name="accao" value="terminar-aviso">Tirar já do portal</button>'}
        <button name="accao" value="apagar-aviso" class="apagar"
          onclick="return confirm('Apagar este aviso de vez?')">Apagar</button>
      </form>
    </article>`;
  }).join('');

  const rotulosSug = { melhoria: 'Melhoria', erro: 'Erro no portal', evento: 'Evento em falta', outro: 'Outro' };
  const linhasSug = sugestoes.map((s) => `
    <article class="${s.tratada ? 'feita' : ''}">
      <p class="topo"><b>${rotulosSug[s.tipo] || 'Outro'}</b>
        <span>${escapar(new Date(s.quando).toLocaleString('pt-PT'))}</span></p>
      <p class="texto">${escapar(s.texto).replace(/\n/g, '<br>')}</p>
      ${(s.nome || s.contacto) ? `<p class="quem">${escapar(s.nome)}${s.contacto ? ' · ' + escapar(s.contacto) : ''}</p>` : ''}
      <form method="post">
        <input type="hidden" name="id" value="${escapar(s.id)}">
        <button name="accao" value="tratar">${s.tratada ? 'Reabrir' : 'Marcar como tratada'}</button>
        <button name="accao" value="apagar" class="apagar"
          onclick="return confirm('Apagar esta sugestão?')">Apagar</button>
      </form>
    </article>`).join('');

  const activos = avisos.filter((a) => !a.expira || a.expira >= hoje).length;

  const html = `<!DOCTYPE html><html lang="pt-PT"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Gestão — A Eira</title><style>
body{font-family:Verdana,Segoe UI,Arial,sans-serif;background:#F2F6FA;color:#16232E;
  margin:0;padding:1rem;line-height:1.6;font-size:17px}
.wrap{max-width:46rem;margin:0 auto}
h1{font-size:1.4rem;margin:.2rem 0 1rem}
h2{font-size:1.15rem;margin:2rem 0 .3rem;border-bottom:3px solid #1B5E8C;
  display:inline-block;padding-bottom:.2rem}
p.sub{color:#4B5D6B;font-size:.9rem;margin:.4rem 0 1rem}
article,.caixa{background:#fff;border:2px solid #D3E0EA;border-radius:.8rem;padding:1rem;margin-bottom:.8rem}
article.feita{opacity:.5}
.topo{display:flex;justify-content:space-between;gap:1rem;margin:0 0 .5rem;font-size:.85rem;color:#4B5D6B}
.titulo{font-weight:700;margin:.2rem 0}
.texto{margin:.3rem 0;white-space:pre-wrap}
.quem{font-size:.85rem;color:#4B5D6B;margin:.4rem 0 0}
form{margin:.7rem 0 0;display:flex;gap:.5rem;flex-wrap:wrap;align-items:flex-end}
form.novo{display:block}
label{display:block;font-weight:700;font-size:.9rem;margin:.9rem 0 .25rem}
label small{display:block;font-weight:400;color:#4B5D6B}
input[type=text],input[type=date],select,textarea{width:100%;font-family:inherit;font-size:1rem;
  padding:.6rem .7rem;border:2px solid #D3E0EA;border-radius:.5rem;background:#fff;color:#16232E}
textarea{min-height:5rem;resize:vertical}
button{font-family:inherit;font-size:.92rem;font-weight:700;padding:.55rem 1rem;
  border-radius:.5rem;border:2px solid #D3E0EA;background:#fff;cursor:pointer}
button.apagar{color:#9B2E1C;border-color:#E0968A}
button.principal{background:#1B5E8C;color:#fff;border-color:#1B5E8C;font-size:1rem;padding:.75rem 1.2rem;margin-top:1rem}
p.vazio{background:#fff;border:2px dashed #D3E0EA;border-radius:.8rem;padding:1.5rem;text-align:center;color:#4B5D6B}
.nota{background:#FFF4DA;border:2px solid #E3BE6A;border-radius:.7rem;padding:.8rem 1rem;
  font-size:.88rem;margin:1rem 0}
.nota b{color:#7A5600}
</style></head><body><div class="wrap">
<h1>Gestão d’A Eira</h1>

<h2>Publicar um aviso</h2>
<p class="sub">Os avisos aparecem no topo da página de notícias e apagam-se sozinhos na data que escolher.
São a razão pela qual as pessoas abrem o portal todos os dias — vale a pena publicar mesmo as coisas pequenas.</p>

<div class="caixa">
  <form method="post" class="novo">
    <label>Título
      <small>Curto e directo. É a única coisa que muita gente vai ler.</small>
      <input type="text" name="titulo" maxlength="120" required
             placeholder="Ex.: Corte de água na quinta-feira, das 9h às 13h"></label>

    <label>Texto <small>Opcional. Os pormenores, se houver.</small>
      <textarea name="texto" maxlength="1200"
        placeholder="Ex.: A Câmara vai fazer uma reparação na conduta da Rua do Outeiro. Encham garrafões na véspera."></textarea></label>

    <label>Tipo
      <select name="categoria">${opcoesCat}</select></label>

    <label>Deixa de aparecer em
      <small>Deixe em branco para usar o prazo do tipo escolhido.</small>
      <input type="date" name="expira"></label>

    <button class="principal" name="accao" value="novo-aviso">Publicar o aviso</button>
  </form>
</div>

<div class="nota">
  <b>Sobre os falecimentos:</b> antes de publicar, tenha o acordo da família.
  É a informação que mais faz abrir o portal numa aldeia e é também a mais sensível —
  um nome publicado sem autorização não se apaga da memória de ninguém.
</div>

<h2>Avisos publicados (${activos} a aparecer agora)</h2>
${linhasAvisos || '<p class="vazio">Ainda não há avisos.</p>'}

<h2>Sugestões dos munícipes</h2>
<p class="sub">${sugestoes.length} no total · ${sugestoes.filter((s) => !s.tratada).length} por tratar.
Apague as já tratadas de vez em quando: têm nomes e contactos.</p>
${linhasSug || '<p class="vazio">Ainda não há sugestões.</p>'}

</div></body></html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' }
  });
}

/* ================================================================
   UTILITÁRIOS E ENCAMINHAMENTO
   ================================================================ */

const limpar = (s, max) =>
  String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);

function cabecalhosCORS(origem, permitidas) {
  const ok = permitidas.length === 0 || permitidas.includes(origem);
  return {
    'Access-Control-Allow-Origin': ok ? (origem || '*') : (permitidas[0] || '*'),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

const responder = (obj, estado, cors) =>
  new Response(JSON.stringify(obj), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors }
  });

/* travão de abuso por endereço de internet e por hora */
async function travar(request, etiqueta, maximo) {
  const ip = request.headers.get('CF-Connecting-IP') || 'sem-ip';
  const chave = new Request(`https://trava.local/${etiqueta}/${ip}/${new Date().getUTCHours()}`);
  const cache = caches.default;
  let n = 0;
  const anterior = await cache.match(chave);
  if (anterior) n = parseInt(await anterior.text(), 10) || 0;
  if (n >= maximo) return false;
  await cache.put(chave, new Response(String(n + 1), { headers: { 'Cache-Control': 'max-age=3600' } }));
  return true;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const caminho = url.pathname.replace(/\/+$/, '') || '/';

    /* a página de gestão é servida directamente, sem CORS */
    if (caminho === '/admin') return rotaAdmin(request, env);

    const permitidas = (env.ORIGENS || '').split(',').map(s => s.trim()).filter(Boolean);
    const origem = request.headers.get('Origin') || '';
    const cors = cabecalhosCORS(origem, permitidas);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    if (permitidas.length && origem && !permitidas.includes(origem)) {
      return responder({ erro: 'origem nao autorizada' }, 403, cors);
    }

    if (caminho === '/agenda' && request.method === 'GET') {
      return rotaAgenda(request, env, cors);
    }
    if (caminho === '/noticias' && request.method === 'GET') {
      return rotaNoticias(request, env, cors);
    }
    if (caminho === '/sugestao' && request.method === 'POST') {
      if (!await travar(request, 'sug', 10)) return responder({ erro: 'demasiados pedidos' }, 429, cors);
      return rotaSugestao(request, env, cors);
    }
    if ((caminho === '/carta' || caminho === '/') && request.method === 'POST') {
      if (!await travar(request, 'carta', 20)) return responder({ erro: 'demasiados pedidos' }, 429, cors);
      return rotaCarta(request, env, cors);
    }

    return responder({ erro: 'rota desconhecida', caminho }, 404, cors);
  }
};
