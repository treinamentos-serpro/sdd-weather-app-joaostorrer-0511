# Backlog de Tarefas — Aplicação de previsão do tempo

As tarefas abaixo derivam de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e rastreiam os requisitos de [specs/weather-app-spec.md](../specs/weather-app-spec.md). Arquivos são caminhos prováveis; ajustar somente se o scaffold existente exigir outro caminho equivalente.

## Entrega 1 — Decisões e fundação

### T-01 — Fechar decisões de produto necessárias à implementação

- **Requisitos:** FR3, FR4, FR6, NFR2, NFR3.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Critérios de aceite:**
  - Fica definido se os cinco dias incluem hoje e qual fuso horário determina as datas.
  - Ficam definidos os campos meteorológicos obrigatórios, a unidade inicial, o arredondamento e os formatos de idioma/data/hora.
  - Ficam registradas as metas de desempenho, a matriz mínima de navegadores e o nível de acessibilidade esperado, ou explicitamente adiadas.
  - Spec e plano refletem as decisões sem contradições.

### T-02 — Criar a estrutura inicial da aplicação

- **Requisitos:** NFR1, NFR2.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/index.css` ou folha de estilos equivalente, `index.html`.
- **Critérios de aceite:**
  - O Vite monta a aplicação React a partir do ponto de entrada definido.
  - A aplicação renderiza uma região principal sem erro em desenvolvimento e build.
  - A estrutura base permite adicionar os componentes sem concentrar lógica de negócio no ponto de entrada.

### T-03 — Definir os tipos de domínio meteorológico

- **Requisitos:** FR1, FR2, FR3, FR6, NFR5.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Critérios de aceite:**
  - Existem tipos para cidade, condição climática, clima atual, dia de previsão, resultado meteorológico e unidade.
  - Campos que a Open-Meteo pode omitir são opcionais conforme o plano.
  - Os componentes podem consumir os tipos de domínio sem depender dos formatos crus da API.

## Entrega 2 — Domínio e integração Open-Meteo

### T-04 — Implementar conversão e formatação de temperatura

- **Requisitos:** FR4, NFR5.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/utils/temperature.ts`.
- **Critérios de aceite:**
  - Funções puras convertem Celsius para Fahrenheit e formatam valores com a unidade escolhida.
  - A regra de arredondamento acordada em T-01 é aplicada consistentemente.
  - Valores inválidos ou ausentes não produzem rótulos de unidade incorretos.

### T-05 — Testar conversão e formatação de temperatura

- **Requisitos:** FR4, NFR5.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Critérios de aceite:**
  - Testes cobrem valores conhecidos de conversão, valores negativos, zero e arredondamento.
  - Testes verificam o rótulo de Celsius/Fahrenheit e o comportamento para valor ausente ou inválido.
  - A suíte relacionada passa com `pnpm test -- temperature` ou comando equivalente do Vitest.

### T-06 — Implementar o mapeamento de condições WMO

- **Requisitos:** FR2, FR3.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/utils/weatherCode.ts`.
- **Critérios de aceite:**
  - Códigos WMO suportados são convertidos em descrições apropriadas ao idioma acordado em T-01.
  - Um código desconhecido tem fallback legível e não interrompe a renderização.
  - O mapeamento é centralizado e não duplicado nos componentes.

### T-07 — Testar o mapeamento de condições WMO

- **Requisitos:** FR2, FR3.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/weatherCode.test.ts`.
- **Critérios de aceite:**
  - Testes cobrem códigos representativos de condições comuns e código desconhecido.
  - Todos os resultados são descrições não vazias.
  - A suíte relacionada passa com `pnpm test -- weatherCode` ou comando equivalente do Vitest.

### T-08 — Implementar busca e normalização de cidades

- **Requisitos:** FR1, FR5.
- **Dependências:** T-01, T-03.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Critérios de aceite:**
  - Uma função de serviço consulta o endpoint de geocoding da Open-Meteo com o nome pesquisado e parâmetros acordados.
  - Respostas válidas são normalizadas para `City[]`, preservando região/país quando disponíveis.
  - Resposta sem resultados retorna lista vazia; falha HTTP, rede, timeout ou JSON inválido resulta em erro controlado.
  - Entrada vazia não dispara requisição.

### T-09 — Testar busca e normalização de cidades

- **Requisitos:** FR1, FR5, NFR4.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/services/openMeteo.test.ts`.
- **Critérios de aceite:**
  - Testes verificam parâmetros da requisição e normalização de resultados completos e com região/país ausentes.
  - Testes cobrem lista vazia, erro HTTP, falha de rede, timeout e JSON inválido.
  - As chamadas externas são substituídas por mocks; a suíte não depende da disponibilidade da API.

### T-10 — Implementar consulta e normalização de previsão

- **Requisitos:** FR2, FR3, FR5, FR6.
- **Dependências:** T-01, T-03, T-06.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Critérios de aceite:**
  - Uma função consulta o endpoint de forecast com coordenadas, timezone automático e período definido em T-01.
  - A resposta é normalizada para clima atual e dias de previsão, associando corretamente data, temperatura e condição.
  - A temperatura fica normalizada em Celsius; a referência temporal é preservada quando fornecida.
  - Erros HTTP, rede, timeout, JSON inválido e ausência de dados mínimos geram erro controlado.

### T-11 — Testar consulta e normalização de previsão

- **Requisitos:** FR2, FR3, FR5, FR6, NFR4, NFR5.
- **Dependências:** T-10.
- **Arquivos prováveis:** `tests/services/openMeteo.test.ts`.
- **Critérios de aceite:**
  - Testes verificam parâmetros, normalização do clima atual e quantidade/datas dos dias previstos.
  - Testes cobrem respostas parciais, dados mínimos ausentes e referência temporal ausente.
  - Testes cobrem erro HTTP, falha de rede, timeout e JSON inválido sem chamadas reais à API.

## Entrega 3 — Busca e coordenação de estado

### T-12 — Criar o componente de busca e seleção de cidades

- **Requisitos:** FR1, FR5, NFR1, NFR2.
- **Dependências:** T-02, T-03, T-08.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`.
- **Critérios de aceite:**
  - A pessoa usuária pode informar uma cidade, submeter a busca e selecionar um resultado.
  - Os resultados exibem nome e contexto geográfico disponível para distinguir homônimos.
  - Busca em andamento, lista vazia e erro são representáveis sem apresentar resultados obsoletos como atuais.
  - Campo, resultados e ações têm rótulos acessíveis e suporte a teclado.

### T-13 — Testar busca e seleção de cidades

- **Requisitos:** FR1, FR5, NFR2.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`.
- **Critérios de aceite:**
  - Testes cobrem submissão, seleção de resultado, resultados homônimos, loading, vazio e erro.
  - Testes validam interação por teclado e rótulos acessíveis relevantes.
  - O serviço é substituído por mock e os testes não chamam a Open-Meteo.

### T-14 — Implementar o hook de coordenação meteorológica

- **Requisitos:** FR1, FR2, FR3, FR5, FR6, NFR4, NFR5.
- **Dependências:** T-03, T-08, T-10.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Critérios de aceite:**
  - O hook mantém consulta, resultados da busca, cidade selecionada, estado meteorológico e unidade.
  - Busca e previsão têm estados independentes de idle/loading/success/empty/error conforme aplicável.
  - Selecionar uma cidade inicia a consulta correspondente e permite tentar novamente após falha.
  - Respostas obsoletas de buscas ou cidades anteriores não substituem o estado mais recente.
  - A alternância de unidade não muda cidade, datas ou dados meteorológicos normalizados.

### T-15 — Testar coordenação de busca e previsão

- **Requisitos:** FR1, FR2, FR3, FR5, FR6, NFR4, NFR5.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`.
- **Critérios de aceite:**
  - Testes verificam o fluxo de busca, seleção, consulta, erro e nova tentativa.
  - Testes verificam estados independentes de busca e previsão e descarte de resposta obsoleta.
  - Testes verificam que trocar unidade mantém cidade e datas.
  - Serviços externos são mockados.

## Entrega 4 — Apresentação dos dados

### T-16 — Implementar o controle de unidade

- **Requisitos:** FR4, NFR2, NFR5.
- **Dependências:** T-02, T-03.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Critérios de aceite:**
  - O controle permite selecionar Celsius ou Fahrenheit e identifica a opção ativa.
  - O controle expõe nome acessível e pode ser operado por teclado.
  - A seleção é comunicada ao componente pai sem manter estado duplicado de temperatura.

### T-17 — Testar controle de unidade

- **Requisitos:** FR4, NFR2.
- **Dependências:** T-16.
- **Arquivos prováveis:** `tests/components/UnitToggle.test.tsx`.
- **Critérios de aceite:**
  - Testes verificam as duas opções, estado selecionado e callback de mudança.
  - Testes verificam nome acessível e interação por teclado.

### T-18 — Implementar apresentação do clima atual

- **Requisitos:** FR2, FR4, FR6, NFR1, NFR5.
- **Dependências:** T-03, T-04, T-06.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Critérios de aceite:**
  - São apresentados nome da cidade, temperatura com unidade e descrição da condição.
  - Temperatura e condição usam utilitários de domínio para formatação e mapeamento.
  - A referência temporal é apresentada quando existir; campos opcionais ausentes não quebram a interface.

### T-19 — Implementar apresentação da previsão de cinco dias

- **Requisitos:** FR3, FR4, FR6, NFR1, NFR5.
- **Dependências:** T-01, T-03, T-04, T-06.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Critérios de aceite:**
  - São exibidos os dias e datas definidos em T-01, com temperatura e condição quando disponíveis.
  - Temperaturas usam a unidade selecionada e o formato acordado.
  - O componente trata campos opcionais ausentes sem ocultar datas ou quebrar o layout.
  - Em viewport mobile, os dias permanecem legíveis sem rolagem horizontal da página.

### T-20 — Criar componentes de estados de carregamento, vazio e erro

- **Requisitos:** FR5, NFR2, NFR4.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/components/WeatherStatus.tsx`.
- **Critérios de aceite:**
  - O componente suporta mensagens distintas para carregamento, vazio e erro.
  - Mensagens de erro podem incluir ação de tentar novamente quando aplicável.
  - Estados são comunicáveis por tecnologias assistivas e não dependem somente de cor.

## Entrega 5 — Composição, acessibilidade e validação

### T-21 — Integrar o fluxo completo na aplicação

- **Requisitos:** FR1, FR2, FR3, FR4, FR5, FR6, NFR1, NFR2, NFR4, NFR5, NFR6.
- **Dependências:** T-12, T-14, T-16, T-18, T-19, T-20.
- **Arquivos prováveis:** `src/App.tsx`, `src/index.css` ou folha de estilos existente, componentes em `src/components/`.
- **Critérios de aceite:**
  - A página conecta busca, seleção, consulta de clima, previsão, alternância de unidade e estados de carregamento/erro/vazio.
  - A cidade selecionada permanece identificável junto aos dados.
  - Os fluxos principais funcionam em tela mobile e desktop sem conteúdo sobreposto nem rolagem horizontal da página.
  - Os controles e mensagens têm semântica, rótulos e ordem de foco coerentes.
  - A aplicação não solicita conta nem localização automática do dispositivo.

### T-22 — Testar integração da página

- **Requisitos:** FR1, FR2, FR3, FR4, FR5, FR6, NFR2, NFR4, NFR5.
- **Dependências:** T-21.
- **Arquivos prováveis:** `tests/App.test.tsx`.
- **Critérios de aceite:**
  - Teste de integração valida busca, seleção, exibição do clima atual e previsão e mudança de unidade.
  - Testes verificam vazio e falhas com nova tentativa sem dados de uma cidade anterior apresentados como atuais.
  - Interações principais podem ser completadas por teclado.
  - Serviços são mockados para manter o teste determinístico.

### T-23 — Validar fluxos E2E em desktop e mobile

- **Requisitos:** FR1, FR2, FR3, FR4, FR5, NFR1, NFR2, NFR4.
- **Dependências:** T-21, T-22.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.
- **Critérios de aceite:**
  - Playwright cobre fluxo feliz de busca, seleção, visualização e alternância de unidade.
  - Playwright cobre ausência de resultados e falha de consulta com nova tentativa.
  - Pelo menos um fluxo é executado em viewport mobile e outro em viewport desktop.
  - Respostas da Open-Meteo são interceptadas para não depender de rede externa nos testes E2E.

### T-24 — Executar gates de qualidade do repositório

- **Requisitos:** NFR1, NFR2, NFR4, NFR5.
- **Dependências:** T-05, T-07, T-09, T-11, T-13, T-15, T-17, T-22, T-23.
- **Arquivos prováveis:** arquivos implementados em `src/` e `tests/`; configuração existente do Biome, Vite, Vitest e Playwright apenas se necessário.
- **Critérios de aceite:**
  - `pnpm lint` conclui sem erros relacionados à implementação.
  - `pnpm build` conclui com sucesso.
  - `pnpm test` conclui com sucesso.
  - `pnpm test:e2e` conclui com sucesso quando Playwright e seus navegadores estiverem disponíveis no ambiente.
  - Falhas ambientais do E2E ficam identificadas separadamente de falhas de produto/teste.