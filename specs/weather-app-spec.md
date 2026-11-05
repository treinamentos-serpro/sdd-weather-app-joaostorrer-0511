# Especificação — Aplicação de previsão do tempo

## Overview

Aplicação web que permite consultar o clima atual de uma cidade e a previsão para cinco dias. Deve oferecer uma busca compreensível mesmo quando há cidades homônimas, permitir alternância entre Celsius e Fahrenheit e funcionar em dispositivos móveis e telas maiores.

### Objetivos

- Permitir encontrar e selecionar uma cidade para consultar suas condições meteorológicas.
- Apresentar clima atual e previsão de cinco dias de forma clara e consistente.
- Permitir visualizar as temperaturas nas unidades Celsius ou Fahrenheit.
- Oferecer uma experiência utilizável em dispositivos móveis.

## Functional Requirements

- **FR1 — Busca e seleção de cidade:** a pessoa usuária pode buscar uma cidade por nome e selecionar o local desejado. Quando disponíveis, informações como região/estado e país devem ajudar a distinguir cidades homônimas.
- **FR2 — Clima atual:** após selecionar uma cidade, o produto apresenta o nome do local, a temperatura atual e uma descrição da condição climática.
- **FR3 — Previsão de cinco dias:** para a cidade selecionada, o produto apresenta a previsão diária de cinco dias consecutivos. Cada dia deve ser identificável por sua data; temperatura e condição devem ser apresentadas quando fornecidas pela fonte de dados.
- **FR4 — Unidade de temperatura:** a pessoa usuária pode alternar entre Celsius e Fahrenheit. A unidade escolhida e seus valores devem ser identificados claramente em todas as temperaturas exibidas, incluindo clima atual e previsão.
- **FR5 — Estados de interação:** o produto comunica carregamento, resultados vazios e erros de busca ou de consulta meteorológica. Quando uma ação de tentar novamente for aplicável, ela deve estar disponível.
- **FR6 — Contexto dos dados:** a cidade selecionada deve permanecer identificável junto às informações meteorológicas. Quando a fonte fornecer a referência temporal dos dados, ela deve ser apresentada sem sugerir que os dados estão atualizados além do informado.

## User Stories

### US1 — Buscar e escolher uma cidade

Como pessoa que consulta o tempo, quero buscar uma cidade e identificar o local correto para ver a previsão correspondente.

**Acceptance Criteria**

- Ao informar um nome de cidade e iniciar a busca, o produto apresenta feedback de carregamento enquanto consulta os resultados.
- Quando houver correspondências, o produto apresenta opções selecionáveis e, quando disponíveis, mostra região/estado e país para diferenciar nomes iguais.
- Após selecionar uma opção, o local selecionado é identificado e a consulta de clima é iniciada para esse local.
- Se não houver correspondências, o produto informa que nenhum resultado foi encontrado e permite iniciar outra busca.
- Se a busca falhar, o produto informa que não foi possível pesquisar e oferece nova tentativa.

### US2 — Consultar o clima atual

Como pessoa que precisa decidir o que vestir ou levar, quero ver o clima atual da cidade selecionada para me preparar para as condições do momento.

**Acceptance Criteria**

- Após selecionar uma cidade e obter os dados, o produto exibe o nome da cidade, a temperatura atual e a descrição da condição climática.
- A temperatura inclui um rótulo explícito da unidade selecionada.
- Quando a consulta estiver em andamento, o produto exibe estado de carregamento sem apresentar os novos dados como se já estivessem disponíveis.
- Se os dados atuais não puderem ser obtidos, o produto informa a falha e permite tentar novamente.
- Se a fonte fornecer data/hora de referência, o produto a exibe junto aos dados.

### US3 — Consultar a previsão de cinco dias

Como pessoa que planeja os próximos dias, quero consultar uma previsão de cinco dias para a cidade selecionada para organizar minhas atividades.

**Acceptance Criteria**

- Após selecionar uma cidade e obter os dados, o produto apresenta cinco dias consecutivos de previsão, cada um com uma data identificável.
- Cada dia exibe temperatura e descrição da condição quando esses dados forem fornecidos pela fonte.
- As temperaturas da previsão usam a mesma unidade selecionada para o clima atual.
- Se a previsão não estiver disponível, o produto informa que não foi possível carregá-la e permite tentar novamente.

### US4 — Alternar Celsius e Fahrenheit

Como pessoa usuária, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade de minha preferência.

**Acceptance Criteria**

- O produto oferece uma ação identificável para selecionar Celsius ou Fahrenheit.
- Ao mudar a unidade, todas as temperaturas atualmente exibidas, no clima atual e na previsão, passam a usar a unidade escolhida.
- Cada valor de temperatura apresenta a unidade correspondente; não há mistura de unidades na mesma visualização.
- A mudança de unidade não altera a cidade selecionada nem as datas da previsão.

### US5 — Usar o produto em dispositivos móveis

Como pessoa usuária de celular, quero buscar uma cidade e consultar as informações meteorológicas em uma tela pequena para usar o produto em qualquer lugar.

**Acceptance Criteria**

- A busca, a seleção da cidade, a alternância de unidade e a leitura do clima atual e da previsão podem ser realizadas em um viewport mobile.
- O conteúdo e os controles permanecem visíveis e utilizáveis sem sobreposição ou rolagem horizontal da página.
- Os controles interativos podem ser operados por teclado e têm nomes ou rótulos acessíveis.

## Non-Functional Requirements

- **NFR1 — Responsividade:** a interface deve adaptar-se a dispositivos móveis e telas maiores; conteúdo e controles não devem se sobrepor nem exigir rolagem horizontal para as tarefas principais.
- **NFR2 — Acessibilidade:** usar estrutura semântica, rótulos compreensíveis, operação por teclado e contraste suficiente para leitura. O nível de conformidade e a matriz de tecnologias assistivas ainda precisam ser confirmados.
- **NFR3 — Desempenho percebido:** buscas e consultas devem fornecer feedback de carregamento assim que iniciadas. A meta quantitativa de resposta e o perfil de rede para medição ainda precisam ser definidos.
- **NFR4 — Resiliência:** falhas de rede, timeout, ausência de resultados e indisponibilidade da fonte não devem deixar a interface em estado inconsistente; deve haver mensagem compreensível e nova tentativa quando aplicável.
- **NFR5 — Consistência:** cidade, período da previsão e unidade devem corresponder entre as áreas da interface. A unidade deve estar explícita em cada valor de temperatura.
- **NFR6 — Privacidade e acesso:** a aplicação é informativa e, conforme a premissa atual, não exige conta ou autenticação.

## Edge Cases

- Busca vazia, composta apenas por espaços ou sem correspondências.
- Várias cidades com o mesmo nome, com dados incompletos de região ou país.
- Falha, demora excessiva ou resposta inválida durante busca ou obtenção dos dados meteorológicos.
- Clima atual disponível, mas previsão indisponível, ou vice-versa.
- Fonte sem um ou mais campos meteorológicos esperados ou sem data/hora de referência.
- Alternância de unidade durante o carregamento ou após uma consulta com dados visíveis.
- Previsão atravessando meia-noite ou mudança de data no fuso horário do local selecionado.
- Tela pequena, texto longo em nomes de cidade e resultados de busca extensos.
- Perda de conexão após a exibição de dados: o produto não deve apresentar dados anteriores como atuais sem indicar sua referência temporal.

## Assumptions

- O produto é uma aplicação web voltada a consultas informativas.
- A pessoa usuária tem acesso à internet para pesquisar cidades e obter dados meteorológicos.
- A aplicação usa Open-Meteo para geocodificação e previsão, sem chave de API, conforme o stack definido pelo projeto.
- Não há necessidade de conta ou autenticação na primeira versão, conforme o discovery.
- Os dados mínimos definidos para o clima atual são temperatura e descrição da condição; os campos adicionais permanecem por decidir.
- A previsão solicitada corresponde a cinco dias consecutivos; se o período inclui o dia atual e qual fuso determina as datas permanecem em aberto.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Cidades homônimas podem levar à seleção do local errado. | Alta | Médio | Exibir contexto geográfico nos resultados sempre que disponível e exigir seleção clara do local. |
| Indisponibilidade da fonte ou da rede impede a consulta. | Média | Alto | Apresentar erro compreensível, permitir nova tentativa e não rotular dados antigos como atuais. |
| Interpretação ambígua do período de cinco dias causa divergência entre produto e expectativa. | Média | Médio | Definir inclusão do dia atual e fuso horário antes da implementação. |
| Erro de conversão ou rótulo causa leitura incorreta de temperatura. | Baixa | Alto | Validar unidades e consistência em todas as áreas e estados da interface. |
| Layout ou controles tornam-se difíceis de usar em telas pequenas. | Média | Alto | Validar fluxos principais em viewports móveis representativos e com teclado. |
| Dados sem referência temporal são percebidos como atuais quando estão desatualizados. | Média | Médio | Exibir horário de referência quando disponível e definir claramente o comportamento para dados antigos. |

## Open Questions

1. A previsão de cinco dias inclui hoje ou começa amanhã? Qual fuso horário determina a data apresentada?
2. Quais campos, além de temperatura e condição, devem aparecer no clima atual e em cada dia da previsão?
3. Qual unidade deve ser selecionada inicialmente? A preferência precisa persistir entre visitas?
4. A busca deve sugerir cidades enquanto a pessoa digita ou somente após o envio da consulta?
5. A cidade só é consultada após seleção explícita ou há algum comportamento de seleção automática esperado?
6. Quais idiomas, formatos de data e formatos de hora serão suportados na primeira versão?
7. A aplicação deve lembrar a última cidade ou oferecer cidades favoritas?
8. Quais são os limites de cobertura, atualização, disponibilidade e uso da fonte definida?
9. Qual meta quantitativa de desempenho deve ser atendida e em quais condições de rede/dispositivo?
10. Qual nível de conformidade de acessibilidade deve ser exigido?
11. Quando a rede falhar, basta oferecer nova tentativa ou deve haver dados em cache, identificados como possivelmente desatualizados?
12. Quais navegadores e versões mínimas precisam ser suportados?

## Out of Scope

- Autenticação, contas de usuário e dados associados a uma conta.
- Geolocalização automática do dispositivo; não foi solicitada no briefing e depende de confirmação.
- Histórico meteorológico, alertas, notificações e recomendações personalizadas.
- Cidades favoritas ou persistência da última cidade, até que esse comportamento seja confirmado.
- Uso offline ou garantia de dados em cache; a aplicação depende de uma fonte externa e o comportamento offline está em aberto.
- Campos meteorológicos adicionais além dos dados mínimos acordados, até que sejam definidos nas perguntas em aberto.