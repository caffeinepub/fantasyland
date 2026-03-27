import {
  ArrowLeft,
  Check,
  Gamepad2,
  Shuffle,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  usePendingChallenges,
  useRespondToChallenge,
} from "../hooks/useQueries";
import { getLeaderboard, saveScore } from "../lib/gameScores";
import AnimatedAvatar from "./AnimatedAvatar";
import NewRecordPopup from "./NewRecordPopup";
import NumberGuess from "./NumberGuess";
import RPSGame from "./RPSGame";
import TicTacToe from "./TicTacToe";
import UsernameTopBar from "./UsernameTopBar";

interface Props {
  username: string;
  onRename: () => void;
  onBack: () => void;
}

type GameTab = "rps" | "ttt" | "ng" | "ws" | "trivia" | "duel";

const TABS: { id: GameTab; label: string; emoji: string }[] = [
  { id: "rps", label: "Rock Paper Scissors", emoji: "✊" },
  { id: "ttt", label: "Tic Tac Toe", emoji: "⬜" },
  { id: "ng", label: "Number Guess", emoji: "🔢" },
  { id: "ws", label: "Word Scramble", emoji: "🔤" },
  { id: "trivia", label: "Trivia Quiz", emoji: "🧠" },
  { id: "duel", label: "1v1 Duel", emoji: "⚔️" },
];

// ─── Word Scramble ────────────────────────────────────────────────────────────
const WORDS = [
  "GALAXY",
  "PHANTOM",
  "CRYSTAL",
  "DRAGON",
  "THUNDER",
  "JUNGLE",
  "WIZARD",
  "SAFARI",
  "NEON",
  "ROCKET",
  "BLIZZARD",
  "COSMIC",
  "PORTAL",
  "VORTEX",
  "EMBER",
  "CIPHER",
  "SPHINX",
  "MIRAGE",
  "ZENITH",
  "QUASAR",
];

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Make sure it's actually scrambled
  if (arr.join("") === word && word.length > 1) return scramble(word);
  return arr.join("");
}

function WordScramble({
  username = "Guest",
  uid = "",
}: { username?: string; uid?: string }) {
  const [wordIndex, setWordIndex] = useState(() =>
    Math.floor(Math.random() * WORDS.length),
  );
  const [scrambled, setScrambled] = useState(() => scramble(WORDS[0]));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [wsNewRecord, setWsNewRecord] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentWord = WORDS[wordIndex];

  useEffect(() => {
    setScrambled(scramble(WORDS[wordIndex]));
  }, [wordIndex]);

  useEffect(() => {
    if (gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [gameOver]);

  function nextWord() {
    const next = Math.floor(Math.random() * WORDS.length);
    setWordIndex(next);
    setInput("");
    setFeedback(null);
  }

  function handleGuess() {
    if (input.toUpperCase() === currentWord) {
      setScore((s) => s + 10);
      setStreak((s) => s + 1);
      setFeedback("correct");
      setTimeout(nextWord, 800);
    } else {
      setStreak(0);
      setFeedback("wrong");
    }
    setInput("");
  }

  // Save score on game over
  const wsScoreRef = useRef(score);
  wsScoreRef.current = score;
  const wsUsernameRef = useRef(username);
  wsUsernameRef.current = username;
  const wsUidRef = useRef(uid);
  wsUidRef.current = uid;
  useEffect(() => {
    if (gameOver && wsScoreRef.current > 0) {
      const isNew = saveScore(
        wsUidRef.current || wsUsernameRef.current,
        wsUsernameRef.current,
        "Word Scramble",
        wsScoreRef.current,
      );
      if (isNew) setWsNewRecord(true);
    }
  }, [gameOver]);

  function restart() {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setGameOver(false);
    setWsNewRecord(false);
    setFeedback(null);
    nextWord();
  }

  return (
    <>
      <NewRecordPopup
        show={wsNewRecord}
        score={score}
        gameName="Word Scramble"
        onDismiss={() => setWsNewRecord(false)}
      />
      <div
        className="w-full rounded-2xl p-6"
        style={{
          background: "oklch(0.12 0.035 275)",
          border: "1px solid oklch(0.22 0.06 280 / 0.5)",
        }}
      >
        {gameOver ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2
              className="text-3xl font-black mb-2"
              style={{ color: "oklch(0.85 0.22 55)" }}
            >
              Time's Up!
            </h2>
            <p style={{ color: "oklch(0.7 0.06 280)" }}>
              Final Score: <span className="font-bold text-white">{score}</span>
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-6 px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))",
                color: "white",
                boxShadow: "0 0 20px oklch(0.65 0.22 50 / 0.4)",
              }}
            >
              Play Again
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <div
                  className="px-3 py-1.5 rounded-lg text-sm font-bold"
                  style={{
                    background: "oklch(0.65 0.22 50 / 0.15)",
                    color: "oklch(0.78 0.2 55)",
                    border: "1px solid oklch(0.65 0.22 50 / 0.3)",
                  }}
                >
                  🏆 {score} pts
                </div>
                {streak >= 2 && (
                  <div
                    className="px-3 py-1.5 rounded-lg text-sm font-bold"
                    style={{
                      background: "oklch(0.6 0.25 30 / 0.15)",
                      color: "oklch(0.78 0.25 35)",
                      border: "1px solid oklch(0.6 0.25 30 / 0.3)",
                    }}
                  >
                    🔥 x{streak}
                  </div>
                )}
              </div>
              <div
                className="px-3 py-1.5 rounded-lg text-sm font-bold"
                style={{
                  background:
                    timeLeft <= 10
                      ? "oklch(0.5 0.2 20 / 0.3)"
                      : "oklch(0.22 0.06 280 / 0.5)",
                  color:
                    timeLeft <= 10
                      ? "oklch(0.75 0.2 25)"
                      : "oklch(0.7 0.06 280)",
                  border: `1px solid ${timeLeft <= 10 ? "oklch(0.5 0.2 20 / 0.4)" : "oklch(0.3 0.06 280 / 0.4)"}`,
                }}
              >
                ⏱ {timeLeft}s
              </div>
            </div>

            <div className="text-center mb-8">
              <p
                className="text-xs uppercase tracking-widest mb-3"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                Unscramble this word
              </p>
              <div
                className="text-5xl font-black tracking-widest py-6 rounded-2xl"
                style={{
                  background: "oklch(0.09 0.03 280)",
                  color: "oklch(0.92 0.04 280)",
                  letterSpacing: "0.4em",
                }}
              >
                {scrambled}
              </div>
            </div>

            {feedback && (
              <div
                className="text-center text-sm font-bold mb-4 py-2 rounded-lg"
                style={{
                  background:
                    feedback === "correct"
                      ? "oklch(0.5 0.2 145 / 0.2)"
                      : "oklch(0.5 0.2 20 / 0.2)",
                  color:
                    feedback === "correct"
                      ? "oklch(0.75 0.2 150)"
                      : "oklch(0.75 0.2 25)",
                }}
              >
                {feedback === "correct"
                  ? "✅ Correct! +10 pts"
                  : "❌ Try again!"}
              </div>
            )}

            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                placeholder="Type your answer..."
                className="flex-1 px-4 py-3 rounded-xl outline-none text-white font-bold uppercase"
                style={{
                  background: "oklch(0.09 0.03 280)",
                  border: "2px solid oklch(0.22 0.06 280 / 0.5)",
                }}
                data-ocid="wordscramble.input"
              />
              <button
                type="button"
                onClick={handleGuess}
                className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))",
                  color: "white",
                  boxShadow: "0 0 16px oklch(0.65 0.22 50 / 0.4)",
                }}
                data-ocid="wordscramble.submit_button"
              >
                Guess
              </button>
            </div>

            <button
              type="button"
              onClick={nextWord}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{
                background: "oklch(0.22 0.06 280 / 0.3)",
                color: "oklch(0.6 0.06 280)",
                border: "1px solid oklch(0.22 0.06 280 / 0.4)",
              }}
              data-ocid="wordscramble.secondary_button"
            >
              Skip → Next Word
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ─── Trivia Quiz ──────────────────────────────────────────────────────────────
const TRIVIA_QUESTIONS = [
  {
    q: "What planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: 1,
  },
  {
    q: "Which movie features the line 'I'll be back'?",
    options: ["RoboCop", "Total Recall", "The Terminator", "Predator"],
    answer: 2,
  },
  {
    q: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    answer: 1,
  },
  {
    q: "What is the fastest land animal?",
    options: ["Lion", "Leopard", "Cheetah", "Greyhound"],
    answer: 2,
  },
  {
    q: "Which element has the symbol 'Au'?",
    options: ["Silver", "Copper", "Gold", "Aluminum"],
    answer: 2,
  },
  {
    q: "In which year did the Titanic sink?",
    options: ["1905", "1912", "1918", "1923"],
    answer: 1,
  },
  {
    q: "Who painted the Mona Lisa?",
    options: ["Van Gogh", "Rembrandt", "Picasso", "Leonardo da Vinci"],
    answer: 3,
  },
  {
    q: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
    answer: 2,
  },
  {
    q: "How many strings does a standard guitar have?",
    options: ["4", "5", "6", "7"],
    answer: 2,
  },
  {
    q: "Which planet is the largest in our solar system?",
    options: ["Saturn", "Neptune", "Uranus", "Jupiter"],
    answer: 3,
  },
];

function TriviaQuiz({
  username = "Guest",
  uid = "",
}: { username?: string; uid?: string }) {
  const [current, setCurrent] = useState(0);
  const [questionKey, setQuestionKey] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [finished, setFinished] = useState(false);
  const [triviaNewRecord, setTriviaNewRecord] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentRef = useRef(0);

  const advanceRef = useRef(() => {});

  useEffect(() => {
    advanceRef.current = () => {
      clearInterval(timerRef.current!);
      if (currentRef.current + 1 >= TRIVIA_QUESTIONS.length) {
        setFinished(true);
      } else {
        currentRef.current += 1;
        setCurrent(currentRef.current);
        setQuestionKey((k) => k + 1);
      }
    };
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: questionKey is a reset trigger only
  useEffect(() => {
    if (finished) return;
    setTimeLeft(30);
    setSelected(null);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          advanceRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [questionKey, finished]);

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === TRIVIA_QUESTIONS[current].answer) {
      setScore((s) => s + 1);
    }
    clearInterval(timerRef.current!);
    setTimeout(() => advanceRef.current(), 1000);
  }

  function restart() {
    currentRef.current = 0;
    setCurrent(0);
    setQuestionKey((k) => k + 1);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  const q = TRIVIA_QUESTIONS[current];
  const progress = (current / TRIVIA_QUESTIONS.length) * 100;

  // Save score on finish
  const trivScoreRef = useRef(score);
  trivScoreRef.current = score;
  const trivUsernameRef = useRef(username);
  trivUsernameRef.current = username;
  const trivUidRef = useRef(uid);
  trivUidRef.current = uid;
  useEffect(() => {
    if (finished && trivScoreRef.current > 0) {
      const isNew = saveScore(
        trivUidRef.current || trivUsernameRef.current,
        trivUsernameRef.current,
        "Trivia Quiz",
        trivScoreRef.current,
      );
      if (isNew) setTriviaNewRecord(true);
    }
  }, [finished]);

  if (finished) {
    const emoji = score >= 8 ? "🏆" : score >= 5 ? "🎯" : "💪";
    return (
      <>
        <NewRecordPopup
          show={triviaNewRecord}
          score={score}
          gameName="Trivia Quiz"
          onDismiss={() => setTriviaNewRecord(false)}
        />
        <div
          className="w-full rounded-2xl p-8 text-center"
          style={{
            background: "oklch(0.12 0.035 275)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
          }}
        >
          <div className="text-6xl mb-4">{emoji}</div>
          <h2
            className="text-3xl font-black mb-2"
            style={{ color: "oklch(0.85 0.22 55)" }}
          >
            Quiz Complete!
          </h2>
          <p className="text-lg mb-1" style={{ color: "oklch(0.7 0.06 280)" }}>
            You scored
          </p>
          <p
            className="text-5xl font-black mb-6"
            style={{ color: "oklch(0.88 0.22 80)" }}
          >
            {score} / {TRIVIA_QUESTIONS.length}
          </p>
          <button
            type="button"
            onClick={restart}
            className="px-8 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))",
              color: "white",
              boxShadow: "0 0 20px oklch(0.65 0.22 50 / 0.4)",
            }}
            data-ocid="trivia.primary_button"
          >
            Play Again
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      className="w-full rounded-2xl p-6"
      style={{
        background: "oklch(0.12 0.035 275)",
        border: "1px solid oklch(0.22 0.06 280 / 0.5)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span
          className="text-sm font-bold"
          style={{ color: "oklch(0.6 0.06 280)" }}
        >
          Q {current + 1} / {TRIVIA_QUESTIONS.length}
        </span>
        <div
          className="px-3 py-1 rounded-lg text-sm font-bold"
          style={{
            background:
              timeLeft <= 10
                ? "oklch(0.5 0.2 20 / 0.3)"
                : "oklch(0.22 0.06 280 / 0.5)",
            color:
              timeLeft <= 10 ? "oklch(0.75 0.2 25)" : "oklch(0.7 0.06 280)",
          }}
        >
          ⏱ {timeLeft}s
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 rounded-full mb-6 overflow-hidden"
        style={{ background: "oklch(0.18 0.04 280)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))",
          }}
        />
      </div>

      {/* Question */}
      <h3
        className="text-lg font-black mb-6 leading-snug"
        style={{ color: "oklch(0.92 0.04 280)" }}
      >
        {q.q}
      </h3>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        {q.options.map((opt, idx) => {
          let bg = "oklch(0.16 0.04 280)";
          let border = "oklch(0.22 0.06 280 / 0.5)";
          let color = "oklch(0.8 0.06 280)";
          if (selected !== null) {
            if (idx === q.answer) {
              bg = "oklch(0.4 0.18 145 / 0.3)";
              border = "oklch(0.5 0.2 145 / 0.6)";
              color = "oklch(0.8 0.2 150)";
            } else if (idx === selected) {
              bg = "oklch(0.4 0.18 20 / 0.3)";
              border = "oklch(0.5 0.2 20 / 0.6)";
              color = "oklch(0.75 0.2 25)";
            }
          }
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleAnswer(idx)}
              className="w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all hover:scale-[1.01]"
              style={{
                background: bg,
                border: `2px solid ${border}`,
                color,
              }}
              data-ocid={`trivia.option.${idx + 1}`}
            >
              {String.fromCharCode(65 + idx)}. {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 1v1 Duel ─────────────────────────────────────────────────────────────────
const OPPONENT_NAMES = [
  "Phantom",
  "Ghost",
  "Neon",
  "Shadow",
  "Viper",
  "Blaze",
  "Storm",
  "Cipher",
  "Nova",
  "Wraith",
];

const RPS_CHOICES = ["✊ Rock", "✋ Paper", "✌️ Scissors"] as const;
const RPS_VALUES = ["Rock", "Paper", "Scissors"] as const;

function getRPSResult(player: number, opp: number): "win" | "lose" | "draw" {
  if (player === opp) return "draw";
  if (
    (player === 0 && opp === 2) ||
    (player === 1 && opp === 0) ||
    (player === 2 && opp === 1)
  )
    return "win";
  return "lose";
}

function DuelGame() {
  const [phase, setPhase] = useState<
    "pick_game" | "rps_play" | "ttt_play" | "result"
  >("pick_game");
  const [opponent] = useState(
    () =>
      MATCH_OPPONENT_NAMES[
        Math.floor(Math.random() * MATCH_OPPONENT_NAMES.length)
      ],
  );
  const [rpsPlayerChoice, setRpsPlayerChoice] = useState<number | null>(null);
  const [rpsOppChoice, setRpsOppChoice] = useState<number | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [waitingForOpp, setWaitingForOpp] = useState(false);
  const [confetti, setConfetti] = useState(false);

  function playRPS(idx: number) {
    setRpsPlayerChoice(idx);
    setWaitingForOpp(true);
    setTimeout(() => {
      const oppChoice = Math.floor(Math.random() * 3);
      setRpsOppChoice(oppChoice);
      const r = getRPSResult(idx, oppChoice);
      setResult(r);
      setWaitingForOpp(false);
      setPhase("result");
      if (r === "win") setConfetti(true);
    }, 1200);
  }

  function randomMatch() {
    const games = ["rps_play", "ttt_play"] as const;
    const picked = games[Math.floor(Math.random() * games.length)];
    setPhase(picked);
    setRpsPlayerChoice(null);
    setRpsOppChoice(null);
    setResult(null);
    setConfetti(false);
  }

  function resetDuel() {
    setPhase("pick_game");
    setRpsPlayerChoice(null);
    setRpsOppChoice(null);
    setResult(null);
    setConfetti(false);
  }

  const boxStyle = {
    background: "oklch(0.12 0.035 275)",
    border: "1px solid oklch(0.22 0.06 280 / 0.5)",
  };

  // Confetti overlay
  const ConfettiOverlay = confetti ? (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: confetti items are purely decorative
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 10 + 6}px`,
            height: `${Math.random() * 10 + 6}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * -20}%`,
            background: [
              "oklch(0.65 0.22 50)",
              "oklch(0.75 0.25 300)",
              "oklch(0.7 0.25 150)",
              "oklch(0.8 0.2 80)",
              "oklch(0.6 0.3 20)",
            ][i % 5],
            animation: `fall ${Math.random() * 2 + 1}s linear forwards`,
            animationDelay: `${Math.random() * 0.8}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  ) : null;

  if (phase === "pick_game") {
    return (
      <div className="w-full rounded-2xl p-6" style={boxStyle}>
        {ConfettiOverlay}
        {/* Opponent card */}
        <div
          className="flex items-center gap-4 p-4 rounded-2xl mb-6"
          style={{
            background: "oklch(0.09 0.03 280)",
            border: "1px solid oklch(0.65 0.22 300 / 0.3)",
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.25 300), oklch(0.5 0.28 320))",
              boxShadow: "0 0 20px oklch(0.55 0.25 300 / 0.5)",
            }}
          >
            {opponent[0]}
          </div>
          <div>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "oklch(0.55 0.06 280)" }}
            >
              Opponent Found!
            </p>
            <p
              className="text-xl font-black"
              style={{ color: "oklch(0.9 0.04 280)" }}
            >
              {opponent}
            </p>
          </div>
          <div className="ml-auto">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: "oklch(0.65 0.2 150)",
                boxShadow: "0 0 8px oklch(0.65 0.2 150)",
                animation: "pulse 1.5s infinite",
              }}
            />
          </div>
        </div>

        <h3
          className="text-center font-black mb-5"
          style={{ color: "oklch(0.75 0.06 280)" }}
        >
          Choose Your Battle
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            type="button"
            onClick={() => setPhase("rps_play")}
            className="p-5 rounded-2xl font-bold text-center transition-all hover:scale-105"
            style={{
              background: "oklch(0.55 0.25 300 / 0.15)",
              border: "2px solid oklch(0.55 0.25 300 / 0.4)",
              color: "oklch(0.8 0.2 300)",
              boxShadow: "0 0 20px oklch(0.55 0.25 300 / 0.1)",
            }}
            data-ocid="duel.rps.button"
          >
            <div className="text-3xl mb-2">✊</div>
            Rock Paper Scissors
          </button>
          <button
            type="button"
            onClick={() => setPhase("ttt_play")}
            className="p-5 rounded-2xl font-bold text-center transition-all hover:scale-105"
            style={{
              background: "oklch(0.65 0.22 50 / 0.15)",
              border: "2px solid oklch(0.65 0.22 50 / 0.4)",
              color: "oklch(0.78 0.2 55)",
              boxShadow: "0 0 20px oklch(0.65 0.22 50 / 0.1)",
            }}
            data-ocid="duel.ttt.button"
          >
            <div className="text-3xl mb-2">⬜</div>
            Tic Tac Toe
          </button>
        </div>

        <button
          type="button"
          onClick={randomMatch}
          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.5 0.28 320), oklch(0.55 0.25 300))",
            color: "white",
            boxShadow: "0 0 20px oklch(0.5 0.28 320 / 0.4)",
          }}
          data-ocid="duel.random.button"
        >
          <Shuffle size={16} />
          Random Match
        </button>
      </div>
    );
  }

  if (phase === "rps_play") {
    return (
      <div className="w-full rounded-2xl p-6" style={boxStyle}>
        {/* VS Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mx-auto mb-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))",
              }}
            >
              Y
            </div>
            <p className="text-xs" style={{ color: "oklch(0.7 0.06 280)" }}>
              You
            </p>
          </div>
          <div
            className="text-2xl font-black"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.55 0.25 300))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            VS
          </div>
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mx-auto mb-1"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.25 300), oklch(0.5 0.28 320))",
              }}
            >
              {opponent[0]}
            </div>
            <p className="text-xs" style={{ color: "oklch(0.7 0.06 280)" }}>
              {opponent}
            </p>
          </div>
        </div>

        {waitingForOpp ? (
          <div className="text-center py-8">
            <div
              className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4"
              style={{
                borderColor: "oklch(0.65 0.22 50 / 0.3)",
                borderTopColor: "oklch(0.65 0.22 50)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "oklch(0.65 0.06 280)" }}>
              Waiting for {opponent}...
            </p>
            <style>
              {"@keyframes spin { to { transform: rotate(360deg); } }"}
            </style>
          </div>
        ) : (
          <>
            <p
              className="text-center text-sm font-bold mb-4"
              style={{ color: "oklch(0.65 0.06 280)" }}
            >
              Choose your move!
            </p>
            <div className="grid grid-cols-3 gap-3">
              {RPS_CHOICES.map((choice, idx) => (
                <button
                  // biome-ignore lint/suspicious/noArrayIndexKey: RPS choices are fixed and stable
                  key={idx}
                  type="button"
                  onClick={() => playRPS(idx)}
                  className="py-4 rounded-2xl font-bold text-sm transition-all hover:scale-110 flex flex-col items-center gap-1"
                  style={{
                    background: "oklch(0.16 0.04 280)",
                    border: "2px solid oklch(0.22 0.06 280 / 0.5)",
                    color: "oklch(0.82 0.06 280)",
                  }}
                  data-ocid={`duel.rps.choice.${idx + 1}`}
                >
                  <span className="text-2xl">{choice.split(" ")[0]}</span>
                  <span className="text-xs">{RPS_VALUES[idx]}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={resetDuel}
          className="mt-4 w-full py-2 rounded-xl text-sm font-bold"
          style={{
            background: "transparent",
            color: "oklch(0.5 0.06 280)",
          }}
          data-ocid="duel.back.button"
        >
          ← Back to game select
        </button>
      </div>
    );
  }

  if (phase === "ttt_play") {
    return (
      <div className="w-full">
        <div
          className="flex items-center gap-3 mb-4 p-3 rounded-xl"
          style={{
            background: "oklch(0.12 0.035 275)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
          }}
        >
          <Zap size={16} style={{ color: "oklch(0.78 0.2 55)" }} />
          <span
            className="text-sm font-bold"
            style={{ color: "oklch(0.75 0.06 280)" }}
          >
            1v1 Duel vs{" "}
            <span style={{ color: "oklch(0.78 0.2 55)" }}>{opponent}</span>
          </span>
          <button
            type="button"
            onClick={resetDuel}
            className="ml-auto text-xs px-3 py-1 rounded-lg"
            style={{
              background: "oklch(0.18 0.04 280)",
              color: "oklch(0.6 0.06 280)",
            }}
            data-ocid="duel.back.button"
          >
            ← Back
          </button>
        </div>
        <TicTacToe onClose={resetDuel} inline />
      </div>
    );
  }

  // Result screen
  const resultEmoji = result === "win" ? "🏆" : result === "lose" ? "💀" : "🤝";
  const resultText =
    result === "win" ? "You Win!" : result === "lose" ? "You Lose!" : "Draw!";
  const resultColor =
    result === "win"
      ? "oklch(0.78 0.2 55)"
      : result === "lose"
        ? "oklch(0.75 0.2 25)"
        : "oklch(0.75 0.06 280)";

  return (
    <div className="w-full rounded-2xl p-8 text-center" style={boxStyle}>
      {ConfettiOverlay}
      <div className="text-7xl mb-4">{resultEmoji}</div>
      <h2 className="text-4xl font-black mb-3" style={{ color: resultColor }}>
        {resultText}
      </h2>
      <div
        className="flex justify-center gap-8 mb-6 p-4 rounded-2xl"
        style={{ background: "oklch(0.09 0.03 280)" }}
      >
        <div className="text-center">
          <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
            You
          </p>
          <p className="text-3xl">
            {RPS_CHOICES[rpsPlayerChoice!]?.split(" ")[0]}
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: "oklch(0.78 0.2 55)" }}
          >
            {rpsPlayerChoice !== null ? RPS_VALUES[rpsPlayerChoice] : ""}
          </p>
        </div>
        <div
          className="text-xl font-black self-center"
          style={{ color: "oklch(0.5 0.06 280)" }}
        >
          VS
        </div>
        <div className="text-center">
          <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
            {opponent}
          </p>
          <p className="text-3xl">
            {RPS_CHOICES[rpsOppChoice!]?.split(" ")[0]}
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: "oklch(0.75 0.2 300)" }}
          >
            {rpsOppChoice !== null ? RPS_VALUES[rpsOppChoice] : ""}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setPhase("rps_play")}
          className="flex-1 py-3 rounded-xl font-bold transition-all hover:scale-105"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))",
            color: "white",
          }}
          data-ocid="duel.rematch.button"
        >
          Rematch
        </button>
        <button
          type="button"
          onClick={resetDuel}
          className="flex-1 py-3 rounded-xl font-bold transition-all hover:scale-105"
          style={{
            background: "oklch(0.18 0.04 280)",
            color: "oklch(0.7 0.06 280)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
          }}
          data-ocid="duel.cancel_button"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// ─── GameRoom shell ───────────────────────────────────────────────────────────

// ─── Leaderboard Panel ───────────────────────────────────────────────────────
const RANK_STYLES = [
  {
    label: "🥇",
    bg: "linear-gradient(135deg, oklch(0.82 0.2 80 / 0.15), oklch(0.75 0.22 65 / 0.1))",
    border: "oklch(0.82 0.2 80 / 0.5)",
  },
  {
    label: "🥈",
    bg: "linear-gradient(135deg, oklch(0.72 0.08 270 / 0.15), oklch(0.65 0.1 260 / 0.1))",
    border: "oklch(0.72 0.08 270 / 0.4)",
  },
  {
    label: "🥉",
    bg: "linear-gradient(135deg, oklch(0.68 0.16 45 / 0.15), oklch(0.6 0.18 35 / 0.1))",
    border: "oklch(0.68 0.16 45 / 0.4)",
  },
];

function LeaderboardPanel({
  username,
  uid,
}: { username: string; uid: string }) {
  const scores = getLeaderboard();
  const currentKey = uid || username;

  // Ensure current user appears
  if (scores.length === 0) {
    return (
      <div
        className="p-8 text-center"
        data-ocid="gamezone.leaderboard.empty_state"
      >
        <div className="text-5xl mb-4">🎮</div>
        <p className="font-bold mb-1" style={{ color: "oklch(0.85 0.06 280)" }}>
          No scores yet!
        </p>
        <p className="text-sm" style={{ color: "oklch(0.5 0.06 280)" }}>
          Play a game to get on the board
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2" data-ocid="gamezone.leaderboard.list">
      {scores.map((player, i) => {
        const rankStyle = RANK_STYLES[i] ?? {
          label: `#${i + 1}`,
          bg: "oklch(0.13 0.04 280 / 0.5)",
          border: "oklch(0.22 0.06 280 / 0.3)",
        };
        const isMe = player.uid === currentKey || player.username === username;
        const totalScore = Object.values(player.scores).reduce(
          (s, v) => s + v,
          0,
        );
        return (
          <div
            key={player.uid}
            data-ocid={`gamezone.leaderboard.item.${i + 1}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: isMe ? "oklch(0.65 0.28 305 / 0.12)" : rankStyle.bg,
              border: `1px solid ${isMe ? "oklch(0.65 0.28 305 / 0.4)" : rankStyle.border}`,
            }}
          >
            <span className="text-xl w-8 text-center flex-shrink-0">
              {rankStyle.label}
            </span>
            <AnimatedAvatar username={player.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-bold truncate"
                style={{
                  color: isMe ? "oklch(0.85 0.2 305)" : "oklch(0.88 0.05 280)",
                }}
              >
                {player.username} {isMe ? "(you)" : ""}
              </p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {Object.entries(player.scores).map(([game, s]) => (
                  <span
                    key={game}
                    className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{
                      background: "oklch(0.18 0.05 280)",
                      color: "oklch(0.65 0.1 280)",
                    }}
                  >
                    {game.split(" ")[0]}: {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p
                className="text-lg font-black"
                style={{ color: "oklch(0.82 0.2 80)" }}
              >
                {totalScore}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.5 0.06 280)" }}>
                {player.totalWins}W
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const MATCH_OPPONENT_NAMES = [
  "Shadow",
  "Blaze",
  "Viper",
  "Nova",
  "Ryzen",
  "Crypt",
  "Glitch",
  "Phantom",
];

export default function GameRoom({ username, onRename, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<GameTab>("rps");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gamePlayMode, setGamePlayMode] = useState<null | "ai" | "stranger">(
    null,
  );
  const [matchPhase, setMatchPhase] = useState<
    "searching" | "matched" | "playing"
  >("searching");
  const [opponentName, setOpponentName] = useState("");
  const uid = (() => {
    try {
      return localStorage.getItem("fantasyUID") || username;
    } catch {
      return username;
    }
  })();

  const { data: pendingChallenges = [] } = usePendingChallenges("game");
  const respondChallengeMutation = useRespondToChallenge();
  const visibleChallenges = pendingChallenges.filter(
    (c) => c.challenger !== username && c.status === "pending",
  );

  const handleAcceptChallenge = async (id: string, gameName: string) => {
    try {
      await respondChallengeMutation.mutateAsync({
        challengeId: id,
        username,
        accept: true,
      });
      toast.success(`Challenge accepted! Starting ${gameName}...`);
    } catch {
      toast.error("Failed to accept challenge");
    }
  };

  const handleDenyChallenge = async (id: string) => {
    try {
      await respondChallengeMutation.mutateAsync({
        challengeId: id,
        username,
        accept: false,
      });
    } catch {
      // silent
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden pt-10"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, oklch(0.14 0.07 285) 0%, oklch(0.09 0.03 260) 40%, oklch(0.07 0.02 280) 100%)",
      }}
    >
      <UsernameTopBar username={username} onRename={onRename} />

      {/* ── Mode selector overlay ── */}
      {gamePlayMode === null && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6"
          style={{ background: "oklch(0.09 0.03 265 / 0.97)" }}
        >
          <button
            type="button"
            data-ocid="gamezone.mode.back.button"
            onClick={onBack}
            className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{
              background: "oklch(0.15 0.04 275)",
              border: "1px solid oklch(0.22 0.06 280 / 0.5)",
              color: "oklch(0.75 0.06 280)",
            }}
          >
            <ArrowLeft size={16} /> Lobby
          </button>
          <div className="text-center mb-10">
            <div className="text-5xl mb-3">🎮</div>
            <h2
              className="text-3xl font-black mb-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.2 55), oklch(0.72 0.25 305))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Game Zone
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.55 0.06 280)" }}>
              How do you want to play?
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-md">
            <button
              type="button"
              data-ocid="gamezone.mode.ai.button"
              onClick={() => setGamePlayMode("ai")}
              className="group flex flex-col items-center gap-4 p-7 rounded-3xl transition-all duration-200 hover:scale-105"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.15 0.06 280), oklch(0.12 0.05 260))",
                border: "1px solid oklch(0.55 0.25 305 / 0.5)",
                boxShadow: "0 0 30px oklch(0.55 0.25 305 / 0.15)",
              }}
            >
              <div className="text-5xl">🤖</div>
              <div className="text-center">
                <p
                  className="text-lg font-black mb-1"
                  style={{ color: "oklch(0.88 0.04 280)" }}
                >
                  Play with AI
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.06 280)" }}
                >
                  Play solo games against the AI
                </p>
              </div>
            </button>
            <button
              type="button"
              data-ocid="gamezone.mode.stranger.button"
              onClick={() => {
                setGamePlayMode("stranger");
                setMatchPhase("searching");
                const delay = 2000 + Math.random() * 2000;
                const name =
                  OPPONENT_NAMES[
                    Math.floor(Math.random() * OPPONENT_NAMES.length)
                  ];
                setTimeout(() => {
                  setOpponentName(name);
                  setMatchPhase("matched");
                  setTimeout(() => setMatchPhase("playing"), 1500);
                }, delay);
              }}
              className="group flex flex-col items-center gap-4 p-7 rounded-3xl transition-all duration-200 hover:scale-105"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.15 0.06 55), oklch(0.12 0.04 50))",
                border: "1px solid oklch(0.65 0.22 55 / 0.5)",
                boxShadow: "0 0 30px oklch(0.65 0.22 55 / 0.15)",
              }}
            >
              <div className="text-5xl">👥</div>
              <div className="text-center">
                <p
                  className="text-lg font-black mb-1"
                  style={{ color: "oklch(0.88 0.04 280)" }}
                >
                  Play with Strangers
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.06 280)" }}
                >
                  Match with a real opponent and challenge them
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── Stranger matchmaking overlay ── */}
      {gamePlayMode === "stranger" && matchPhase === "searching" && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
          style={{ background: "oklch(0.09 0.03 265 / 0.97)" }}
        >
          <div
            className="text-6xl animate-spin"
            style={{ animationDuration: "2s" }}
          >
            🔍
          </div>
          <p
            className="text-xl font-bold"
            style={{ color: "oklch(0.88 0.04 280)" }}
          >
            Finding an opponent...
          </p>
          <p className="text-sm" style={{ color: "oklch(0.5 0.06 280)" }}>
            Please wait
          </p>
          <button
            type="button"
            data-ocid="gamezone.matchmaking.cancel.button"
            onClick={() => setGamePlayMode(null)}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{
              background: "oklch(0.55 0.25 25 / 0.15)",
              border: "1px solid oklch(0.6 0.25 25 / 0.5)",
              color: "oklch(0.78 0.22 30)",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {gamePlayMode === "stranger" && matchPhase === "matched" && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
          style={{ background: "oklch(0.09 0.03 265 / 0.97)" }}
        >
          <div className="text-6xl animate-bounce">⚡</div>
          <p
            className="text-2xl font-black"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.2 55), oklch(0.72 0.25 305))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Opponent Found!
          </p>
          <p
            className="text-base font-semibold"
            style={{ color: "oklch(0.75 0.15 305)" }}
          >
            Playing against{" "}
            <span style={{ color: "oklch(0.82 0.2 55)" }}>{opponentName}</span>
          </p>
          <p className="text-sm" style={{ color: "oklch(0.5 0.06 280)" }}>
            Get ready...
          </p>
        </div>
      )}

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, oklch(0.65 0.22 50 / 0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <header
        className="relative z-10 flex items-center gap-4 px-6 py-4 border-b"
        style={{ borderColor: "oklch(0.22 0.06 280 / 0.5)" }}
      >
        <button
          type="button"
          data-ocid="gamezone.back.button"
          onClick={onBack}
          className="p-2 rounded-lg transition-all hover:scale-105"
          style={{
            background: "oklch(0.15 0.04 275)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
            color: "oklch(0.75 0.06 280)",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.65 0.22 50 / 0.15)",
              border: "1px solid oklch(0.65 0.22 50 / 0.4)",
              boxShadow: "0 0 20px oklch(0.65 0.22 50 / 0.3)",
            }}
          >
            <Gamepad2 size={20} style={{ color: "oklch(0.78 0.2 55)" }} />
          </div>
          <div>
            <h1
              className="font-display text-xl font-black"
              style={{ color: "oklch(0.92 0.04 280)" }}
            >
              Game Zone
            </h1>
            <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
              6 games · 1v1 duels · Challenges
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            data-ocid="gamezone.leaderboard.open_modal_button"
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 50 / 0.15), oklch(0.6 0.25 80 / 0.15))",
              border: "1px solid oklch(0.65 0.22 50 / 0.5)",
              color: "oklch(0.78 0.2 55)",
              boxShadow: "0 0 12px oklch(0.65 0.22 50 / 0.2)",
            }}
          >
            <Trophy size={14} />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
          {gamePlayMode === "ai" && (
            <button
              type="button"
              data-ocid="gamezone.mode.change.button"
              onClick={() => setGamePlayMode(null)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105"
              style={{
                background: "oklch(0.16 0.04 275)",
                border: "1px solid oklch(0.22 0.06 280 / 0.5)",
                color: "oklch(0.65 0.06 280)",
              }}
            >
              <ArrowLeft size={13} /> Mode
            </button>
          )}
          {gamePlayMode === "stranger" && matchPhase === "playing" && (
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold hidden sm:flex items-center gap-1"
                style={{ color: "oklch(0.72 0.2 55)" }}
              >
                <Zap size={12} /> vs {opponentName}
              </span>
              <button
                type="button"
                data-ocid="gamezone.match.leave.button"
                onClick={() => {
                  setGamePlayMode(null);
                  setMatchPhase("searching");
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105"
                style={{
                  background: "oklch(0.55 0.25 25 / 0.15)",
                  border: "1px solid oklch(0.6 0.25 25 / 0.5)",
                  color: "oklch(0.78 0.22 30)",
                }}
              >
                <X size={13} /> Leave
              </button>
            </div>
          )}
        </div>
      </header>

      <div
        className="relative z-10 max-w-2xl mx-auto px-4 py-6"
        style={{
          visibility:
            gamePlayMode === null ||
            (gamePlayMode === "stranger" && matchPhase !== "playing")
              ? "hidden"
              : "visible",
        }}
      >
        {/* Pending Challenges Banner */}
        {visibleChallenges.length > 0 && (
          <div
            className="mb-4 rounded-xl overflow-hidden"
            style={{
              background: "oklch(0.13 0.05 280)",
              border: "1px solid oklch(0.65 0.22 50 / 0.4)",
              boxShadow: "0 0 20px oklch(0.65 0.22 50 / 0.1)",
            }}
          >
            {visibleChallenges.slice(0, 3).map((challenge, idx) => (
              <div
                key={challenge.id}
                data-ocid={`gamezone.challenge.item.${idx + 1}`}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom:
                    idx < visibleChallenges.slice(0, 3).length - 1
                      ? "1px solid oklch(0.22 0.06 280 / 0.3)"
                      : "none",
                }}
              >
                <span className="text-xl">🎮</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: "oklch(0.85 0.06 280)" }}
                  >
                    <span style={{ color: "oklch(0.78 0.2 55)" }}>
                      {challenge.challenger}
                    </span>
                    {" challenges: "}
                    <span style={{ color: "oklch(0.85 0.15 305)" }}>
                      {challenge.gameName}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid={`gamezone.challenge.accept.${idx + 1}`}
                  onClick={() =>
                    handleAcceptChallenge(challenge.id, challenge.gameName)
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  style={{
                    background: "oklch(0.45 0.2 145 / 0.2)",
                    border: "1px solid oklch(0.5 0.2 145 / 0.5)",
                    color: "oklch(0.78 0.22 145)",
                  }}
                >
                  <Check size={13} />
                  Accept
                </button>
                <button
                  type="button"
                  data-ocid={`gamezone.challenge.cancel.${idx + 1}`}
                  onClick={() => handleDenyChallenge(challenge.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                  style={{
                    background: "oklch(0.45 0.2 20 / 0.2)",
                    border: "1px solid oklch(0.5 0.2 20 / 0.5)",
                    color: "oklch(0.75 0.2 25)",
                  }}
                >
                  <X size={13} />
                  Deny
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tabs - scrollable on mobile */}
        <div
          className="flex rounded-2xl p-1.5 gap-1.5 mb-8 overflow-x-auto"
          style={{ background: "oklch(0.11 0.04 280)", scrollbarWidth: "none" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`gamezone.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background:
                  activeTab === tab.id
                    ? "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))"
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? "oklch(0.97 0.02 280)"
                    : "oklch(0.55 0.06 280)",
                boxShadow:
                  activeTab === tab.id
                    ? "0 0 20px oklch(0.65 0.22 50 / 0.4)"
                    : "none",
              }}
            >
              <span>{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Game area */}
        <div className="flex justify-center">
          {activeTab === "rps" && (
            <div
              className="w-full rounded-2xl p-4"
              style={{
                background: "oklch(0.12 0.035 275)",
                border: "1px solid oklch(0.22 0.06 280 / 0.5)",
              }}
            >
              <RPSGame
                roomId="gamezone"
                username={username}
                onSendMessage={() => {}}
              />
            </div>
          )}
          {activeTab === "ttt" && <TicTacToe onClose={() => {}} inline />}
          {activeTab === "ng" && <NumberGuess onClose={() => {}} inline />}
          {activeTab === "ws" && <WordScramble username={username} uid={uid} />}
          {activeTab === "trivia" && (
            <TriviaQuiz username={username} uid={uid} />
          )}
          {activeTab === "duel" && <DuelGame />}
        </div>
      </div>
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 cursor-default"
          style={{ zIndex: 9997, background: "oklch(0 0 0 / 0.7)" }}
          data-ocid="gamezone.leaderboard.modal"
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, oklch(0.14 0.07 285), oklch(0.1 0.04 265))",
              border: "1px solid oklch(0.65 0.22 50 / 0.4)",
              boxShadow: "0 0 60px oklch(0.65 0.22 50 / 0.2)",
              maxHeight: "80vh",
            }}
          >
            <div
              className="flex items-center gap-3 px-6 py-5 border-b"
              style={{ borderColor: "oklch(0.22 0.06 280 / 0.4)" }}
            >
              <span className="text-3xl">🏆</span>
              <div>
                <h2
                  className="text-xl font-black"
                  style={{ color: "oklch(0.92 0.04 280)" }}
                >
                  Leaderboard
                </h2>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.06 280)" }}
                >
                  Top players across all games
                </p>
              </div>
              <button
                type="button"
                data-ocid="gamezone.leaderboard.close_button"
                onClick={() => setShowLeaderboard(false)}
                className="ml-auto p-2 rounded-lg transition-all hover:scale-105"
                style={{
                  background: "oklch(0.18 0.04 280)",
                  color: "oklch(0.6 0.06 280)",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(80vh - 80px)" }}
            >
              <LeaderboardPanel username={username} uid={uid} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
