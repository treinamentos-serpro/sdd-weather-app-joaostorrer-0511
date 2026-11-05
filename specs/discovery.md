# Discovery — Aplicação de previsão do tempo

## Contexto

Aplicação web para consultar rapidamente o clima de uma cidade e planejar os próximos dias. A experiência deve funcionar bem tanto em dispositivos móveis quanto em telas maiores.

## Requisitos Funcionais

- **RF1 — Buscar cidades:** permitir que a pessoa usuária pesquise uma cidade pelo nome e selecione o local correto quando houver resultados homônimos.
- **RF2 — Consultar clima atual:** exibir as condições atuais para a cidade selecionada, incluindo ao menos temperatura e descrição da condição climática. Os demais indicadores a exibir ainda precisam ser definidos.
- **RF3 — Consultar previsão:** exibir a previsão para cinco dias da cidade selecionada.
- **RF4 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit e atualizar os valores de temperatura exibidos de forma consistente.
- **RF5 — Comunicar estados da consulta:** informar quando os dados estão carregando, quando não há resultados e quando ocorre uma falha na busca ou na obtenção da previsão.

## Requisitos Não Funcionais

- **RNF1 — Responsividade:** oferecer uma experiência utilizável em dispositivos móveis e adaptar o layout a diferentes tamanhos de tela.
- **RNF2 — Usabilidade:** tornar busca, seleção de cidade e alternância de unidade compreensíveis e acessíveis sem depender exclusivamente de gestos ou cor.
- **RNF3 — Acessibilidade:** usar estrutura semântica, rótulos claros, suporte à navegação por teclado e contraste adequado.
- **RNF4 — Desempenho:** apresentar feedback imediato ao iniciar uma busca e carregar os dados em tempo adequado para uso cotidiano. Um orçamento de desempenho mensurável deve ser definido durante o planejamento.
- **RNF5 — Resiliência:** tratar indisponibilidade de rede ou da fonte de dados sem deixar a interface em estado inconsistente, oferecendo uma mensagem compreensível e uma forma de tentar novamente.
- **RNF6 — Consistência dos dados:** manter local, período da previsão e unidade selecionada consistentes entre as áreas de clima atual e previsão.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação inicial |
| --- | --- | --- | --- |
| Resultados de busca ambíguos para cidades com o mesmo nome | Alta | Médio | Apresentar informações de contexto, como estado/região e país, antes da seleção. |
| API de clima ou conexão indisponível | Média | Alto | Implementar estados de erro e nova tentativa; não exibir dados como atuais sem indicar eventual desatualização. |
| Previsão de cinco dias interpretada de formas diferentes | Média | Médio | Definir explicitamente se o período inclui o dia atual e qual fuso horário determina a data. |
| Conversão ou rotulagem incorreta de Celsius e Fahrenheit | Baixa | Alto | Definir unidade internamente e validar conversão e apresentação com testes. |
| Interface difícil de usar em telas pequenas | Média | Alto | Adotar abordagem mobile-first e validar em larguras de tela representativas. |
| Dados apresentados sem contexto de atualização ou localização | Média | Médio | Exibir cidade selecionada e horário/data de referência dos dados, conforme suporte da fonte. |

## Perguntas em Aberto

1. A previsão de cinco dias inclui hoje ou começa no próximo dia? Como tratar o fuso horário da cidade?
2. Quais campos devem aparecer no clima atual e na previsão além da temperatura e da condição climática (por exemplo, mínima/máxima, chance de chuva, vento e umidade)?
3. Qual deve ser a unidade inicial e a preferência deve persistir entre visitas?
4. A busca deve oferecer sugestões enquanto a pessoa digita? Quais informações devem identificar resultados homônimos?
5. O produto deve selecionar uma cidade automaticamente, ou a consulta só começa após uma escolha explícita?
6. Quais idiomas e formatos de data/hora devem ser suportados na primeira versão?
7. É necessário manter a última cidade consultada ou oferecer cidades favoritas?
8. Há metas de desempenho, navegadores/dispositivos mínimos ou requisitos de disponibilidade a cumprir?
9. Qual comportamento é esperado quando não há rede: apenas permitir nova tentativa ou também mostrar dados armazenados, identificando que podem estar desatualizados?

## Premissas Iniciais

- A aplicação é voltada a consultas informativas, sem necessidade de conta ou autenticação no escopo descrito.
- A consulta depende de uma conexão com a internet e de uma fonte externa de dados meteorológicos.
- A descrição do briefing não define dados meteorológicos específicos além da previsão atual e de cinco dias; os campos adicionais devem ser confirmados antes da especificação detalhada.
