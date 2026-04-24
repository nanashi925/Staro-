const trustEl = document.getElementById("trust");
const speakerEl = document.getElementById("speaker");
const lineEl = document.getElementById("line");
const choicesEl = document.getElementById("choices");
const imageEl = document.getElementById("character-image");
const stageEl = document.querySelector(".hero");
const bgm = document.getElementById("bgm");
const bgmToggle = document.getElementById("bgm-toggle");

const state = {
  trust: 0,
  current: "start",
};

const imageSets = {
  normal: [
    "./assets/images/S太郎-煙草.PNG",
    "./assets/images/S太郎-口閉じスマイル.PNG",
    "./assets/images/s_taro.png",
    "./assets/images/s_taro.webp",
    "./assets/images/s_taro.jpg",
    "./assets/images/staro.png",
    "./assets/images/S太郎.png",
    "./assets/images/main.png",
  ],
  happy: [
    "./assets/images/S太郎-口閉じスマイル.PNG",
    "./assets/images/s_taro_happy.png",
    "./assets/images/s_taro_smile.png",
    "./assets/images/S太郎_happy.png",
  ],
  angry: [
    "./assets/images/S太郎-煙草.PNG",
    "./assets/images/s_taro_angry.png",
    "./assets/images/s_taro_serious.png",
    "./assets/images/S太郎_angry.png",
  ],
};

const resolvedImages = {
  normal: "",
  happy: "",
  angry: "",
};

const scenes = {
  start: {
    speaker: "S太郎",
    line: "待て待て待て！！ お嬢ちゃん、作戦会議なしで特攻はダメだって！ 俺の胃が先にやられる！",
    choices: [
      { text: "S太郎の袖をつかんで『一緒に来て』", trust: 2, next: "plan" },
      { text: "『平気、ひとりで行ける』と強がる", trust: -1, next: "solo" },
      { text: "『頭なでて落ち着かせて』と甘える", trust: 3, next: "care" },
      { text: "『まず恋人さんに連絡しよう』と提案", trust: 1, next: "team" },
    ],
  },
  plan: {
    speaker: "S太郎",
    line: "よし、そういう判断は大歓迎だ。お嬢ちゃんの覚悟は俺が知ってる。だからこそ、雑には使わせねぇ。",
    choices: [
      { text: "『背中、預けてもいい？』", trust: 2, next: "end" },
      { text: "『やっぱり先に突っ込む！』", trust: -2, next: "end" },
      { text: "『S太郎が前、私が後ろで支援』", trust: 1, next: "end" },
      { text: "『作戦、もう一回練る』", trust: 0, next: "start" },
    ],
  },
  solo: {
    speaker: "S太郎",
    line: "お嬢ちゃんは強い。だがな、強い奴ほど一人で抱え込みやすいんだよ。俺にも面倒見させろ。",
    choices: [
      { text: "『……わかった、隣で戦って』", trust: 2, next: "end" },
      { text: "『ごめん、今日は一人でやる』", trust: -2, next: "end" },
      { text: "『じゃあ後ろから見守って』", trust: 0, next: "end" },
      { text: "『やっぱり最初から相談する』", trust: 1, next: "start" },
    ],
  },
  care: {
    speaker: "S太郎",
    line: "……ったく、そういう顔されると弱ぇんだよ俺は。よしよし。落ち着いたら次の手を決めるぞ。",
    choices: [
      { text: "『もうちょっとだけ甘えていい？』", trust: 2, next: "end" },
      { text: "『ありがとう、もう行ける』", trust: 1, next: "end" },
      { text: "『勢いで突撃する！』", trust: -2, next: "end" },
      { text: "『恋人さんにも共有しよう』", trust: 1, next: "team" },
    ],
  },
  team: {
    speaker: "S太郎",
    line: "その判断、いいねぇ。連携できる相手を信じるのは弱さじゃねぇ、賢さだ。俺も全力で合わせる。",
    choices: [
      { text: "『三人で行こう』", trust: 2, next: "end" },
      { text: "『やっぱり二人で行こう』", trust: 1, next: "end" },
      { text: "『私ひとりで行く』", trust: -2, next: "end" },
      { text: "『最初から作戦を見直す』", trust: 0, next: "start" },
    ],
  },
  end: {
    speaker: "S太郎",
    line: () => {
      if (state.trust >= 5) {
        imageEl.src = resolvedImages.happy || resolvedImages.normal;
        return "よし決まりだ、お嬢ちゃん。俺がツッコんで道を作る、お前が突破する。並んで勝ちに行くぞ。";
      }
      if (state.trust >= 1) {
        imageEl.src = resolvedImages.normal;
        return "今回はまあ合格点だ。無茶は減らせ、でも覚悟はそのままでいい。俺が隣にいる。";
      }
      imageEl.src = resolvedImages.angry || resolvedImages.normal;
      return "だから待てって言っただろお嬢ちゃん！！ ……ほんと世話が焼ける。でも最後まで付き合うからな。";
    },
    choices: [
      { text: "もう一回プレイする", trust: 0, next: "start", reset: true },
      { text: "別ルートを試す", trust: 0, next: "start", reset: true },
      { text: "信頼度を0にしてやり直す", trust: 0, next: "start", reset: true },
      { text: "S太郎にもう一度ツッコまれる", trust: 0, next: "start", reset: true },
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

function renderScene() {
  const scene = scenes[state.current];
  speakerEl.textContent = scene.speaker;
  lineEl.textContent = typeof scene.line === "function" ? scene.line() : scene.line;
  trustEl.textContent = state.trust;
  choicesEl.innerHTML = "";

  scene.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.textContent = choice.text;
    button.addEventListener("click", () => {
      if (choice.reset) {
        state.trust = 0;
        imageEl.src = resolvedImages.normal;
      } else {
        state.trust += choice.trust;
      }
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

async function init() {
  resolvedImages.normal = await pickFirstImage(imageSets.normal);
  resolvedImages.happy = await pickFirstImage(imageSets.happy);
  resolvedImages.angry = await pickFirstImage(imageSets.angry);

  if (resolvedImages.normal) {
    imageEl.src = resolvedImages.normal;
    stageEl.classList.remove("stage--no-image");
  } else {
    imageEl.removeAttribute("src");
    stageEl.classList.add("stage--no-image");
  }

  renderScene();
}

init();
