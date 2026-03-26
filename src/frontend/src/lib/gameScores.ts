const STORAGE_KEY = "fantasyGameScores";

export interface PlayerScore {
  username: string;
  scores: Record<string, number>; // gameName -> bestScore
  totalWins: number;
}

export type ScoreMap = Record<string, PlayerScore>;

export function loadScores(): ScoreMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScoreMap) : {};
  } catch {
    return {};
  }
}

export function saveScore(
  uid: string,
  username: string,
  gameName: string,
  score: number,
  isWin = false,
): boolean {
  const scores = loadScores();
  const player = scores[uid] ?? { username, scores: {}, totalWins: 0 };
  const prev = player.scores[gameName] ?? 0;
  const isNewRecord = score > prev;
  player.username = username;
  if (isNewRecord) player.scores[gameName] = score;
  if (isWin) player.totalWins += 1;
  scores[uid] = player;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // ignore
  }
  return isNewRecord;
}

export function getLeaderboard(): (PlayerScore & { uid: string })[] {
  const scores = loadScores();
  return Object.entries(scores)
    .map(([uid, data]) => ({ uid, ...data }))
    .sort((a, b) => {
      const aTotal = Object.values(a.scores).reduce((s, v) => s + v, 0);
      const bTotal = Object.values(b.scores).reduce((s, v) => s + v, 0);
      return bTotal - aTotal || b.totalWins - a.totalWins;
    })
    .slice(0, 10);
}
