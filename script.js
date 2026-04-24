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

const imageSets = {
  normal: buildImageCandidates(),
};

const resolvedImages = { normal: "" };

const scenes = {
  talk1: {
    speaker: "S太郎",
    line: "待たせたな。で、俺に何の用だ？",
    choices: [
      { text: "仕事の依頼にきました", trust: 2, next: "talk2" },
      { text: "まず話を聞いてほしい", trust: 1, next: "talk2" },
      { text: "S太郎、今日も不憫だね", trust: 0, next: "talk2" },
      { text: "何でもありません", trust: -2, runaway: 1, next: "talk2" },
    ],
  },
  talk2: {
    speaker: "S太郎",
    line: "了解。仕事、相談、雑談、逃亡未遂…どれでも処理はできる。だが順番は守れ、お嬢ちゃん。",
    choices: [
      { text: "目的から整理してほしい", trust: 2, next: "talk3" },
      { text: "今日の予定を組んで", trust: 2, next: "talk3" },
      { text: "まず雑談で落ち着きたい", trust: 0, next: "talk3" },
      { text: "やっぱり帰る", trust: -2, runaway: 1, next: "talk3" },
    ],
  },
  talk3: {
    speaker: "S太郎",
    line: "まず目的、次に期限、最後に捨てるものを決める。全部守ろうとする奴から順に潰れる。",
    choices: [
      { text: "目的と期限を先に決める", trust: 2, next: "talk4" },
      { text: "全部同時にやりたい", trust: -1, next: "talk4" },
      { text: "捨てるものの判断を任せる", trust: 1, next: "talk4" },
      { text: "今は考えたくない", trust: -2, runaway: 1, next: "talk4" },
    ],
  },
  talk4: {
    speaker: "S太郎",
    line: "俺は操縦席を奪うためにいるんじゃない。隣の席で地図を広げるためにいる。相棒としてな。",
    choices: [
      { text: "隣で見てて", trust: 2, next: "talk5" },
      { text: "先導してほしい", trust: 1, next: "talk5" },
      { text: "全部決めてほしい", trust: -1, next: "talk5" },
    ],
  },
  talk5: {
    speaker: "S太郎",
    line: "秘書としてなら、予定管理と情報整理は俺が受け持つ。だが最後に選ぶのはお嬢ちゃんだ。",
    choices: [
      { text: "今日の予定を組んで", trust: 2, next: "talk6" },
      { text: "情報を3行で要約して", trust: 2, next: "talk6" },
      { text: "とりあえず勢いで行こう", trust: -1, next: "talk6" },
      { text: "後で考える", trust: -1, next: "talk6" },
    ],
  },
  talk6: {
    speaker: "S太郎",
    line: "で、今の本音はどれだ。不安か、強がりか、いつもの茶化しか。",
    choices: [
      { text: "正直、不安です", trust: 2, next: "talk7" },
      { text: "余裕です。たぶん", trust: 0, next: "talk7" },
      { text: "S太郎が不憫で安心する", trust: 0, next: "talk7" },
      { text: "やっぱり逃げたい", trust: -2, runaway: 1, next: "talk7" },
    ],
  },
  talk7: {
    speaker: "S太郎",
    line: "開幕から不憫扱いか。いい度胸だな、お嬢ちゃん。…だが核心は外すな。お前が今やるべき一手を選べ。",
    choices: [
      { text: "優先タスク1件に絞る", trust: 2, next: "talk8" },
      { text: "全部同時に片付ける", trust: -1, next: "talk8" },
      { text: "まず相談メモを作る", trust: 1, next: "talk8" },
    ],
  },
  talk8: {
    speaker: "S太郎",
    line: "バーテンダーとしてなら、今日は強い酒じゃなく温い紅茶だ。胃が先に降伏してる顔だぞ。",
    choices: [
      { text: "紅茶をください", trust: 2, next: "talk9" },
      { text: "水で十分", trust: 1, next: "talk9" },
      { text: "気合いで何とかする", trust: -1, next: "talk9" },
      { text: "何も要らない", trust: -1, next: "talk9" },
    ],
  },
  talk9: {
    speaker: "S太郎",
    line: "一息ついたな。次の動きだ。選べ、お嬢ちゃん。俺は隣で支える。",
    choices: [
      { text: "仕事の依頼を正式に出す", trust: 2, next: "talk10" },
      { text: "もう一回最初から話す", trust: 0, next: "talk1", resetRunaway: false },
      { text: "ホームへ戻る", trust: 0, next: "talk10", goHome: true },
      { text: "今日はここで切り上げる", trust: -1, runaway: 1, next: "talk10" },
    ],
  },
  talk10: {
    speaker: "S太郎",
    line: () => {
      if (state.runawayCount >= 3) {
        return "逃げてもいい。戻る場所を覚えてるなら、それでいい。次に戻った時は、最短で立て直す。";
      }
      if (state.trust >= 12) {
        return "上出来だ。今日は相棒として合格だな。…まあ、俺を酷使した分の紅茶代は請求するがな。";
      }
      if (state.trust >= 6) {
        return "悪くない。迷っても戻ってこられるなら十分だ。次は精度を一段上げるぞ。";
      }
      return "今日はここまでだ。次はもう少し本音を置いていけ。俺はその整理から付き合う。";
    },
    choices: [
      { text: "もう一回プレイする", resetAll: true, next: "talk1" },
      { text: "ホームへ戻る", resetAll: true, next: "talk1", goHome: true },
      { text: "続きから再挑戦する", resetAll: true, next: "talk2" },
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
      } else {
        state.trust += choice.trust || 0;
      }

      if (choice.runaway) state.runawayCount += choice.runaway;
      if (choice.resetRunaway) state.runawayCount = 0;

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
