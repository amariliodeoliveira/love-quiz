1. Visão Geral do Sistema
   O projeto é um web app privado de "Verdade ou Desafio" exclusivo para um casal, que funciona como um guia visual e suporte para o jogo que acontece de forma conversacional/física entre ambos.
   ┄

2. Arquitetura e Fluxo de Telas (UX/UI)
   2.1. Tela Inicial (rota: /truth-or-dare)
   Visual: Vai se manter muito parecido com o que temos hoje, apenas com mudanças pontuais. Nesta tela, além do nome do jogo, tag <p>, etc, que temos hoje, deverá ter:
   Ações: Dois botões centrais lado a lado:
   [ Jogar 🚀 ] (Botão principal de ação).
   [ Ver Regras 📖 ] (Botão secundário, desabilitado temporariamente).
   Toda a listagem antiga de cards na home e os filtros por níveis foram removidos.

2.2. Tela do Jogo Iniciado (/truth-or-dare/game)
Foco total na imersão. O cabeçalho é simplificado: o countdown desaparece, o logo do jogo (Couples Card Deck) vai ocupar aquele espaço central. Aquele botão de "manage cards" vai sair em definitivo do header em todos os locais do site, e vai virar uma opção "Edit couple card deck (ou um nome melhor) embaixo do "edit countdown" lá no menu de perfil/profile)". No lugar dele, passará a ser um botão de ➔ Sair do Jogo quando dentro do jogo.

O Fluxo da Rodada:
Estado Inicial: Irá começar com um botão no centro: [ Sorteie uma Verdade ].
Sorteio de Verdade (Truth): Exibe o card com a pergunta aleatória sorteada dentre as opções disponíveis (não respondidas). Abaixo, terá os botões de ações da rodada:
Opção 1: Sortear uma dare.
Irá para a opção 3 (sorteio de dare).
Opção 2: Confirmar rodada.
A pergunta será marcada como respondida, e será sorteada uma nova pergunta aleatória, recomeçando esse fluxo.
Opção 3: Pular pergunta.
Será uma opção menor, centralizada embaixo, assim como é atualmente (semelhante aquelas opções de "esqueci minha senha", sublinhada).
Ele também irá fazer uma nova pergunta ser sorteada, porém, ela não fará a pergunta ser marcada como respondida.
Sorteio de Desafio (Dare): Será reaproveitada a mesma estrutura do "sorteio de perguntas", e deverá ser sorteada uma dare aleatória. Abaixo, terá os botões de ações:
Opção 1: [ Feito 🔥 ]
Deverá incrementar um contador de quantidades de que esse desafio foi cumprido em +1. Por enquanto, este contador deverá apenas constar no banco de dados, e será utilizado em outro momento.
Ele deverá retornar a última pergunta em aberto, do momento em que foi apertado o botão de "Sortear uma dare". Portanto, não deverá sortear uma nova pergunta. Apenas retornar.
Opção 2: [ Pular 🔄 ]
Irá sortear uma nova dare, SEM realizar incremento no contador de quantidades deste respectivo desafio. Irá iniciar este fluxo 3 novamente.
Quando acabarem as perguntas: a página deverá aparecer que finalizamos o jogo, e um botão para adicionar novas perguntas que irá redirecionar para a área de gerenciamento do jogo.

2.3. Área de Gerenciamento Pessoal (/gerenciar)

Cada usuário autenticado gerencia apenas os itens que ele mesmo criou, protegendo o elemento surpresa do parceiro.

Aba 1: Perguntas (Truths)

Dividida em duas sub-abas:
Ativas: Lista de perguntas que ainda não foram respondidas. Não sei como está no banco de dados hoje, mas acredito que bastava um status: 'disponivel', ou até mesmo um booleano.
Ações: Editar e Excluir.
Histórico (Respondidas): Lista de perguntas que já foram respondidas, com status: 'respondida', ou como foi definido no banco caso seja um simples booleano.
Deverá também exibir de forma discreta a data e horário da resposta (Respondida em DD/MM às HH:MM). Deverá sempre pegar o fuso horário do servidor, e mostrá-lo no fuso horário de Manila, Filipinas.
Ações: Reativar (muda status para 'disponivel') e Excluir.

Aba 2: Desafios (Dares)
Lista única de desafios (eles nunca sairão de circulação).
Visual de Ranking:
Deverá ser ordenado em ordem decrescente com base na quantidade de vezes que foi realizado.
Os 3 primeiros deverá exibir um badge (🥇,🥈,🥉). A lista é ordenada de forma decrescente pelo número de conclusões (timesCompleted).
Ações: Editar e Excluir.
┄

3. Modais de Confirmação (UX Guardrails)

Um componente genérico ConfirmationModal deve ser disparado nas seguintes ações de gerenciamento:

Excluir (Perguntas/Desafios): "Excluir item? Tem certeza que deseja apagar? Essa ação não poderá ser desfeita e o item sumirá do histórico." [ Cancelar ] | [ Sim, excluir ] (Danger).

Reativar Pergunta: "Voltar para o jogo? Deseja colocar essa pergunta de volta na lista de sorteio? Ela sairá do histórico." [ Cancelar ] | [ Reativar ] (Success).
