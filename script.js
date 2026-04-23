const trustEl = document.getElementById("trust");
const speakerEl = document.getElementById("speaker");
const lineEl = document.getElementById("line");
const choicesEl = document.getElementById("choices");
const imageEl = document.getElementById("character-image");
const bgm = document.getElementById("bgm");
const bgmToggle = document.getElementById("bgm-toggle");

const state = {
  trust: 0,
  current: "start",
};

const scenes = {
  start: {
    speaker: "S太郎",
    line: "おいおい、お嬢ちゃん。そんな勢いで飛び出したら危ねぇだろ。……って、待て待て待て！！ 俺の袖をロープ代わりにするな！",
    choices: [
      { text: "ごめん、でも一緒に行ってほしい", trust: 2, next: "routeA" },
      { text: "平気だよ。ひとりで何とかする", trust: -1, next: "routeB" },
    ],
  },
  routeA: {
    speaker: "S太郎",
    line: "……ったく、そう言われると放っとけねぇ。俺はお嬢ちゃんを守るだけじゃなく、隣で一緒に戦うって決めてんだ。",
    choices: [
      { text: "頼りにしてる。背中、預けてもいい？", trust: 3, next: "end" },
      { text: "やっぱり危ないから帰ってて", trust: -2, next: "end" },
    ],
  },
  routeB: {
    speaker: "S太郎",
    line: "強がりか本気か、顔見りゃだいたい分かる。お嬢ちゃんは強い。でも今日は無茶の匂いがする。俺にも付き合わせろ。",
    choices: [
      { text: "……わかった。一緒に来て", trust: 2, next: "end" },
      { text: "巻き込みたくない。ここで待ってて", trust: -2, next: "end" },
    ],
  },
  end: {
    speaker: "S太郎",
    line: () => {
      if (state.trust >= 4) {
        imageEl.src = "./assets/images/s_taro_happy.png";
        return "よし、行くぞお嬢ちゃん。何が来ても俺がツッコんで、お前が突破する。……へへ、悪くねぇコンビだろ？";
      }
      if (state.trust >= 1) {
        imageEl.src = "./assets/images/s_taro.png";
        return "ま、今回はこのくらいで勘弁してやる。次に暴走する時は、先に俺へ作戦書を出せ。いいな？";
      }
      imageEl.src = "./assets/images/s_taro_angry.png";
      return "お嬢ちゃん！！ その突撃癖、マジで心臓に悪ぃ！ ……ったく、最後まで見捨てる気はねぇけどな。";
    },
    choices: [{ text: "最初からやり直す", trust: 0, next: "start", reset: true }],
  },
};

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
        imageEl.src = "./assets/images/s_taro.png";
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

renderScene();
