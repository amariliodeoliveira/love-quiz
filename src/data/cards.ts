export type Level = "1" | "2" | "3" | "dare";

export interface Card {
  id: string;
  level: Level;
  question: string;
}

export const LEVEL_META: Record<
  Level,
  { label: string; emoji: string; className: string }
> = {
  "1": { label: "Level 1 — Light", emoji: "🟢", className: "l1" },
  "2": { label: "Level 2 — Medium", emoji: "🟡", className: "l2" },
  "3": { label: "Level 3 — Heavy", emoji: "🔴", className: "l3" },
  dare: { label: "Dares", emoji: "🟣", className: "ldare" },
};

export const cards: Card[] = [
  // ── LEVEL 1 — LIGHT ──
  {
    id: "1-1",
    level: "1",
    question:
      "A genie offers you a billion dollars, but there's a catch: you'll be turned into a non-talking frog. The only way to become human again is to convince your partner to kiss you within five days. They have no idea the frog is actually you. What's your plan?",
  },
  {
    id: "1-2",
    level: "1",
    question:
      "What's something I do that would probably seem weird to most people, but you somehow find cute?",
  },
  {
    id: "1-3",
    level: "1",
    question:
      "On a scale of 1 to 10, how nervous were you on our first call, and what do you remember about it?",
  },
  {
    id: "1-4",
    level: "1",
    question:
      "What's the most absurd reaction you've gotten from someone after telling them about our long-distance relationship?",
  },
  {
    id: "1-5",
    level: "1",
    question:
      "What's the silliest thing you've done because of me that I don't know about?",
  },
  {
    id: "1-6",
    level: "1",
    question:
      "If I showed up at the airport dramatically shorter or taller than you expected because I lied about my height, what would your reaction be, and would it change anything between us?",
  },
  {
    id: "1-7",
    level: "1",
    question:
      "What's the funniest realistic thing that could happen when we spend our first day together?",
  },
  {
    id: "1-8",
    level: "1",
    question:
      "What's the most embarrassing thing that could happen during our first hour together?",
  },
  {
    id: "1-9",
    level: "1",
    question:
      "What's something awkward but funny that could realistically happen during our first intimate moment together in bed that would make us both laugh?",
  },
  {
    id: "1-10",
    level: "1",
    question:
      "If we got stuck in an elevator together for an hour, how do you think it would go?",
  },
  {
    id: "1-11",
    level: "1",
    question:
      "If we were stuck in an elevator together for an hour with no internet or cameras, just the two of us, how do you think it would go?",
  },
  {
    id: "1-12",
    level: "1",
    question: "Who do you think will cry first when we finally meet, and why?",
  },
  {
    id: "1-13",
    level: "1",
    question:
      "Who do you think will make the first move for our first kiss, and why?",
  },
  {
    id: "1-14",
    level: "1",
    question: "What song makes you think of me, and why?",
  },
  {
    id: "1-15",
    level: "1",
    question: "What's something you're secretly hoping happens when we meet?",
  },
  {
    id: "1-16",
    level: "1",
    question:
      "What's a harmless thing you've pretended to like, dislike, or care about just because of me?",
  },
  {
    id: "1-17",
    level: "1",
    question:
      "If I had a magical counter showing every white lie you've ever told me, what do you think the number would be?",
  },
  {
    id: "1-18",
    level: "1",
    question:
      "What's something completely ordinary you're excited to do together?",
  },
  {
    id: "1-19",
    level: "1",
    question:
      "What's a weirdly specific thing you're excited to experience together that most people probably wouldn't think about?",
  },

  // ── LEVEL 2 — MEDIUM ──
  {
    id: "2-1",
    level: "2",
    question:
      "What aspect of my culture intrigues you the most, and what aspect do you think might be the most challenging to adapt to?",
  },
  {
    id: "2-2",
    level: "2",
    question:
      "What's something you've learned from being in a long-distance relationship that you don't think you would've learned otherwise?",
  },
  {
    id: "2-3",
    level: "2",
    question:
      "What's something about yourself that long distance has forced you to face?",
  },
  {
    id: "2-4",
    level: "2",
    question:
      "What's something you hope stays the same about us after we're no longer long-distance?",
  },
  {
    id: "2-5",
    level: "2",
    question: "What was the moment you first realized you really liked me?",
  },
  {
    id: "2-6",
    level: "2",
    question:
      "If our first kiss happened exactly the way you'd want it to, what would it be like?",
  },
  {
    id: "2-7",
    level: "2",
    question:
      "What's something about romance that you think people consistently get wrong?",
  },
  {
    id: "2-8",
    level: "2",
    question:
      "What do you think makes me different from other people you've met?",
  },
  {
    id: "2-9",
    level: "2",
    question: "What's your happiest early memory of us so far?",
  },
  {
    id: "2-10",
    level: "2",
    question:
      "What's something you think is worth spending a lot of money on, even when most people would consider it a luxury?",
  },
  {
    id: "2-11",
    level: "2",
    question:
      "What's something you find surprisingly attractive that most people wouldn't think twice about?",
  },
  {
    id: "2-12",
    level: "2",
    question:
      "What's something completely innocent that can become surprisingly intimate at the right moment?",
  },
  {
    id: "2-13",
    level: "2",
    question:
      "What's something two people can do together that feels unexpectedly intimate, even though it isn't romantic or sexual?",
  },
  {
    id: "2-14",
    level: "2",
    question:
      "What's something you think I understand about you better than most people do?",
  },
  {
    id: "2-15",
    level: "2",
    question: "How has your definition of love changed since we met?",
  },
  {
    id: "2-16",
    level: "2",
    question:
      "What's the most important value you'd want us to share as a couple?",
  },
  {
    id: "2-17",
    level: "2",
    question:
      "When you think about love, what actions or behaviors make you feel it the most?",
  },
  {
    id: "2-18",
    level: "2",
    question:
      "What's one thing you think could make communication between us even better?",
  },
  {
    id: "2-19",
    level: "2",
    question:
      "When you think about me during your day, what's the first image that comes to mind?",
  },
  {
    id: "2-20",
    level: "2",
    question:
      "What do you think will surprise you the most about being physically close to me?",
  },
  {
    id: "2-21",
    level: "2",
    question:
      'You won a "One Wish Willow (Obsession)" with no loopholes, but the only condition is that you can only improve one thing about your partner. What would it be?',
  },
  {
    id: "2-22",
    level: "2",
    question:
      'You won a "One Wish Willow (Obsession)" with no loopholes, but the only condition is that you can only change something about yourself. What would it be?',
  },
  {
    id: "2-23",
    level: "2",
    question:
      "If you had to explain both your biggest reason for wanting to share a home with me and your biggest fear about it, what would they be?",
  },
  {
    id: "2-24",
    level: "2",
    question:
      "What's something you'd be disappointed to discover we never talked about before becoming intimate?",
  },
  {
    id: "2-25",
    level: "2",
    question:
      "What's a boundary, preference, or expectation about intimacy that you think people should talk about more openly?",
  },
  {
    id: "2-26",
    level: "2",
    question:
      "What role do you think sex plays in a healthy long-term relationship?",
  },
  {
    id: "2-27",
    level: "2",
    question:
      "What's something you hope does change about you in the next ten years?",
  },
  {
    id: "2-28",
    level: "2",
    question:
      "If you were introducing me to your parents today, what would you say about me to make them like me?",
  },
  {
    id: "2-29",
    level: "2",
    question:
      "What's something you wish more people understood about your life?",
  },
  {
    id: "2-30",
    level: "2",
    question:
      "If we ever faced a serious challenge as a couple, what would make you confident we could get through it?",
  },
  {
    id: "2-31",
    level: "2",
    question:
      "What's a dream you've carried for so long that you can't imagine yourself without it?",
  },
  {
    id: "2-32",
    level: "2",
    question:
      "What's something you would find difficult to give up for a relationship, no matter how much you loved the person?",
  },

  // ── LEVEL 3 — HEAVY ──
  {
    id: "3-1",
    level: "3",
    question:
      "What's a thought you've had about me, us, or our future that you've never shared before?",
  },
  {
    id: "3-2",
    level: "3",
    question:
      "Is there a belief that's important to you (religious, cultural, or maybe personal) that you think I don't fully understand yet?",
  },
  {
    id: "3-3",
    level: "3",
    question:
      "If you discovered that I had secretly worked in the adult industry before we met, what would be your first thought?",
  },
  {
    id: "3-4",
    level: "3",
    question:
      "We're engaged. Excluding obvious deal-breakers, what's the most random thing that could realistically make you call off the engagement, and why?",
  },
  {
    id: "3-5",
    level: "3",
    question:
      'We\'re standing at the altar. Right after the officiant says, "Speak now or forever hold your peace," someone interrupts the ceremony, clearly known to your partner but a stranger to you, and confesses their love for them. What do you do next, and why?',
  },
  {
    id: "3-6",
    level: "3",
    question:
      "Someone you trust comes to you and says they might have seen me cheating on you, but they aren't completely sure. They seem honest and shaken by it. What do you do next, and why?",
  },
  {
    id: "3-7",
    level: "3",
    question: "What's something about your body that would surprise me?",
  },
  {
    id: "3-8",
    level: "3",
    question:
      "What's your biggest fear about moving from online to real life together?",
  },
  {
    id: "3-9",
    level: "3",
    question:
      "Do you think the first time for a couple needs to be perfect, or is imperfection just part of it?",
  },
  {
    id: "3-10",
    level: "3",
    question:
      "You wake up remembering everything about us, except my physical appearance. You won't see me again until I step out of the airport arrival gate, and you can't try to reconstruct what I look like. What do you think would change in the way you relate to me during that time, if anything?",
  },
  {
    id: "3-11",
    level: "3",
    question:
      "You wake up in my body, living my life in my country. I'm in your body, living your life in yours. We both know exactly what happened, and there's nothing we can do about it for now. What's the first thing you'd be most curious to do, and why?",
  },
  {
    id: "3-12",
    level: "3",
    question:
      "If one of us earned significantly more than the other, how do you think that should affect the relationship, if at all?",
  },
  {
    id: "3-13",
    level: "3",
    question:
      "We're about to be intimate for the very first time. What's the most awkward or unexpected thing that could completely kill the mood for you?",
  },
  {
    id: "3-14",
    level: "3",
    question:
      "What's something you suspect I've been curious about, but too nervous to ask?",
  },
  {
    id: "3-15",
    level: "3",
    question: "What's the biggest risk you feel you're taking by choosing me?",
  },
  {
    id: "3-16",
    level: "3",
    question:
      "What's the physical insecurity you're most nervous I'll notice when we're finally together in person?",
  },
  {
    id: "3-17",
    level: "3",
    question:
      "I'm about to leave, not because I stopped loving you, but because I no longer believe our relationship can work. What's the one thing you'd say to change my mind?",
  },
  {
    id: "3-18",
    level: "3",
    question:
      "You can have $1 million right now, but you must completely ghost me for a year. I won't know why, and you'll never be allowed to tell me the reason afterward. By the end of that year, there's a good chance I'll have moved on. Would you take the deal?",
  },
  {
    id: "3-19",
    level: "3",
    question:
      "If I told you I'd once been to prison for a harmless but absurd reason, but also told you I'd never reveal what it was, what would you do?",
  },
  {
    id: "3-20",
    level: "3",
    question:
      "If you found out I could never have biological children, how would that affect the way you picture our future together?",
  },
  {
    id: "3-21",
    level: "3",
    question:
      "What's the biggest financial mistake you've ever made, and what did it teach you?",
  },
  {
    id: "3-22",
    level: "3",
    question:
      "If you were to die today without the chance to speak to anyone again, what would you most regret never having told someone, and why haven't you told them yet?",
  },
  {
    id: "3-23",
    level: "3",
    question:
      "Your family loves me. Your closest friends hate me. Both groups genuinely care about you, and neither can explain exactly why they feel that way. Their opinions will never change. What would you do?",
  },
  {
    id: "3-24",
    level: "3",
    question:
      "If I were much less attractive than I am, would you still have given me a chance on OkCupid?",
  },
  {
    id: "3-25",
    level: "3",
    question:
      "If you could know one thing about our future together right now, what would you want to know?",
  },
  {
    id: "3-26",
    level: "3",
    question:
      "What's something that makes you immediately shut down during a disagreement?",
  },
  {
    id: "3-27",
    level: "3",
    question:
      "What's something you've never told me because it felt a little embarrassing to bring up?",
  },
  {
    id: "3-28",
    level: "3",
    question:
      "What's something I've said that stuck with you more than I probably realized?",
  },
  {
    id: "3-29",
    level: "3",
    question:
      "What's the worst advice you've ever given someone that seemed brilliant at the time?",
  },
  {
    id: "3-30",
    level: "3",
    question:
      "If you had to make a completely wild guess, when do you think we'll get married?",
  },
  {
    id: "3-31",
    level: "3",
    question:
      "We just moved into our first place together, but one of us gets offered their dream job in another country. What would your first instinct be?",
  },
  {
    id: "3-32",
    level: "3",
    question:
      "What do you think would be the most challenging part of living with me day-to-day?",
  },
  {
    id: "3-33",
    level: "3",
    question:
      "Imagine we're married and suddenly receive $1 million. What's the very first thing you think we'd do with it?",
  },
  {
    id: "3-34",
    level: "3",
    question:
      "If you were going through the hardest period of your life, what would you need from me the most?",
  },
  {
    id: "3-35",
    level: "3",
    question:
      "What's one thing you would genuinely want to know about your future, even if you couldn't change it?",
  },
  {
    id: "3-36",
    level: "3",
    question:
      "Where do you think you would be in life right now if we had never met?",
  },
  {
    id: "3-37",
    level: "3",
    question: "What's the biggest risk you feel you're taking by choosing me?",
  },

  // ── DARES ──
  {
    id: "d-1",
    level: "dare",
    question:
      'The Freeze Frame: Every time I say the word "Valentine" during the next round, you must freeze completely for 20 seconds mid-sentence.',
  },
  {
    id: "d-2",
    level: "dare",
    question:
      "The Model: Give the camera your best 3 dramatic, over-the-top high-fashion modeling poses, holding each one for 5 seconds.",
  },
  {
    id: "d-3",
    level: "dare",
    question:
      "The Cartoon Dub: You must answer every question in the next round using a ridiculous, high-pitched cartoon voice.",
  },
  {
    id: "d-4",
    level: "dare",
    question:
      "The Dramatic Shakespeare: Read the last text message you received out loud as if you were an actor performing a tragic, intense theater play.",
  },
  {
    id: "d-5",
    level: "dare",
    question:
      "The Whisper Challenge: For the next round, you can only speak in a very intense, dramatic whisper, as if we are sharing government secrets.",
  },
  {
    id: "d-6",
    level: "dare",
    question:
      'The Emoji Reveal: Show your phone screen to the camera displaying your "recently used" emojis and explain the story behind the weirdest one.',
  },
  {
    id: "d-7",
    level: "dare",
    question:
      "The Photo Roulette: Scroll through your camera roll blindly for 5 seconds, stop, and show me whatever photo your finger landed on.",
  },
  {
    id: "d-8",
    level: "dare",
    question:
      "The Search History: Read out loud the last 3 things you actually typed into your phone's browser search bar.",
  },
  {
    id: "d-9",
    level: "dare",
    question:
      'The Autocomplete: Open our chat, type "I secretly think you are..." and let your phone\'s autocomplete finish the sentence. Click autocomplete at least 10 times. You must read the result out loud.',
  },
  {
    id: "d-10",
    level: "dare",
    question:
      "The Blind Typing: Send me a text message explaining what you had for your last meal, but you must type it with your eyes completely closed. No autocorrect.",
  },
  {
    id: "d-11",
    level: "dare",
    question:
      "The Serious Debate: Give me a 1-minute, incredibly passionate and serious argument about why water is wet.",
  },
];
