const trustEl = document.getElementById("trust");
const speakerEl = document.getElementById("speaker");
const lineEl = document.getElementById("line");
const choicesEl = document.getElementById("choices");
const gameImageEl = document.getElementById("character-image");
const homeImageEl = document.getElementById("home-image");
const gameMainEl = document.querySelector(".game-main");
const homeMainEl = document.querySelector(".home-center");
const homeScreenEl = document.getElementById("home-screen");
const gameScreenEl = document.getElementById("game-screen");
const startGameBtn = document.getElementById("start-game");
const backHomeBtn = document.getElementById("back-home");
const bgm = document.getElementById("bgm");
const bgmToggle = document.getElementById("bgm-toggle");

const state = {
  trust: 0,
  runawayCount: 0,
  current: "talk1",
  intent: "",
  supportStyle: "",
  planScore: 0,
  drinkChoice: "",
  finalAction: "",
  lastPlayerLine: "",
  jokeCount: 0,
};

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function buildImageCandidates() {
  const file = "S太郎おじさん.PNG";
  const fileNfd = file.normalize("NFD");

  return unique([
    `./assets/images/${file}`,
    encodeURI(`./assets/images/${file}`),
    `./assets/images/${fileNfd}`,
    encodeURI(`./assets/images/${fileNfd}`),
    "./assets/images/S太郎-煙草.PNG",
    "./assets/images/S太郎-口閉じスマイル.PNG",
  ]);
}

const imageSets = { normal: buildImageCandidates() };
const resolvedImages = { normal: "" };

function intentLabel() {
  if (state.intent === "work") return "依頼";
  if (state.intent === "consult") return "相談";
  if (state.intent === "chat") return "雑談";
  if (state.intent === "run") return "逃走";
  return "未設定";
}

function endingLine() {
  if (state.jokeCount >= 3) {
    return "不憫エンド：……お嬢ちゃん、俺をネタ枠として酷使しすぎだ。だが笑って進めるなら、それも作戦だな。";
  }

  if (state.runawayCount >= 2 || state.finalAction === "withdraw") {
    return "逃げてもいい。戻る場所を覚えてるなら、それでいい。次は戻った瞬間から立て直す。";
  }

  if (state.trust >= 16 && state.planScore >= 6 && state.finalAction === "commit") {
    return "参謀エンド：上出来だ。ここからは俺が盤面を読む。お嬢ちゃんは決断だけに集中しろ、勝ち筋はもう見えてる。";
  }

  if (state.intent === "chat" && state.trust >= 8) {
    return "雑談から本題を拾えた。悪くない。情報整理の筋が通ってる。";
  }

  if (state.trust >= 8) {
    return "悪くない。迷っても戻ってこられるなら十分だ。次は精度を一段上げるぞ。";
  }

  return "今日はここまでだ。次はもう少し本音を置いていけ。俺はその整理から付き合う。";
}

const scenes = {
  talk1: {
    speaker: "S太郎",
    line: "待たせたな。で、俺に何の用だ？",
    choices: [
      { text: "仕事の依頼にきました", trust: 2, intent: "work", next: "talk2" },
      { text: "まず話を聞いてほしい", trust: 1, intent: "consult", next: "talk2" },
      { text: "S太郎、今日も不憫だね", trust: 0, intent: "chat", joke: 1, next: "talk2" },
      { text: "何でもありません", trust: -2, runaway: 1, intent: "run", next: "talk2" },
    ],
  },
  talk2: {
    speaker: "S太郎",
    line: () => `さっき「${state.lastPlayerLine || "…"}」って言ったな。現在の分類は「${intentLabel()}」だ。順番を守れば、俺が道筋を作る。`,
    choices: [
      { text: "目的から整理してほしい", trust: 2, plan: 2, next: "talk3" },
      { text: "今日の予定を組んで", trust: 2, plan: 2, next: "talk3" },
      { text: "まず雑談で落ち着きたい", trust: 0, plan: 0, next: "talk3" },
      { text: "やっぱり帰る", trust: -2, runaway: 1, next: "talk3" },
    ],
  },
  talk3: {
    speaker: "S太郎",
    line: () => {
      if (state.intent === "work") return "仕事か。いいだろう。条件を言え。甘い見積もりなら、その場で突き返す。";
      if (state.intent === "consult") return "話なら聞く。だが俺は飾り棚の置物じゃない。次の手まで一緒に考える。";
      if (state.intent === "chat") return "開幕から不憫扱いとはな。…まあいい、雑談にも情報は埋まってる。拾っていくぞ。";
      return "逃げ足が速いのは悪くない。だが戻る時の入口は決めておけ。";
    },
    choices: [
      { text: "期限と優先順位を決める", trust: 2, plan: 2, next: "talk4" },
      { text: "全部同時に進めたい", trust: -1, plan: -1, next: "talk4" },
      { text: "必要な情報だけ抽出して", trust: 1, plan: 1, next: "talk4" },
      { text: "いったん保留したい", trust: -1, runaway: 1, next: "talk4" },
    ],
  },
  talk4: {
    speaker: "S太郎",
    line: () => `「${state.lastPlayerLine || "任せる"}」か。俺は操縦席を奪うためにいるんじゃない。隣の席で地図を広げるためにいる。`,
    choices: [
      { text: "隣で見てて", trust: 2, supportStyle: "partner", next: "talk5" },
      { text: "先回りして道を示して", trust: 1, supportStyle: "lead", next: "talk5" },
      { text: "全部決めてほしい", trust: -1, supportStyle: "depend", next: "talk5" },
    ],
  },
  talk5: {
    speaker: "S太郎",
    line: "秘書としてなら、予定管理と情報整理は俺が受け持つ。だが最後に選ぶのはお嬢ちゃんだ。",
    choices: [
      { text: "午前に資料整理、午後に実行で", trust: 2, plan: 2, next: "talk6" },
      { text: "期限だけ決めて柔軟に", trust: 1, plan: 1, next: "talk6" },
      { text: "予定は後で考える", trust: -1, plan: -1, next: "talk6" },
      { text: "とにかく勢いで", trust: -2, plan: -2, next: "talk6" },
    ],
  },
  talk6: {
    speaker: "S太郎",
    line: () => `予定は受け取った。で、「${state.lastPlayerLine || ""}」の続きだ。今の本音はどれだ？ 不安か、強がりか、茶化しか。`,
    choices: [
      { text: "不安です。整理してほしい", trust: 2, next: "talk7" },
      { text: "余裕です。多分", trust: 0, next: "talk7" },
      { text: "S太郎が不憫で安心する", trust: 0, joke: 1, next: "talk7" },
      { text: "ちょっと逃げたい", trust: -2, runaway: 1, next: "talk7" },
    ],
  },
  talk7: {
    speaker: "S太郎",
    line: () => `「${state.lastPlayerLine || "…"}」な。安心しろ。俺は前に出すぎない。だが倒れそうなら襟首くらい掴む。核心を選べ。`,
    choices: [
      { text: "優先タスク1件に絞る", trust: 2, plan: 2, next: "talk8" },
      { text: "情報を追加で集める", trust: 1, plan: 1, next: "talk8" },
      { text: "全部同時にやる", trust: -1, plan: -1, next: "talk8" },
    ],
  },
  talk8: {
    speaker: "S太郎",
    line: () => `今の返事は「${state.lastPlayerLine || ""}」か。バーテンダーとしてなら、今日は強い酒じゃなくて温い紅茶だな。`,
    choices: [
      { text: "紅茶をください", trust: 2, drink: "tea", next: "talk9" },
      { text: "水でお願いします", trust: 1, drink: "water", next: "talk9" },
      { text: "気合いで進める", trust: -1, drink: "none", next: "talk9" },
      { text: "何も要らない", trust: -1, drink: "none", next: "talk9" },
    ],
  },
  talk9: {
    speaker: "S太郎",
    line: () => `準備完了だ。分類:${intentLabel()} / 予定精度:${state.planScore} / 飲み物:${state.drinkChoice || "未選択"}。次を決めろ。`,
    choices: [
      { text: "この計画で実行する", trust: 2, finalAction: "commit", next: "talk10" },
      { text: "もう一回最初から話す", trust: 0, finalAction: "retry", next: "talk1" },
      { text: "少し修正してから進む", trust: 1, finalAction: "adjust", next: "talk10" },
      { text: "今日は撤退する", trust: -1, runaway: 1, finalAction: "withdraw", next: "talk10" },
    ],
  },
  talk10: {
    speaker: "S太郎",
    line: endingLine,
    choices: [
      { text: "もう一回プレイする", resetAll: true, next: "talk1" },
      { text: "ホームへ戻る", resetAll: true, next: "talk1", goHome: true },
      { text: "続きから再挑戦する", resetAll: true, next: "talk3" },
    ],
  },
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve("");
    img.src = src;
  });
}

async function pickFirstImage(candidates) {
  for (const src of candidates) {
    const ok = await loadImage(src);
    if (ok) return ok;
  }
  return "";
}

function setAllImages(src) {
  if (!src) return;
  gameImageEl.src = src;
  homeImageEl.src = src;
}

function showHome() {
  homeScreenEl.classList.remove("is-hidden");
  gameScreenEl.classList.add("is-hidden");
}

function showGame() {
  homeScreenEl.classList.add("is-hidden");
  gameScreenEl.classList.remove("is-hidden");
}

function trustToPercent() {
  return Math.max(0, Math.min(100, state.trust * 5));
}

function resetMeta() {
  state.intent = "";
  state.supportStyle = "";
  state.planScore = 0;
  state.drinkChoice = "";
  state.finalAction = "";
  state.lastPlayerLine = "";
  state.jokeCount = 0;
}

function renderScene() {
  const scene = scenes[state.current];
  speakerEl.textContent = scene.speaker;
  lineEl.textContent = typeof scene.line === "function" ? scene.line() : scene.line;
  trustEl.textContent = String(trustToPercent());
  choicesEl.innerHTML = "";

  scene.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.textContent = choice.text;
    button.addEventListener("click", () => {
      if (choice.resetAll) {
        state.trust = 0;
        state.runawayCount = 0;
        resetMeta();
      } else {
        state.trust += choice.trust || 0;
      }

      state.lastPlayerLine = choice.text;
      if (choice.runaway) state.runawayCount += choice.runaway;
      if (choice.joke) state.jokeCount += choice.joke;
      if (choice.intent) state.intent = choice.intent;
      if (choice.supportStyle) state.supportStyle = choice.supportStyle;
      if (typeof choice.plan === "number") state.planScore += choice.plan;
      if (choice.drink) state.drinkChoice = choice.drink;
      if (choice.finalAction) state.finalAction = choice.finalAction;

      if (choice.goHome) showHome();

      state.current = choice.next;
      renderScene();
    });
    choicesEl.appendChild(button);
  });
}

bgmToggle.addEventListener("click", async () => {
  try {
    if (bgm.paused) {
      await bgm.play();
      bgmToggle.textContent = "BGM停止";
      return;
    }
    bgm.pause();
    bgmToggle.textContent = "BGM再生";
  } catch {
    bgmToggle.textContent = "音楽ファイル未配置";
  }
});

startGameBtn.addEventListener("click", () => {
  showGame();
  state.current = "talk1";
  renderScene();
});

backHomeBtn.addEventListener("click", () => showHome());

async function init() {
  resolvedImages.normal = await pickFirstImage(imageSets.normal);

  if (resolvedImages.normal) {
    setAllImages(resolvedImages.normal);
    gameMainEl.classList.remove("stage--no-image");
    homeMainEl.classList.remove("stage--no-image");
  } else {
    console.error("S太郎画像が見つかりません。確認したパス:", imageSets.normal);
    gameMainEl.classList.add("stage--no-image");
    homeMainEl.classList.add("stage--no-image");
  }

  renderScene();
  showHome();
}

init();
