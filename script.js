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

const state = { trust: 0, current: "start" };

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
    "./assets/images/s_taro.png",
  ]);
}

const imageSets = {
  normal: buildImageCandidates(),
  happy: buildImageCandidates(),
  angry: buildImageCandidates(),
};

const resolvedImages = { normal: "", happy: "", angry: "" };

const scenes = {
  start: {
    speaker: "S太郎",
    line: "待たせたな。…で、俺に何の用だ？",
    choices: [
      { text: "1. 仕事の依頼にきました。", trust: 2, next: "plan" },
      { text: "2. あなたについて知りたい。", trust: 1, next: "care" },
      { text: "3. 何でもありません。", trust: -1, next: "solo" },
      { text: "4. …失礼します。", trust: -2, next: "end" },
    ],
  },
  plan: {
    speaker: "S太郎",
    line: "仕事か。いいだろう。だが中途半端は嫌いだ。覚悟はあるな？",
    choices: [
      { text: "覚悟はできています", trust: 2, next: "end" },
      { text: "少し怖いです", trust: 1, next: "end" },
      { text: "やっぱりやめます", trust: -2, next: "end" },
      { text: "最初に戻る", trust: 0, next: "start" },
    ],
  },
  solo: {
    speaker: "S太郎",
    line: "…お嬢ちゃん、無茶はするな。待て待て待て！！ 俺の前では特にだ。",
    choices: [
      { text: "わかった。あなたを頼る", trust: 2, next: "end" },
      { text: "ひとりで行く", trust: -2, next: "end" },
      { text: "最初に戻る", trust: 0, next: "start" },
      { text: "黙って頷く", trust: 1, next: "end" },
    ],
  },
  care: {
    speaker: "S太郎",
    line: "物好きだな。だが嫌いじゃない。聞きたいことがあるなら、座って話せ。",
    choices: [
      { text: "もっと知りたい", trust: 2, next: "end" },
      { text: "十分です", trust: 1, next: "end" },
      { text: "少し怖くなった", trust: -1, next: "end" },
      { text: "最初に戻る", trust: 0, next: "start" },
    ],
  },
  end: {
    speaker: "S太郎",
    line: () => {
      if (state.trust >= 4) {
        setAllImages(resolvedImages.happy || resolvedImages.normal);
        return "いい目をしてる。なら俺も本気で付き合おう。";
      }
      if (state.trust >= 1) {
        setAllImages(resolvedImages.normal);
        return "悪くない。次はもう少し踏み込んでこい。";
      }
      setAllImages(resolvedImages.angry || resolvedImages.normal);
      return "…今日はここまでだ。出直してこい。";
    },
    choices: [
      { text: "もう一回プレイする", trust: 0, next: "start", reset: true },
      { text: "ホームへ戻る", trust: 0, next: "start", reset: true, goHome: true },
      { text: "別ルートを試す", trust: 0, next: "start", reset: true },
      { text: "S太郎にツッコまれる", trust: 0, next: "start", reset: true },
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

function renderScene() {
  const scene = scenes[state.current];
  speakerEl.textContent = scene.speaker;
  lineEl.textContent = typeof scene.line === "function" ? scene.line() : scene.line;
  trustEl.textContent = String(Math.max(0, state.trust * 20));
  choicesEl.innerHTML = "";

  scene.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.textContent = choice.text;
    button.addEventListener("click", () => {
      if (choice.reset) {
        state.trust = 0;
        setAllImages(resolvedImages.normal);
      } else {
        state.trust += choice.trust;
      }
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
  state.current = "start";
  renderScene();
});

backHomeBtn.addEventListener("click", () => showHome());

async function init() {
  resolvedImages.normal = await pickFirstImage(imageSets.normal);
  resolvedImages.happy = await pickFirstImage(imageSets.happy);
  resolvedImages.angry = await pickFirstImage(imageSets.angry);

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
