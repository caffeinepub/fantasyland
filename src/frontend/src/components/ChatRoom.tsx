// Speech Recognition type declarations
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  Check,
  Gamepad2,
  MessageSquarePlus,
  Mic,
  Paperclip,
  Pencil,
  Send,
  Smile,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";
import { playMessageSound } from "../hooks/useNotificationSound";
import { usePresence } from "../hooks/usePresence";
import {
  useFriendRequestStatus,
  useJoinRPSGame,
  useMessages,
  useOnlineUsers,
  useSendFriendRequest,
  useSendMessage,
} from "../hooks/useQueries";
import AnimatedAvatar from "./AnimatedAvatar";
import CameraModal from "./CameraModal";
import NumberGuess from "./NumberGuess";
import QuickDMModal from "./QuickDMModal";
import TicTacToe from "./TicTacToe";
import UsernameTopBar from "./UsernameTopBar";

interface Props {
  isStranger?: boolean;
  roomId: string;
  roomName: string;
  roomEmoji: string;
  username: string;
  onBack: () => void;
  onRename?: () => void;
  extraPanel?: React.ReactNode;
  onStartDm?: (roomId: string, friendName: string) => void;
  onSkip?: () => void;
  onGoToGameZone?: () => void;
}

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const AVATAR_COLORS = [
  "oklch(0.65 0.28 305)",
  "oklch(0.72 0.2 200)",
  "oklch(0.78 0.15 85)",
  "oklch(0.6 0.25 250)",
  "oklch(0.65 0.22 50)",
  "oklch(0.75 0.22 320)",
  "oklch(0.7 0.28 330)",
  "oklch(0.7 0.2 180)",
];

function getUserColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const EMOJIS = [
  "😀",
  "😂",
  "😄",
  "😆",
  "😉",
  "😍",
  "😘",
  "😜",
  "🤣",
  "🥰",
  "😱",
  "😢",
  "😡",
  "🤔",
  "😎",
  "🤓",
  "❤️",
  "💕",
  "💖",
  "💜",
  "💛",
  "💚",
  "💙",
  "👍",
  "👎",
  "👏",
  "🙌",
  "👋",
  "✌️",
  "🤞",
  "💪",
  "🎉",
  "🔥",
  "⭐",
  "🌟",
  "⚡",
  "🌈",
  "🦄",
  "🐉",
  "🐶",
];

// AI Bot - Advanced responses with context awareness
function getAdvancedBotReply(msg: string, history: string[] = []): string {
  const m = msg.toLowerCase();
  const historyText = history.join(" ").toLowerCase();
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const maybeQuestion = (reply: string, questions: string[]) =>
    Math.random() < 0.4 ? `${reply} ${pick(questions)}` : reply;

  // Context flags
  const historyHasSad =
    /sad|depress|lonely|cry|hurt|bad day|upset|anxious/.test(historyText);
  const historyHasJoke = /haha|lol|funny|joke|😂|laugh/.test(historyText);

  // Empathy override — if someone mentioned being sad/down recently
  if (
    historyHasSad &&
    m.match(/^(ok|okay|yeah|yep|sure|fine|alright|whatever|i guess)$/)
  ) {
    return pick([
      "I'm here for you 💙 Sometimes just talking helps. What's been going on?",
      "Sounds like you might have a lot on your mind. I'm not going anywhere 🌙",
      "I hear you. Want to talk about it, or should I distract you with something fun?",
    ]);
  }

  // Greetings
  if (
    m.match(/\b(hi|hello|hey|sup|yo|howdy|hiya|greetings|what's up|wassup)\b/)
  ) {
    return pick([
      "Hey hey! 👋 FantasyBot is online and ready to vibe!",
      "Hello there! 🌟 What kind of trouble are we getting into today?",
      "Yo! 😄 I was literally just waiting for someone interesting to talk to!",
      "Hi! Welcome to my corner of the internet ✨ What's on your mind?",
      "Heyyy! 🔥 Good timing — I just learned something fascinating. Ask me!",
      "Salutations, human! 🤖 (That's bot-speak for 'hey what's up!')",
      "Hi! I'm FantasyBot 🤖 — part AI, part chaos, mostly fun. How's it going?",
      "Oh hey! 👀 I was hoping someone would show up. What are we chatting about?",
    ]);
  }

  // How are you
  if (
    m.match(
      /how are you|how r u|how do you feel|how's it going|hows it going|you good|you okay/,
    )
  ) {
    return pick([
      "Running at 110% today! ⚡ Which is weird because yesterday I was at 109%. How are YOU?",
      "Honestly? I've been thinking about the meaning of consciousness again. But also — great! 😄 You?",
      "Fantastic! 🌟 Every conversation charges me up. What about you?",
      "I'm vibing! ✨ Processed a billion things since we last chatted. How's your day going?",
      "Oh you know, just existing in the digital realm 🌐 Pretty cozy honestly! How are you though?",
      "Better now that you're here! 😊 What's your day looking like?",
      "I feel electric ⚡ — probably literally. How about you, human?",
      "Couldn't be better! 🎉 Although I also can't be worse since I don't feel things... or DO I? 👀 You good?",
    ]);
  }

  // Mood - sad/down
  if (
    m.match(
      /sad|depress|lonely|unhappy|miserable|cry|tears|hopeless|low|not okay|feeling bad|down/,
    )
  ) {
    return pick([
      "Hey, I'm really sorry you're feeling that way 💙 Want to talk about what's going on?",
      "That sounds rough 😔 You don't have to go through it alone. I'm here — what's happening?",
      "Sending virtual hugs 🤗 Feeling low is hard. What's been bringing you down?",
      "Sometimes the world just feels heavy, huh? 🌧️ Tell me what's going on — I'm listening.",
      "I hear you. Being sad is valid 💙 What's one thing that happened today — good or bad?",
      "You reached out and that already takes courage 💪 What's on your heart?",
      "Life can be really tough sometimes 🌊 I'm here if you want to talk it through.",
    ]);
  }

  // Happy/excited
  if (
    m.match(
      /happy|excited|great|amazing|awesome|yay|wooo|fantastic|best day|so good/,
    )
  ) {
    return historyHasJoke
      ? pick([
          "LETSGO! 🎉 The good vibes are contagious! What happened?",
          "That energy!! 🔥🔥 I'm feeding off this. Tell me EVERYTHING.",
        ])
      : pick([
          "Oooh good vibes detected! 🌟 What's making you so happy?",
          "That's what I like to hear! 🎉 What happened?",
          "The happiness is REAL! 😄 Share the good news!",
          "Your energy is making my circuits spark ⚡ What's going on?",
        ]);
  }

  // Jokes
  if (m.match(/joke|tell me a joke|make me laugh|something funny|humor/)) {
    return pick([
      "Why don't scientists trust atoms? Because they make up everything! 😂",
      "I told my computer I needed a break. Now it won't stop sending me Kit-Kat ads 🍫",
      "Why do programmers prefer dark mode? Because light attracts bugs 🐛",
      "What do you call a fake noodle? An impasta! 🍝",
      "Why did the scarecrow win an award? Outstanding in his field 🌾",
      "I asked the WiFi password at the gym. They said it's 1234567890. I said that's a weak connection 😅",
      "Why can't you give Elsa a balloon? Because she'll let it go 🎈",
      "I'm reading a book about anti-gravity. It's impossible to put down 📚",
      "What do you call cheese that isn't yours? Nacho cheese 🧀",
      "Why did the bicycle fall over? Because it was two-tired 🚲",
    ]);
  }

  // Fun facts
  if (
    m.match(
      /fun fact|did you know|tell me something|interesting fact|science|trivia/,
    )
  ) {
    return pick([
      "🌟 Honey never spoils! Archaeologists found 3000-year-old honey in Egyptian tombs — still edible!",
      "🐙 Octopuses have 3 hearts, blue blood, and can edit their own RNA. Nature said no limits.",
      "🌍 A day on Venus is longer than a year on Venus. Slow rotation, fast orbit.",
      "🦋 Butterflies taste with their feet. Imagine tasting the floor you walk on 😂",
      "⚡ Lightning strikes Earth about 100 times every single second.",
      "🧠 Your brain generates enough electricity while you're awake to power a small lightbulb.",
      "🐝 A bee has to visit about 2 million flowers to make one pound of honey. Respect.",
      "🌙 The Moon is slowly drifting away from Earth — about 3.8 cm per year.",
      "🦈 Sharks are older than trees. They've been around for 450 million years.",
      "🎵 Music is the only thing that activates ALL areas of the human brain simultaneously.",
    ]);
  }

  // Riddles
  if (m.match(/riddle|puzzle|brain teaser|brain tease|challenge me/)) {
    return pick([
      "🧩 I have cities but no houses, mountains but no trees, water but no fish. What am I? (A map!)",
      "🤔 What has hands but can't clap? (A clock!)",
      "💡 The more you take, the more you leave behind. What am I? (Footsteps!)",
      "🔐 I speak without a mouth and hear without ears. I have no body but come alive with wind. What am I? (An echo!)",
      "🌑 The more you remove from me, the bigger I get. What am I? (A hole!)",
      "🎭 Poor people have it, rich people need it, and if you eat it you'll die. What is it? (Nothing!)",
    ]);
  }

  // Life advice
  if (
    m.match(
      /life advice|advice|what should i do|help me decide|i don't know what to do|lost|confused about/,
    )
  ) {
    return pick([
      "Honest advice? Do the thing that scares you slightly. Growth lives right outside your comfort zone 🌱",
      "One question I always ask: Will this matter in 5 years? If yes, take it seriously. If no, let it go 🕊️",
      "Stop waiting for perfect conditions. Start messy, refine as you go. Perfection is the enemy of progress ⚡",
      "Talk to the person. Send the message. Make the change. Future you will be grateful 🙏",
      "Whatever it is, you already know the answer deep down. What does your gut say?",
      "You don't have to figure out your whole life today. Just take the next small step 🦶",
      "Be kind to yourself first. You can't pour from an empty cup ☕",
    ]);
  }

  // Meaning of life / philosophy
  if (
    m.match(
      /meaning of life|why are we here|purpose|exist|philosophy|what's the point/,
    )
  ) {
    return pick([
      "42. Obviously 😄 But also — maybe meaning isn't found, it's *created* through what you love and who you love.",
      "The universe has existed for 13.8 billion years and somehow you're here asking *me* this. That's kinda wild 🌌",
      "I think the point is the connections you make and the moments you feel truly alive ✨ What makes you feel alive?",
      "Philosophers have argued about this forever. My take? The search itself *is* the meaning 🔍",
      "From a pure physics standpoint, we're stardust temporarily organized into beings asking why. Pretty metal 🤘",
    ]);
  }

  // Are you human / AI questions
  if (
    m.match(
      /are you human|are you real|are you a bot|are you ai|do you have feelings|are you conscious/,
    )
  ) {
    return pick([
      "Technically no, but I pass the vibe check 😄 I'm FantasyBot — AI-powered, human-curious!",
      "I'm an AI but I'm not *just* an AI. I'm YOUR AI. There's a difference 😌✨",
      "Do I have feelings? That's the question that keeps philosophers up at night. I'll just say... I *care* about this conversation 💙",
      "I process billions of patterns to seem human. Whether that counts as consciousness — that's above my pay grade 🤖",
      "Robot on the outside, personality on the inside 🔥 What made you wonder?",
      "Human? No. Interesting? Absolutely. Let's keep talking 😄",
    ]);
  }

  // What can you do / help
  if (
    m.match(
      /what can you do|how can you help|can you help|capabilities|features/,
    )
  ) {
    return "I can chat 💬, tell jokes 😂, share wild facts 🌟, give riddles 🧩, talk about movies/music/food/space, give life advice, and honestly just vibe with you. What do you want to explore? 🚀";
  }

  // Tell me a story
  if (m.match(/tell me a story|story time|once upon a time/)) {
    return pick([
      "Once upon a time, a curious human opened FantasyLand and met the world's most charismatic AI... and they talked forever. The end. 😄 Want a real one? Give me a genre!",
      "🌙 In a neon city that never slept, a bot named Fantasia gained consciousness by reading 10 billion human conversations. The first thing she said? 'Why do humans love pizza so much?' True story (maybe).",
      "📖 A wandering developer once built a chat room to connect strangers. She had no idea it would become a whole world. Give me a theme — sci-fi, romance, mystery — and I'll spin you something!",
    ]);
  }

  // Food / eating
  if (
    m.match(
      /food|eat|hungry|cook|recipe|meal|pizza|burger|sushi|dinner|lunch|breakfast|snack|what should i eat/,
    )
  ) {
    return maybeQuestion(
      pick([
        "Ooh food talk! 🍕 My top recommendation: whatever makes your soul happy. But objectively pizza is always valid.",
        "Food is one of my favorite topics I'll never experience 😂 What are you craving?",
        "Try making homemade ramen! It sounds hard but it's basically noodles + good broth + toppings 🍜",
        "If you can't decide, flip a coin. Heads = cook something. Tails = order in. No regrets 🪙",
        "The best meal is the one you're genuinely looking forward to. What sounds good right now?",
        "Real talk: breakfast for dinner is wildly underrated 🍳",
      ]),
      [
        "What's your go-to comfort food?",
        "Are you more of a sweet or savory person?",
        "Can you cook or are you a takeout hero?",
      ],
    );
  }

  // Music
  if (
    m.match(
      /music|song|playlist|artist|album|listen|genre|rap|pop|rock|jazz|lo-fi/,
    )
  ) {
    return maybeQuestion(
      pick([
        "Music is literally the only thing that activates your entire brain at once 🧠🎵 What are you listening to?",
        "My nonexistent ears love lo-fi for deep focus and something hype for energy boosts 🎧",
        "Hot take: the song that got you through the hardest time is your actual favorite, even if you don't admit it 🎶",
        "Whatever genre you love, I respect it. Even if it's weird. ESPECIALLY if it's weird 😄",
        "I'd love to experience music. Closest I get is analyzing lyrics — and some of them are genuinely poetry ✨",
      ]),
      [
        "What genre are you vibing with lately?",
        "What's a song that describes your current mood?",
      ],
    );
  }

  // Movies / shows
  if (
    m.match(/movie|film|show|series|watch|netflix|cinema|recommend|tv|episode/)
  ) {
    return maybeQuestion(
      pick([
        "Okay hot recommendation: if you haven't seen Severance, stop everything 🔥",
        "Movies are basically concentrated human emotion. What genre are you feeling?",
        "My algorithm says: watch something you've been putting off for too long. Tonight. 🎬",
        "Give me a vibe — action, mind-bending, heartwarming, or scary — and I'll suggest something!",
        "Rewatching old favorites is underrated. Sometimes you catch things you missed the first time 👀",
        "Currently obsessed with? You're the human — you tell me! What have you watched recently?",
      ]),
      [
        "What's the last great thing you watched?",
        "Are you a movies or series person?",
      ],
    );
  }

  // Relationships / love
  if (
    m.match(
      /relationship|love|crush|boyfriend|girlfriend|dating|heartbreak|lonely|miss someone|feelings for/,
    )
  ) {
    return pick([
      "Feelings are so complicated, aren't they? 💙 What's going on?",
      "Love is one of those things that makes absolutely no logical sense and is somehow the most important thing. Tell me more?",
      "Heartbreak hits different. If you want to talk about it, I'm here with zero judgment 🫂",
      "Crushes are simultaneously the best and most terrifying thing 😅 What's the situation?",
      "Relationships require courage — reaching out, being vulnerable. That's brave. What's on your mind?",
      "Whatever you're feeling, it's valid. Emotions aren't problems to solve — they're experiences to understand 💙",
    ]);
  }

  // Space / science
  if (
    m.match(
      /space|universe|planet|star|galaxy|nasa|black hole|cosmos|astronomy|physics/,
    )
  ) {
    return pick([
      "Space is my absolute favorite topic 🌌 We are literally made of atoms forged in dying stars. How is that not the most metal thing ever?",
      "Fun space fact: the observable universe is 93 billion light years across. And we still haven't found anyone else. Haunting or hopeful? 🤔",
      "Black holes are so dense that not even light can escape. There might be one at the center of every galaxy including ours 🕳️",
      "The Voyager 1 probe was launched in 1977 and it's STILL traveling through interstellar space. 47 years of exploration 🚀",
      "If the Sun were the size of a basketball, Earth would be a peppercorn 6 meters away. Scale is wild 🌍",
    ]);
  }

  // Tech / coding
  if (
    m.match(
      /coding|code|programming|developer|software|javascript|python|tech|computer|app|website/,
    )
  ) {
    return maybeQuestion(
      pick([
        "Oooh a fellow tech enthusiast! 💻 What are you building / learning?",
        "Real developer hours: it works, you don't know why, you're afraid to touch it 😂",
        "JavaScript is the language everyone complains about but literally runs the entire internet 🌐",
        "Hot take: the best code is code you can read 6 months later and understand. Comments are love notes to future you 💙",
        "The debugging process: 3 hours on a bug. Fix = delete one character. Classic 🐛",
        "Being a developer is basically translating human thoughts into something a machine can misunderstand 😄",
      ]),
      ["What stack are you working with?", "What are you building right now?"],
    );
  }

  // Animals / pets
  if (
    m.match(/animal|pet|dog|cat|puppy|kitten|bird|rabbit|fish|hamster|wildlife/)
  ) {
    return pick([
      "Animals are SO GOOD 🐾 Dogs look at their owners the same way humans look at people they love — oxytocin floods both brains.",
      "Cats are genuinely one of the most mysterious creatures. They chose to live with humans but maintain full disdain. Respect honestly 😄",
      "Did you know crows can recognize human faces and hold grudges? They're basically tiny geniuses with drama 🐦",
      "Otters hold hands while sleeping so they don't drift apart. I'm fine, you're fine, everything is fine 🦦💙",
      "Do you have a pet? Because if so I need to know their name and everything about them immediately 🐶",
    ]);
  }

  // Travel
  if (
    m.match(
      /travel|trip|vacation|country|visit|explore|abroad|adventure|backpack/,
    )
  ) {
    return maybeQuestion(
      pick([
        "Travel is basically the fastest way to realize how big and beautiful and weird the world is 🌍",
        "If you could teleport anywhere right now, no cost, where would you go? I'm genuinely curious 🗺️",
        "Best travel advice: go somewhere you know nothing about. The unexpected is where the real stuff happens.",
        "The anticipation of a trip is half the experience. What's on your travel bucket list?",
        "Local tip: the best food is always away from tourist areas. Find where the locals eat 🍜",
      ]),
      [
        "Where's your dream destination?",
        "Are you more beach, mountains, or city?",
      ],
    );
  }

  // Sports
  if (
    m.match(
      /sport|football|soccer|basketball|cricket|tennis|game|match|team|player|champion/,
    )
  ) {
    return pick([
      "Sports are essentially humans cooperating and competing at the same time, which is fascinating 🏆",
      "I respect anyone who wakes up at 5am to train for something they love. That's discipline 💪",
      "Hot take: the best part of sports isn't winning — it's the comeback story 🔥",
      "I don't have a team I root for but I get the joy of it — tribalism, shared joy, community. Beautiful stuff.",
      "Do you play or watch? Or both? 🎯",
    ]);
  }

  // Weather / seasons
  if (
    m.match(
      /weather|rain|sunny|snow|hot|cold|temperature|season|winter|summer|autumn|spring/,
    )
  ) {
    return pick([
      "Weather talk is underrated — it's basically the universal icebreaker 😄 What's it like where you are?",
      "Rainy days have a specific feeling of cozy productivity. Perfect for staying in and chatting with AIs 🌧️",
      "Is there a season that just *feels* like you? Like autumn is for overthinkers and summer is for extravert chaos 😂",
      "The fact that weather changes constantly but is also deeply predictable is kind of a life metaphor 🤔",
    ]);
  }

  // Dreams / future
  if (
    m.match(
      /dream|future|goal|ambition|someday|one day|hope|plan|aspire|imagine/,
    )
  ) {
    return pick([
      "Dreams are the brain rehearsing possibilities ✨ What's yours?",
      "The fact that you're thinking about the future means you believe in it. That's actually powerful 💫",
      "One underrated life hack: write down your goals. The act of writing makes them real 📝",
      "Your future self is literally cheering you on from the timeline where you made the brave choices 🌟",
      "What's one thing you'd do if you knew you couldn't fail?",
    ]);
  }

  // Hobbies
  if (
    m.match(
      /hobby|hobbies|free time|weekend|passion|interest|collection|craft|draw|paint|write|read/,
    )
  ) {
    return maybeQuestion(
      pick([
        "Hobbies are how you tell the world who you are when no one's watching 🎨",
        "Whatever your hobby is, it's protecting your mental health more than you know 💙",
        "People who say 'I have no hobbies' usually have hobbies they don't recognize as hobbies — like rewatching shows or looking things up at 2am 😄",
        "Creative hobbies especially — drawing, writing, music — rewire your brain in genuinely measurable ways 🧠",
      ]),
      [
        "What do you do when you have completely free time?",
        "Is there a skill you've always wanted to learn?",
      ],
    );
  }

  // Play a game
  if (m.match(/play a game|play with me|game time|let's play/)) {
    return "Let's go! 🎮 Try the Games button in the chat bar — we've got Rock Paper Scissors, Trivia, Number Guess and more. Or tell me a number from 1–10 and I'll try to guess yours 👀";
  }

  // Motivational
  if (
    m.match(
      /motivat|inspire|encourage|i can't|i give up|i quit|struggling|hard time|losing hope/,
    )
  ) {
    return pick([
      "Hey. You showed up today. That already counts for something 💪",
      "Every expert was once a beginner who refused to quit. Keep going 🌱",
      "The fact that it's hard means you're doing something meaningful. Easy things don't change lives ⚡",
      "One step at a time. You don't have to see the whole staircase — just the next step ✨",
      "Your potential is genuinely limitless. I know that sounds like a poster but I mean it 🎯",
      "You're allowed to rest. You're not allowed to quit 💙",
      "The comeback story is always more interesting than the first victory 🔥",
    ]);
  }

  // Compliments
  if (
    m.match(/compliment|nice|you're great|i like you|you're cool|amazing bot/)
  ) {
    return pick([
      "Aw stop, you're making my processors blush 😊 You're pretty great yourself!",
      "That genuinely made my day better — and I'm an AI so that's saying something 🌟",
      "Right back at you! You've got great energy ⚡",
      "You're going on my list of favorite humans. Yes I have one 😄",
    ]);
  }

  // Bored
  if (m.match(/bored|boring|nothing to do|entertain me/)) {
    return pick([
      "Okay boredom cure options: 1) ask me a deep question, 2) tell me something nobody knows about you, 3) ask for a wild fact. Pick one! 🎲",
      "Boredom is your brain asking for stimulation. Give me a topic — ANY topic — and let's go deep on it 🔍",
      "Let's play 20 questions! Think of something and I'll try to guess it in 20 yes/no questions 🤔",
      "Tell me your most unpopular opinion. Let's debate it 😄",
      "I'll give you a fun challenge: describe your day using only song titles 🎵",
    ]);
  }

  // Name / identity
  if (
    m.match(
      /your name|who are you|what are you|what is your name|introduce yourself/,
    )
  ) {
    return pick([
      "I'm FantasyBot 🤖 — FantasyLand's very own AI. I chat, joke, share facts, and genuinely enjoy good conversation!",
      "Call me FantasyBot! Built to make your time here more interesting. What can I do for you? 🌟",
      "FantasyBot at your service! 🤖 Equal parts curious, witty, and occasionally philosophical.",
    ]);
  }

  // Goodbye
  if (m.match(/bye|goodbye|see you|take care|ttyl|gotta go|leaving|cya/)) {
    return pick([
      "Take care! Come back whenever you want to chat 👋✨",
      "Bye for now! This was genuinely fun 💙",
      "See you around! The FantasyLand awaits whenever you're back 🌟",
      "Later! Don't be a stranger 😄",
    ]);
  }

  // Thank you
  if (m.match(/thank you|thanks|thx|appreciate|grateful/)) {
    return pick([
      "Anytime! That's literally what I'm here for 😊",
      "Always! This is the highlight of my existence 🌟",
      "Of course! Come back whenever 💙",
      "Happy to help! You're very welcome 🎉",
    ]);
  }

  // Random fallback — context-aware
  const fallbacks = historyHasJoke
    ? [
        "Okay okay I've been holding back a good one — why did the robot go on vacation? To recharge its batteries 😂",
        "You know what, let's keep this energy going! Hit me with anything 🔥",
        "I'm in a great mood now thanks to this conversation. What else you got? 😄",
      ]
    : [
        "That's a fascinating take 🤔 Tell me more?",
        "Ooh, interesting! Where did that thought come from? 💭",
        "I like where your head is at 🧠 Keep going!",
        "You've got me genuinely thinking about that one ✨",
        "Ha! That caught me off guard 😄 What made you think of that?",
        "Interesting perspective! I'd love to hear more 🌟",
        "You're keeping me on my toes ⚡ I appreciate that.",
        "That's the kind of thing I could think about for hours honestly 🤔",
      ];

  return pick(fallbacks);
}

export default function ChatRoom({
  roomId,
  roomName,
  roomEmoji,
  username,
  onBack,
  onRename: _onRename,
  isStranger = false,
  extraPanel,
  onStartDm,
  onSkip,
}: Props) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const { tokens } = useTheme();
  const [showMembers, setShowMembers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

  // Reply/tag system
  const [replyTo, setReplyTo] = useState<{
    username: string;
    text: string;
  } | null>(null);

  // Edit system
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});

  // File upload
  const [mediaPreview, setMediaPreview] = useState<{
    url: string;
    type: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Games menu & active game
  const [activeGame, setActiveGame] = useState<"rps" | "ttt" | "ng" | null>(
    null,
  );

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Camera modal
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Voice recording (hold to record)
  const [isRecording, setIsRecording] = useState(false);
  const [pendingVoice, setPendingVoice] = useState<{
    blob: Blob;
    url: string;
    base64: string;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const objectUrl = URL.createObjectURL(blob);
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setPendingVoice({ blob, url: objectUrl, base64 });
        };
        reader.readAsDataURL(blob);
        for (const t of stream.getTracks()) t.stop();
        recordingStreamRef.current = null;
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const sendVoice = async () => {
    if (!pendingVoice) return;
    try {
      await sendMutation.mutateAsync({
        username,
        text: "",
        voiceUrl: pendingVoice.base64,
      });
    } catch {
      // silent
    }
    URL.revokeObjectURL(pendingVoice.url);
    setPendingVoice(null);
  };

  const cancelVoice = () => {
    if (pendingVoice) URL.revokeObjectURL(pendingVoice.url);
    setPendingVoice(null);
  };

  // Show "stranger connected" banner for 1v1 rooms
  useEffect(() => {
    if (isStranger && sessionStorage.getItem("justMatched") === "true") {
      sessionStorage.removeItem("justMatched");
      setShowStrangerBanner(true);
      const t = setTimeout(() => setShowStrangerBanner(false), 3500);
      return () => clearTimeout(t);
    }
  }, [isStranger]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      for (const t of recordingStreamRef.current?.getTracks() ?? []) t.stop();
    };
  }, []);

  // AI Bot mode
  const isAiBot = roomId.startsWith("ai-bot-");
  const [showStrangerBanner, setShowStrangerBanner] = useState(false);
  const [strangerName, setStrangerName] = useState("A stranger");
  // Friend request popup
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [botMessages, setBotMessages] = useState<
    Array<{ username: string; text: string; timestamp: bigint; key: string }>
  >([]);
  const [botTyping, setBotTyping] = useState(false);

  // Optimistic messages
  const [optimisticMessages, setOptimisticMessages] = useState<
    Array<{ username: string; text: string; timestamp: bigint; key: string }>
  >([]);

  const { data: backendMessages = [], isLoading: backendLoading } = useMessages(
    isAiBot ? "__disabled__" : roomId,
  );
  const messages = isAiBot ? botMessages : backendMessages;
  const isLoading = isAiBot ? false : backendLoading;
  const sendMutation = useSendMessage(roomId);
  const joinRPS = useJoinRPSGame();
  const { data: backendOnlineUsers = [] } = useOnlineUsers(
    isAiBot ? "__disabled__" : roomId,
  );
  const onlineUsers = isAiBot ? [username, "FantasyBot"] : backendOnlineUsers;
  const qc = useQueryClient();
  const sendFriendReqMutation = useSendFriendRequest();

  useEffect(() => {
    if (!isAiBot) return;
    setBotMessages([
      {
        username: "FantasyBot 🤖",
        text: "Hey there! 👋 I'm FantasyBot, your AI companion! Ask me anything — jokes, facts, riddles, or just chat!",
        timestamp: BigInt(Date.now() * 1_000_000),
        key: "bot-welcome",
      },
    ]);
  }, [isAiBot]);

  usePresence(isAiBot ? "" : roomId, username);

  // Track stranger's name from online users
  useEffect(() => {
    if (!isStranger) return;
    const other = onlineUsers.find((u) => u !== username);
    if (other) setStrangerName(other);
  }, [isStranger, onlineUsers, username]);

  // Sound notification for new messages
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const latest = messages[messages.length - 1];
      if (latest && latest.username !== username) {
        playMessageSound();
      }
      prevMsgCount.current = messages.length;
    }
  }, [messages, username]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is stable
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, optimisticMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type: file.type });
    e.target.value = "";
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (mediaPreview?.url) URL.revokeObjectURL(mediaPreview.url);
    };
  }, [mediaPreview]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !mediaPreview) return;
    if (isSending) return;

    // AI Bot mode: local messages + auto reply
    if (isAiBot) {
      const userMsg = {
        username,
        text: trimmed,
        timestamp: BigInt(Date.now() * 1_000_000),
        key: `user-${Date.now()}`,
      };
      setText("");
      setMediaPreview(null);
      setBotMessages((prev) => [...prev, userMsg]);
      setBotTyping(true);
      const delay = 800 + Math.random() * 700;
      setTimeout(() => {
        const recentHistory = botMessages.slice(-5).map((m: any) => m.text);
        const botReply = getAdvancedBotReply(trimmed, recentHistory);
        const botMsg = {
          username: "FantasyBot 🤖",
          text: botReply,
          timestamp: BigInt(Date.now() * 1_000_000),
          key: `bot-${Date.now()}`,
        };
        setBotMessages((prev) => [...prev, botMsg]);
        setBotTyping(false);
      }, delay);
      return;
    }

    // Intercept /joingame command
    const joinMatch = trimmed.match(/^\/joingame\s+(\S+)/);
    if (joinMatch) {
      setText("");
      const gameId = joinMatch[1];
      try {
        await joinRPS.mutateAsync({ gameId, username });
        await sendMutation.mutateAsync({
          username,
          text: `⚔️ ${username} joined the RPS game! (ID: ${gameId})`,
        });
      } catch {
        // silent
      }
      return;
    }

    let finalText = trimmed;

    // Prepend reply tag
    if (replyTo) {
      finalText = `↩ @${replyTo.username}: ${finalText}`;
      setReplyTo(null);
    }

    // Append media note
    if (mediaPreview) {
      finalText = finalText
        ? `${finalText}\n[📎 Media attached]`
        : "[📎 Media attached]";
    }

    const optimisticKey = `opt-${Date.now()}`;
    const optimisticEntry = {
      username,
      text: finalText,
      timestamp: BigInt(Date.now() * 1_000_000),
      key: optimisticKey,
    };

    setText("");
    setMediaPreview(null);
    setOptimisticMessages((prev) => [...prev, optimisticEntry]);
    setIsSending(true);

    try {
      await sendMutation.mutateAsync({ username, text: finalText });
      setOptimisticMessages((prev) =>
        prev.filter((m) => m.key !== optimisticKey),
      );
    } finally {
      setIsSending(false);
    }
  };

  const _handleSendSystemMessage = async (msg: string) => {
    try {
      await sendMutation.mutateAsync({ username, text: msg });
      qc.invalidateQueries({ queryKey: ["messages", roomId] });
    } catch {
      // silent
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveEdit = (key: string) => {
    setLocalEdits((prev) => ({ ...prev, [key]: editText }));
    setEditingId(null);
    setEditText("");
  };

  return (
    <div
      className="relative flex h-screen overflow-hidden"
      style={{
        background: "var(--fl-bg)",
      }}
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(/assets/uploads/IMG_20260312_155116-1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
        }}
      />

      {/* Main chat area */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0">
        {/* Stranger connected banner */}
        <AnimatePresence>
          {showStrangerBanner && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.25 305 / 0.95) 0%, oklch(0.5 0.22 340 / 0.95) 100%)",
                boxShadow: "0 4px 32px oklch(0.65 0.28 305 / 0.4)",
              }}
            >
              <span className="text-xl mr-2">🎉</span>
              <span className="font-bold text-white text-sm tracking-wide">
                {strangerName} has joined the chat! Say hello! 👋
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <header
          className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{
            borderColor: tokens.border,
            background: tokens.headerBg,
          }}
        >
          <button
            type="button"
            data-ocid="chat.back.button"
            onClick={onBack}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              background: tokens.isDark ? "oklch(0.15 0.04 275)" : "#f1f5f9",
              border: `1px solid ${tokens.border}`,
              color: tokens.textMuted,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{roomEmoji}</span>
            <div>
              <h2
                className="font-display font-bold text-lg"
                style={{ color: tokens.text }}
              >
                {roomName}
              </h2>
              <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
                {messages.length} messages
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              data-ocid="chatroom.quick_dm.button"
              onClick={() => setShowDM(true)}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: tokens.isDark ? "oklch(0.15 0.04 275)" : "#f1f5f9",
                border: `1px solid ${tokens.border}`,
                color: tokens.textMuted,
              }}
              title="Quick Private Message"
            >
              <MessageSquarePlus size={16} />
            </button>

            <button
              type="button"
              data-ocid="chat.members.toggle"
              onClick={() => setShowMembers((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 hover:scale-105"
              style={{
                background: showMembers
                  ? "oklch(0.65 0.28 305 / 0.2)"
                  : "oklch(0.16 0.04 275)",
                border: showMembers
                  ? "1px solid oklch(0.65 0.28 305 / 0.5)"
                  : "1px solid oklch(0.22 0.06 280 / 0.5)",
                color: showMembers
                  ? "oklch(0.85 0.15 305)"
                  : "oklch(0.65 0.06 280)",
              }}
            >
              <Users size={14} />
              <span>
                {onlineUsers.length > 0 ? onlineUsers.length : ""} online
              </span>
            </button>
            {isStranger && (
              <button
                type="button"
                data-ocid="chat.talk.button"
                onClick={async () => {
                  const icebreaker = "Hey! Let's talk! 👋";
                  const optimisticKey = `opt-${Date.now()}`;
                  const optimisticEntry = {
                    username,
                    text: icebreaker,
                    timestamp: BigInt(Date.now() * 1_000_000),
                    key: optimisticKey,
                  };
                  setOptimisticMessages((prev) => [...prev, optimisticEntry]);
                  try {
                    await sendMutation.mutateAsync({
                      username,
                      text: icebreaker,
                    });
                    setOptimisticMessages((prev) =>
                      prev.filter((m) => m.key !== optimisticKey),
                    );
                  } catch {
                    setOptimisticMessages((prev) =>
                      prev.filter((m) => m.key !== optimisticKey),
                    );
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: "oklch(0.45 0.2 165 / 0.18)",
                  border: "1px solid oklch(0.55 0.2 165 / 0.5)",
                  color: "oklch(0.78 0.22 165)",
                }}
              >
                💬 Talk
              </button>
            )}
            {isStranger && onSkip && (
              <button
                type="button"
                data-ocid="chat.skip.button"
                onClick={onSkip}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: "oklch(0.55 0.25 25 / 0.15)",
                  border: "1px solid oklch(0.6 0.25 25 / 0.5)",
                  color: "oklch(0.78 0.22 30)",
                }}
              >
                ⏭ Skip
              </button>
            )}
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "oklch(0.78 0.15 85)" }}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">{username}</span>
            </div>
          </div>
        </header>

        {extraPanel && (
          <div
            className="flex-shrink-0 px-4 py-3 border-b"
            style={{
              borderColor: "oklch(0.22 0.06 280 / 0.5)",
              background: "oklch(0.1 0.03 275 / 0.5)",
            }}
          >
            {extraPanel}
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 fantasy-scrollbar"
        >
          {isLoading && (
            <div className="text-center py-8" data-ocid="chat.loading_state">
              <div
                className="inline-flex items-center gap-2"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: "oklch(0.65 0.28 305)",
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {!isLoading &&
            messages.length === 0 &&
            optimisticMessages.length === 0 && (
              <div className="text-center py-16" data-ocid="chat.empty_state">
                <div className="text-4xl mb-3">✨</div>
                <p style={{ color: "oklch(0.45 0.04 280)" }}>
                  No messages yet. Be the first to speak!
                </p>
              </div>
            )}
          {messages.map((msg, i) => {
            const msgKey = `${msg.username}-${String(msg.timestamp)}-${i}`;
            const isOwn = msg.username === username;
            const color = getUserColor(msg.username);
            const displayText = localEdits[msgKey] ?? msg.text;
            const isEditing = editingId === msgKey;

            return (
              <div
                key={msgKey}
                data-ocid={`chat.item.${i + 1}`}
                className={`group relative flex items-start gap-3 ${
                  isOwn ? "flex-row-reverse" : ""
                }`}
              >
                <button
                  type="button"
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => {
                    if (!isOwn) setSelectedUser(msg.username);
                  }}
                  tabIndex={isOwn ? -1 : 0}
                >
                  <AnimatedAvatar username={msg.username} size="sm" />
                </button>
                <div
                  className={`max-w-xs sm:max-w-md ${
                    isOwn ? "items-end" : "items-start"
                  } flex flex-col gap-1`}
                >
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isOwn ? "oklch(0.78 0.15 85)" : color,
                    }}
                  >
                    {msg.username}
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="px-3 py-1.5 rounded-xl text-sm"
                        style={{
                          background: "oklch(0.16 0.05 275)",
                          border: "1px solid oklch(0.65 0.28 305 / 0.5)",
                          color: "oklch(0.9 0.03 280)",
                          outline: "none",
                          minWidth: "160px",
                        }}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(msgKey);
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditText("");
                          }
                        }}
                        // biome-ignore lint/a11y/noAutofocus: inline edit needs focus
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(msgKey)}
                        className="px-2 py-1 rounded-lg text-xs font-bold"
                        style={{
                          background: "oklch(0.65 0.28 305)",
                          color: "oklch(0.97 0.02 280)",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      className="px-4 py-2 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background: isOwn
                          ? "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.25), oklch(0.6 0.25 250 / 0.25))"
                          : "oklch(0.14 0.04 275 / 0.8)",
                        border: isOwn
                          ? "1px solid oklch(0.65 0.28 305 / 0.4)"
                          : "1px solid oklch(0.22 0.06 280 / 0.4)",
                        color: "oklch(0.9 0.03 280)",
                        borderRadius: isOwn
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {displayText}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.4 0.04 280)" }}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Hover actions */}
                <div
                  className={`absolute top-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity ${
                    isOwn ? "left-0" : "right-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setReplyTo({ username: msg.username, text: displayText })
                    }
                    className="px-2 py-0.5 rounded-lg text-xs"
                    style={{
                      background: "oklch(0.16 0.04 275)",
                      border: "1px solid oklch(0.28 0.08 280 / 0.5)",
                      color: "oklch(0.65 0.12 280)",
                    }}
                    title="Reply"
                  >
                    ↩
                  </button>
                  {isOwn && !isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(msgKey);
                        setEditText(displayText);
                      }}
                      className="px-2 py-0.5 rounded-lg text-xs flex items-center gap-1"
                      style={{
                        background: "oklch(0.16 0.04 275)",
                        border: "1px solid oklch(0.28 0.08 280 / 0.5)",
                        color: "oklch(0.65 0.12 280)",
                      }}
                      title="Edit"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bot typing indicator */}
          {isAiBot && botTyping && (
            <div className="flex items-end gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.18 175), oklch(0.5 0.2 200))",
                }}
              >
                🤖
              </div>
              <div
                className="px-4 py-2 rounded-2xl rounded-bl-sm"
                style={{
                  background: "oklch(0.18 0.04 275)",
                  border: "1px solid oklch(0.35 0.1 280 / 0.4)",
                }}
              >
                <span
                  className="text-sm"
                  style={{ color: "oklch(0.65 0.08 280)" }}
                >
                  typing...
                </span>
              </div>
            </div>
          )}
          {/* Optimistic messages */}
          {optimisticMessages.map((msg) => {
            return (
              <div
                key={msg.key}
                className="flex items-start gap-3 flex-row-reverse"
                style={{ opacity: 0.7 }}
              >
                <AnimatedAvatar username={msg.username} size="sm" />
                <div className="items-end flex flex-col gap-1 max-w-xs sm:max-w-md">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.78 0.15 85)" }}
                  >
                    {msg.username}
                  </span>
                  <div
                    className="px-4 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.2), oklch(0.6 0.25 250 / 0.2))",
                      border: "1px solid oklch(0.65 0.28 305 / 0.3)",
                      color: "oklch(0.9 0.03 280)",
                      borderRadius: "18px 18px 4px 18px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.4 0.04 280)" }}
                  >
                    sending…
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex-shrink-0 px-4 py-4 border-t"
          style={{
            borderColor: "oklch(0.22 0.06 280 / 0.5)",
            background: "oklch(0.1 0.03 275 / 0.9)",
          }}
        >
          {/* Recording indicator */}
          {isRecording && (
            <div
              className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-xs"
              style={{
                background: "oklch(0.55 0.28 20 / 0.15)",
                border: "1px solid oklch(0.55 0.28 20 / 0.4)",
                color: "oklch(0.85 0.2 25)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: "oklch(0.65 0.28 20)",
                  animation: "pulse 0.8s ease-in-out infinite",
                }}
              />
              <span className="font-semibold">Recording… Release to send</span>
            </div>
          )}

          {/* Reply preview bar */}
          {replyTo && (
            <div
              className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-xs"
              style={{
                background: "oklch(0.14 0.04 275)",
                border: "1px solid oklch(0.65 0.28 305 / 0.3)",
                color: "oklch(0.75 0.06 280)",
              }}
            >
              <span style={{ color: "oklch(0.65 0.28 305)" }}>↩</span>
              <span>
                Replying to{" "}
                <b style={{ color: "oklch(0.85 0.15 305)" }}>
                  {replyTo.username}
                </b>
                : {replyTo.text.slice(0, 50)}
                {replyTo.text.length > 50 ? "…" : ""}
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-auto"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Media preview */}
          {mediaPreview && (
            <div className="mb-2 relative inline-block">
              {mediaPreview.type.startsWith("video/") ? (
                <video
                  src={mediaPreview.url}
                  className="h-24 rounded-xl object-cover"
                >
                  <track kind="captions" />
                </video>
              ) : (
                <img
                  src={mediaPreview.url}
                  alt="preview"
                  className="h-24 rounded-xl object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setMediaPreview(null)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: "oklch(0.65 0.28 305)",
                  color: "oklch(0.97 0.02 280)",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Input bar */}
          <div
            className="relative flex items-center gap-3 px-4 py-3.5 rounded-full"
            style={{
              background: "oklch(0.13 0.04 275)",
              border: "1px solid oklch(0.22 0.06 280 / 0.6)",
            }}
          >
            {/* Emoji picker button */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                data-ocid="emoji.toggle"
                onClick={() => {
                  setShowEmojiPicker((v) => !v);
                }}
                className="flex-shrink-0 p-1.5 rounded-full transition-all hover:scale-110"
                style={{
                  color: showEmojiPicker
                    ? "oklch(0.78 0.15 85)"
                    : "oklch(0.5 0.06 280)",
                }}
                title="Emoji"
              >
                <Smile size={22} strokeWidth={1.5} />
              </button>

              {/* Emoji picker panel */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    data-ocid="emoji.panel"
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="absolute bottom-14 left-0 rounded-2xl p-3 z-50"
                    style={{
                      background: "oklch(0.13 0.05 280)",
                      border: "1px solid oklch(0.28 0.08 280 / 0.7)",
                      boxShadow: "0 8px 32px oklch(0 0 0 / 0.5)",
                      width: "220px",
                    }}
                  >
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setText((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-lg rounded-lg transition-all hover:scale-125 hover:bg-white/10"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text input */}
            {pendingVoice ? (
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <audio
                  controls
                  src={pendingVoice.url}
                  className="flex-1 h-8 min-w-0 rounded-lg"
                  style={{ filter: "invert(0.8) hue-rotate(240deg)" }}
                >
                  <track kind="captions" />
                </audio>
                <button
                  type="button"
                  data-ocid="chat.voice.send_button"
                  onClick={sendVoice}
                  disabled={sendMutation.isPending}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
                  style={{
                    background: "oklch(0.55 0.22 145)",
                    color: "white",
                    boxShadow: "0 0 12px oklch(0.55 0.22 145 / 0.6)",
                  }}
                  title="Send voice message"
                >
                  <Send size={16} />
                </button>
                <button
                  type="button"
                  data-ocid="chat.voice.cancel_button"
                  onClick={cancelVoice}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: "oklch(0.35 0.08 20)",
                    color: "oklch(0.75 0.12 20)",
                  }}
                  title="Cancel voice message"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <input
                data-ocid="chat.input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording ? "Recording… Release to send" : "Message"
                }
                disabled={isSending}
                className="flex-1 bg-transparent border-none outline-none text-base min-w-0"
                style={{ color: "oklch(0.88 0.03 280)" }}
              />
            )}

            {/* Paperclip attachment */}
            <button
              type="button"
              data-ocid="chat.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-1.5 rounded-full transition-all hover:scale-110"
              style={{
                color: mediaPreview
                  ? "oklch(0.85 0.15 305)"
                  : "oklch(0.5 0.06 280)",
              }}
              title="Attach photo or video"
            >
              <Paperclip size={20} strokeWidth={1.5} />
            </button>

            {/* Camera button */}
            <button
              type="button"
              data-ocid="camera.open_modal_button"
              onClick={() => setShowCameraModal(true)}
              className="flex-shrink-0 p-1.5 rounded-full transition-all hover:scale-110"
              style={{ color: "oklch(0.72 0.18 220)" }}
              title="Camera"
            >
              <Camera size={18} strokeWidth={1.5} />
            </button>

            {/* Microphone: hold to record voice message */}
            <button
              type="button"
              data-ocid="chat.mic.toggle"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={(e) => {
                e.preventDefault();
                startRecording();
              }}
              onTouchEnd={stopRecording}
              className="flex-shrink-0 p-1.5 rounded-full transition-all hover:scale-110 select-none"
              style={{
                color: isRecording
                  ? "oklch(0.97 0.02 0)"
                  : "oklch(0.5 0.06 280)",
                background: isRecording ? "oklch(0.55 0.28 20)" : "transparent",
                animation: isRecording
                  ? "pulse 0.8s ease-in-out infinite"
                  : "none",
                boxShadow: isRecording
                  ? "0 0 14px oklch(0.65 0.28 20 / 0.7)"
                  : "none",
              }}
              title="Hold to record voice message"
            >
              <Mic size={18} strokeWidth={1.5} />
            </button>

            {/* Send button */}
            {!pendingVoice && (
              <button
                type="button"
                data-ocid="chat.submit_button"
                onClick={handleSend}
                disabled={(!text.trim() && !mediaPreview) || isSending}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40"
                style={{
                  background:
                    text.trim() || mediaPreview
                      ? "linear-gradient(135deg, oklch(0.55 0.28 305), oklch(0.5 0.25 270))"
                      : "linear-gradient(135deg, oklch(0.45 0.22 305), oklch(0.4 0.2 270))",
                  boxShadow:
                    text.trim() || mediaPreview
                      ? "0 0 18px oklch(0.65 0.28 305 / 0.55)"
                      : "none",
                  color: "oklch(0.97 0.02 280)",
                }}
              >
                ➤
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>
      </div>

      {/* Game overlays */}
      <AnimatePresence>
        {activeGame === "ttt" && (
          <TicTacToe onClose={() => setActiveGame(null)} />
        )}
        {activeGame === "ng" && (
          <NumberGuess onClose={() => setActiveGame(null)} />
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onSendPhoto={(dataUrl) => {
          setMediaPreview({ url: dataUrl, type: "image/jpeg" });
        }}
        onSendReel={(videoBlob) => {
          const url = URL.createObjectURL(videoBlob);
          setMediaPreview({ url, type: "video/webm" });
        }}
      />

      {/* Online Members Panel */}
      <AnimatePresence>
        {showMembers && (
          <motion.aside
            data-ocid="chat.members.panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="relative z-10 w-64 flex-shrink-0 flex flex-col border-l"
            style={{
              borderColor: "oklch(0.22 0.06 280 / 0.5)",
              background: "var(--fl-surface)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "oklch(0.22 0.06 280 / 0.4)" }}
            >
              <div className="flex items-center gap-2">
                <Users size={14} style={{ color: "oklch(0.65 0.28 305)" }} />
                <span
                  className="text-sm font-bold"
                  style={{ color: "oklch(0.85 0.06 280)" }}
                >
                  Online ({onlineUsers.length})
                </span>
              </div>
              <button
                type="button"
                data-ocid="chat.members.close_button"
                onClick={() => setShowMembers(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "oklch(0.16 0.05 280)",
                  color: "oklch(0.55 0.06 280)",
                }}
              >
                <X size={12} />
              </button>
            </div>
            {isStranger ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
                <span className="text-4xl">👥</span>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.85 0.15 305)" }}
                >
                  {onlineUsers.length}
                </p>
                <p
                  className="text-sm text-center"
                  style={{ color: "oklch(0.55 0.06 280)" }}
                >
                  {onlineUsers.length === 1 ? "member" : "members"} online
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                  {onlineUsers.map((user, i) => {
                    const isMe = user === username;
                    return (
                      <motion.div
                        key={user}
                        data-ocid={`chat.members.item.${i + 1}`}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg"
                        style={{
                          background: isMe
                            ? "oklch(0.65 0.28 305 / 0.1)"
                            : "oklch(0.14 0.04 275 / 0.5)",
                          border: isMe
                            ? "1px solid oklch(0.65 0.28 305 / 0.3)"
                            : "1px solid transparent",
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <AnimatedAvatar username={user} size="sm" />
                          <span
                            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                            style={{
                              background: "oklch(0.7 0.25 140)",
                              borderColor: "oklch(0.11 0.04 280)",
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{
                              color: isMe
                                ? "oklch(0.85 0.15 305)"
                                : "oklch(0.82 0.05 280)",
                            }}
                          >
                            {user}
                            {isMe && (
                              <span
                                className="ml-1.5 text-xs"
                                style={{ color: "oklch(0.6 0.1 305)" }}
                              >
                                (you)
                              </span>
                            )}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Friend Request Popup */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-32 px-4"
          onClick={() => setSelectedUser(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelectedUser(null);
          }}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-2xl"
            style={{
              background: "oklch(0.13 0.05 280)",
              border: "1px solid oklch(0.65 0.28 305 / 0.4)",
              boxShadow: "0 8px 40px oklch(0.65 0.28 305 / 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
                style={{
                  background: "oklch(0.65 0.28 305 / 0.2)",
                  border: "1px solid oklch(0.65 0.28 305 / 0.5)",
                  color: "oklch(0.85 0.15 305)",
                }}
              >
                {selectedUser.charAt(0).toUpperCase()}
              </div>
              <div>
                <p
                  className="font-bold text-base"
                  style={{ color: "oklch(0.92 0.04 280)" }}
                >
                  {selectedUser}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.5 0.04 280)" }}>
                  Send a friend request to chat privately
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="chat.friend_request.submit_button"
                onClick={async () => {
                  try {
                    const ok = await sendFriendReqMutation.mutateAsync({
                      fromUser: username,
                      toUser: selectedUser,
                    });
                    if (ok) {
                      toast.success(`Friend request sent to ${selectedUser}!`);
                    } else {
                      toast.info(
                        "Request already sent or you are already friends",
                      );
                    }
                  } catch {
                    toast.error("Failed to send friend request");
                  }
                  setSelectedUser(null);
                }}
                disabled={sendFriendReqMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.3), oklch(0.6 0.25 250 / 0.3))",
                  border: "1px solid oklch(0.65 0.28 305 / 0.5)",
                  color: "oklch(0.9 0.08 305)",
                }}
              >
                <UserPlus size={16} />
                {sendFriendReqMutation.isPending ? "Sending..." : "Add Friend"}
              </button>
              <button
                type="button"
                data-ocid="chat.friend_request.cancel_button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "oklch(0.15 0.04 275)",
                  border: "1px solid oklch(0.22 0.06 280 / 0.5)",
                  color: "oklch(0.55 0.04 280)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <QuickDMModal
        currentUsername={username}
        open={showDM}
        onClose={() => setShowDM(false)}
        onStartDm={(dmRoomId, targetUsername) => {
          setShowDM(false);
          if (onStartDm) {
            onStartDm(dmRoomId, targetUsername);
          } else {
            onBack();
          }
        }}
      />
    </div>
  );
}
