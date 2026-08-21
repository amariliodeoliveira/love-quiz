export type TruthOrDareRuleSection = {
  id: string;
  titleKey: string;
  paragraphKeys?: string[];
  bulletKeys?: string[];
  stepKeys?: string[];
  example?: { titleKey: string; textKey: string };
  note?: { titleKey: string; textKey: string };
};

export const truthOrDareRuleSections: TruthOrDareRuleSection[] = [
  {
    id: "the-point",
    titleKey: "rules.sections.thePoint.title",
    paragraphKeys: [
      "rules.sections.thePoint.paragraphs.0",
      "rules.sections.thePoint.paragraphs.1",
    ],
  },
  {
    id: "quick-start",
    titleKey: "rules.sections.quickStart.title",
    paragraphKeys: ["rules.sections.quickStart.paragraphs.0"],
    stepKeys: [
      "rules.sections.quickStart.steps.0",
      "rules.sections.quickStart.steps.1",
      "rules.sections.quickStart.steps.2",
      "rules.sections.quickStart.steps.3",
    ],
    example: {
      titleKey: "rules.sections.quickStart.example.title",
      textKey: "rules.sections.quickStart.example.text",
    },
  },
  {
    id: "how-rounds-work",
    titleKey: "rules.sections.howRoundsWork.title",
    paragraphKeys: ["rules.sections.howRoundsWork.paragraphs.0"],
    stepKeys: [
      "rules.sections.howRoundsWork.steps.0",
      "rules.sections.howRoundsWork.steps.1",
      "rules.sections.howRoundsWork.steps.2",
      "rules.sections.howRoundsWork.steps.3",
      "rules.sections.howRoundsWork.steps.4",
    ],
    note: {
      titleKey: "rules.sections.howRoundsWork.note.title",
      textKey: "rules.sections.howRoundsWork.note.text",
    },
  },
  {
    id: "truth-cards",
    titleKey: "rules.sections.truthCards.title",
    paragraphKeys: [
      "rules.sections.truthCards.paragraphs.0",
      "rules.sections.truthCards.paragraphs.1",
      "rules.sections.truthCards.paragraphs.2",
    ],
    bulletKeys: [
      "rules.sections.truthCards.bullets.0",
      "rules.sections.truthCards.bullets.1",
      "rules.sections.truthCards.bullets.2",
    ],
  },
  {
    id: "intimacy-and-adult-topics",
    titleKey: "rules.sections.intimacyAndAdultTopics.title",
    paragraphKeys: [
      "rules.sections.intimacyAndAdultTopics.paragraphs.0",
      "rules.sections.intimacyAndAdultTopics.paragraphs.1",
    ],
    note: {
      titleKey: "rules.sections.intimacyAndAdultTopics.note.title",
      textKey: "rules.sections.intimacyAndAdultTopics.note.text",
    },
  },
  {
    id: "dare-cards",
    titleKey: "rules.sections.dareCards.title",
    paragraphKeys: [
      "rules.sections.dareCards.paragraphs.0",
      "rules.sections.dareCards.paragraphs.1",
      "rules.sections.dareCards.paragraphs.2",
    ],
    bulletKeys: [
      "rules.sections.dareCards.bullets.0",
      "rules.sections.dareCards.bullets.1",
      "rules.sections.dareCards.bullets.2",
    ],
    example: {
      titleKey: "rules.sections.dareCards.example.title",
      textKey: "rules.sections.dareCards.example.text",
    },
    note: {
      titleKey: "rules.sections.dareCards.note.title",
      textKey: "rules.sections.dareCards.note.text",
    },
  },
  {
    id: "ai-cards",
    titleKey: "rules.sections.aiCards.title",
    paragraphKeys: [
      "rules.sections.aiCards.paragraphs.0",
      "rules.sections.aiCards.paragraphs.1",
      "rules.sections.aiCards.paragraphs.2",
    ],
    bulletKeys: [
      "rules.sections.aiCards.bullets.0",
      "rules.sections.aiCards.bullets.1",
      "rules.sections.aiCards.bullets.2",
    ],
  },
  {
    id: "skips-and-boundaries",
    titleKey: "rules.sections.skipsAndBoundaries.title",
    paragraphKeys: [
      "rules.sections.skipsAndBoundaries.paragraphs.0",
      "rules.sections.skipsAndBoundaries.paragraphs.1",
      "rules.sections.skipsAndBoundaries.paragraphs.2",
    ],
    example: {
      titleKey: "rules.sections.skipsAndBoundaries.example.title",
      textKey: "rules.sections.skipsAndBoundaries.example.text",
    },
  },
  {
    id: "the-spirit",
    titleKey: "rules.sections.theSpirit.title",
    paragraphKeys: [
      "rules.sections.theSpirit.paragraphs.0",
      "rules.sections.theSpirit.paragraphs.1",
    ],
  },
];
