export type TruthOrDareRuleSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  steps?: string[];
  example?: { title: string; text: string };
  note?: { title: string; text: string };
};

export const truthOrDareRuleSections: TruthOrDareRuleSection[] = [
  {
    id: "the-point",
    title: "The point of the game",
    paragraphs: [
      "This game creates room for the conversations that do not always happen naturally. Some questions are light and funny. Others can be personal, deep, or a little uncomfortable. That is intentional.",
      "There are no winners or losers. If both players finish the night feeling closer and knowing something new about each other, the game did its job.",
    ],
  },
  {
    id: "quick-start",
    title: "Start here",
    paragraphs: [
      "The website is a visual guide for the conversation, whether you are on a call or sitting together. There is nothing to type here: read the card out loud, then let the real conversation happen away from the screen.",
    ],
    steps: [
      "One player asks a truth and asks the other player to answer.",
      "The person being asked answers, or chooses a dare as an alternative.",
      "The asker may answer the same truth too, but never has to.",
      "When the moment is complete, the person who was asked asks the next truth.",
    ],
    example: {
      title: "Example: a normal truth",
      text: "Mingo draws a truth and asks Bee to answer. Bee answers. Mingo can answer the same question too, if she wants to, but she is not required to. Bee then asks the next truth.",
    },
  },
  {
    id: "how-rounds-work",
    title: "How a round works",
    paragraphs: [
      "The person who draws the card is the asker. The other person is the one being asked. This keeps the game moving and makes the invitation to share clear.",
    ],
    steps: [
      "Ask a truth.",
      "Read it to the other player.",
      "Give the person being asked time to answer.",
      "If the person being asked does not want to answer, offer a dare as an alternative.",
      "Once the truth or dare is complete, the person who was asked becomes the next asker.",
    ],
    note: {
      title: "A shared moment, not a performance",
      text: "Answering your own question can make the conversation feel mutual. It is always welcome, but it is never a requirement or a condition for moving on.",
    },
  },
  {
    id: "truth-cards",
    title: "Truth cards",
    paragraphs: [
      "Truths can be playful, meaningful, intimate, or difficult. Write them so either person could answer fairly, especially when a question may eventually come back to the person who created it.",
      "The levels are a guide for tone, not a score. A heavy question does not need a heavy answer, and nobody owes more detail than they want to share.",
      "Questions about intimacy, compatibility, a future together, desires, concerns, and boundaries are welcome when they help you understand each other. They should never become a pressure test or a demand for disclosure.",
    ],
    bullets: [
      "Light: playful questions and easy stories.",
      "Medium: personal preferences, memories, and expectations.",
      "Heavy: vulnerable topics, future plans, fears, and important boundaries.",
    ],
  },
  {
    id: "intimacy-and-adult-topics",
    title: "Intimacy and adult topics",
    paragraphs: [
      "Questions about intimacy, compatibility, a future together, desires, concerns, and adult topics are allowed. They can create conversations that might not happen naturally otherwise.",
      "These questions must stay respectful, balanced, and comfortable for both players. The game is not a sexual interview, and nobody has to share more than they want to.",
    ],
    note: {
      title: "Make room, do not apply pressure",
      text: "Use these topics to understand each other, not to test, corner, or persuade each other. A question can be intimate without demanding an intimate answer.",
    },
  },
  {
    id: "dare-cards",
    title: "Dare cards",
    paragraphs: [
      "A dare is a challenge, not another question. It is an alternative when the person being asked chooses not to answer the truth.",
      "Dares should create a small, harmless, slightly awkward moment. They should be possible for both people and reasonable for the setting, whether you are on a call or together in person.",
      "After the dare is complete, the game returns to the truth and the round continues from there.",
    ],
    bullets: [
      "Light truth -> light dare.",
      "Heavier truth -> a more challenging, but still reasonable, dare.",
      "A dare should be tempting, but not so easy that answering becomes meaningless.",
    ],
    example: {
      title: "Example: choosing a dare",
      text: 'Mingo asks Bee a truth. Bee does not want to answer and chooses to face the dare. The game reveals the dare, "Show Mingo the last conversation on your phone." Bee completes it, and the game returns to the truth so the round can continue.',
    },
    note: {
      title: "Keep it safe",
      text: "A dare should never be humiliating, degrading, dangerous, or impossible in the current setting. Either person can replace it without needing to explain why.",
    },
  },
  {
    id: "ai-cards",
    title: "AI-generated cards",
    paragraphs: [
      "The game has two different AI card flows.",
      "During a game, the players may generate a new truth when their own unanswered truth cards run out. This lets the conversation continue. The generated truth enters the round like any other truth; it is not a separate kind of turn.",
      "In Deck Studio, the AI can suggest a card while a player is creating one. That suggestion is a draft for review. Edit it, keep it, or replace it before adding it to the deck.",
    ],
    bullets: [
      "The AI is a card-writing assistant, not a referee.",
      "AI-generated truths follow the same rules as player-written truths.",
      "Players decide what belongs in the deck and what feels right for the moment.",
    ],
  },
  {
    id: "skips-and-boundaries",
    title: "Skips and boundaries",
    paragraphs: [
      "A genuine no is allowed. If a truth or dare crosses a boundary, replace it or move on. No explanation is required beyond whatever the person wants to share.",
      "A skip is not a failure and it is not a debate. The point is to stretch a little, not to make anyone feel trapped.",
      "Skipping a card is different from completing it. A skipped card has not been answered and has not been accepted as a dare. The game avoids an immediate repeat, but the card may appear again later.",
    ],
    example: {
      title: "Example: an unexpected boundary",
      text: 'Bee starts answering but realizes the topic feels wrong tonight. Bee says, "I want to skip this one." Mingo accepts it, and the game moves on without asking for an explanation.',
    },
  },
  {
    id: "the-spirit",
    title: "The spirit of the game",
    paragraphs: [
      "The spirit matters more than clever loopholes. Do not answer technically without engaging with the question or look for ways to defeat the intent of a dare.",
      "Be curious, generous, and honest about what feels okay. The goal is to have fun, grow closer, and discover something you did not know before.",
    ],
  },
];
