// Personalize these details before sharing the surprise.
const PERSONAL = {
  herName: "Your favorite person",
  yourName: "Your favorite person",
  anniversary: "another year of us",
  memory: "All my favorite little moments somehow end up being the ones with you.",
};

const FOLLOW_UP_QUESTIONS = [
  { text: "Hmm... are you really saying you don't love me? 🥺", emoji: "🥺" },
  { text: "Not even a tiny, microscopic bit? 😢", emoji: "😢" },
  { text: "What about all the snacks I've shared with you? 🍟", emoji: "🍟" },
  { text: "What if I say sorry in advance for my next bad joke? 🙏", emoji: "🙏" },
  { text: "Last chance... you love me, right? 💔", emoji: "💔" },
];

const MAIN_QUESTION = {
  text: "Do you still love me?",
  emoji: "💌",
};

const FINAL_QUESTIONS = [
  { text: "Who else would lovingly tolerate your music taste? 😤", emoji: "😤" },
  { text: "Wow. After all our snacks and silly little adventures? 😭", emoji: "😭" },
  { text: "Final-final question: will you stay with me forever? 🥹", emoji: "🥹" },
];

const DODGE_LABELS = ["Nope", "Too slow", "Try again", "Nice try"];
const stageContent = document.querySelector("#stageContent");
const loveCard = document.querySelector("#loveCard");
const confettiLayer = document.querySelector("#confettiLayer");

let stage = "landing";
let questionIndex = 0;
let dodgeCount = 0;
let isTransitioning = false;
let lastDodgeAt = 0;
let finaleShown = false;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function currentQuestion() {
  if (stage === "main") return MAIN_QUESTION;
  return stage === "follow-up" ? FOLLOW_UP_QUESTIONS[questionIndex] : FINAL_QUESTIONS[questionIndex];
}

function renderLanding() {
  stage = "landing";
  stageContent.innerHTML = `
    <p class="eyebrow">A tiny surprise for you</p>
    <h1>Happy Anniversary,<br>${escapeHtml(PERSONAL.herName)}!</h1>
    <p class="subtitle">I have one very important question for you... 💌</p>
    <button class="button button-primary" id="openSurprise" type="button">Open your surprise</button>
  `;
}

function renderQuestion() {
  const list = stage === "main"
    ? [MAIN_QUESTION]
    : stage === "follow-up" ? FOLLOW_UP_QUESTIONS : FINAL_QUESTIONS;
  const question = currentQuestion();
  const stageLabel = stage === "main"
    ? "One very important question"
    : stage === "follow-up" ? "Hmm, really?" : "Okay but really...";
  const questionNumber = questionIndex + 1;
  const currentNoLabel = dodgeCount ? DODGE_LABELS[(dodgeCount - 1) % DODGE_LABELS.length] : "No";

  stageContent.innerHTML = `
    <p class="eyebrow">${stageLabel}</p>
    <span class="question-emoji" aria-hidden="true">${question.emoji}</span>
    <h2 class="question-title">${escapeHtml(question.text)}</h2>
    <p class="progress">Question ${questionNumber} of ${list.length}</p>
    <div class="button-row">
      <button class="button button-primary" id="yesButton" type="button">Yes 💖</button>
      <button class="button button-secondary" id="noButton" type="button">No</button>
    </div>
    <p class="dodge-counter" id="dodgeCounter" aria-live="polite"></p>
  `;
  positionNoButton(false);
}

function transitionTo(render) {
  if (isTransitioning) return;
  isTransitioning = true;
  loveCard.classList.add("is-changing");
  window.setTimeout(() => {
    render();
    loveCard.classList.remove("is-changing");
    isTransitioning = false;
  }, 210);
}

function startQuiz() {
  stage = "main";
  questionIndex = 0;
  dodgeCount = 0;
  transitionTo(renderQuestion);
}

function advanceQuestion(wasCaught = false) {
  if (stage === "follow-up") {
    if (questionIndex < FOLLOW_UP_QUESTIONS.length - 1) {
      questionIndex += 1;
      dodgeCount = 0;
      transitionTo(() => {
        renderQuestion();
        if (wasCaught) shakeCard();
      });
    } else {
      stage = "final";
      questionIndex = 0;
      dodgeCount = 0;
      transitionTo(renderQuestion);
    }
    return;
  }

  if (stage === "final" && questionIndex < FINAL_QUESTIONS.length - 1) {
    questionIndex += 1;
    dodgeCount = 0;
    transitionTo(() => {
      renderQuestion();
      if (wasCaught) shakeCard();
    });
  }
}

function goToFinale() {
  if (finaleShown) return;
  finaleShown = true;
  stage = "finale";
  transitionTo(renderFinale);
  window.setTimeout(startConfetti, 250);
}

function renderFinale() {
  const name = escapeHtml(PERSONAL.herName);
  const sender = escapeHtml(PERSONAL.yourName);
  const memory = escapeHtml(PERSONAL.memory);
  stageContent.innerHTML = `
    <p class="eyebrow">The only answer I was hoping for</p>
    <span class="question-emoji" aria-hidden="true">💖</span>
    <h1>I knew it!</h1>
    <h2>I love you too, ${name}.</h2>
    <p class="anniversary-line">Celebrating ${escapeHtml(PERSONAL.anniversary)} ✨</p>
    <p class="final-message">${memory}<br>Here's to many more laughs, hugs, and ordinary days made lovely by you.<br>All my love, ${sender} 💌</p>
    <figure class="photo-frame" id="photoFrame" hidden>
      <img src="photo.jpg" alt="A favorite photo of us">
    </figure>
    <button class="button button-primary replay-button" id="replayButton" type="button">Replay our little quiz</button>
  `;
  const image = stageContent.querySelector(".photo-frame img");
  image.addEventListener("load", () => {
    stageContent.querySelector(".photo-frame").hidden = false;
  }, { once: true });
  image.addEventListener("error", () => {
    stageContent.querySelector(".photo-frame").remove();
  }, { once: true });
}

function shakeCard() {
  loveCard.classList.remove("shake");
  void loveCard.offsetWidth;
  loveCard.classList.add("shake");
  window.setTimeout(() => loveCard.classList.remove("shake"), 450);
}

function rectangleFor(element) {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
}

function rectanglesOverlap(first, second, padding = 0) {
  return first.left < second.right + padding
    && first.right > second.left - padding
    && first.top < second.bottom + padding
    && first.bottom > second.top - padding;
}

function positionNoButton(shouldDodge = true) {
  const noButton = document.querySelector("#noButton");
  const yesButton = document.querySelector("#yesButton");
  if (!noButton || !yesButton) return;

  const buttonRect = noButton.getBoundingClientRect();
  const yesRect = rectangleFor(yesButton);
  const margin = 12;
  const maxLeft = Math.max(margin, window.innerWidth - buttonRect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - buttonRect.height - margin);
  const safeYesRect = {
    left: yesRect.left,
    right: yesRect.right,
    top: yesRect.top,
    bottom: yesRect.bottom,
  };
  if (!shouldDodge) {
    const gap = 16;
    const centeredTop = yesRect.top + (yesRect.bottom - yesRect.top - buttonRect.height) / 2;
    const besideYes = [
      { left: yesRect.right + gap, top: centeredTop },
      { left: yesRect.left - buttonRect.width - gap, top: centeredTop },
    ].find(({ left, top }) => left >= margin
      && left + buttonRect.width <= window.innerWidth - margin
      && top >= margin
      && top + buttonRect.height <= window.innerHeight - margin);
    if (besideYes) {
      noButton.style.left = `${besideYes.left}px`;
      noButton.style.top = `${besideYes.top}px`;
      return;
    }
  }
  const candidates = [];

  for (let attempt = 0; attempt < 60; attempt += 1) {
    candidates.push({
      left: margin + Math.random() * Math.max(0, maxLeft - margin),
      top: margin + Math.random() * Math.max(0, maxTop - margin),
    });
  }

  const corners = [
    { left: margin, top: margin },
    { left: maxLeft, top: margin },
    { left: margin, top: maxTop },
    { left: maxLeft, top: maxTop },
    { left: (maxLeft + margin) / 2, top: margin },
    { left: (maxLeft + margin) / 2, top: maxTop },
  ];
  candidates.push(...corners);

  const next = candidates.find(({ left, top }) => !rectanglesOverlap({
    left,
    top,
    right: left + buttonRect.width,
    bottom: top + buttonRect.height,
  }, safeYesRect, 12)) || corners[0];

  noButton.style.left = `${Math.max(0, Math.min(next.left, window.innerWidth - buttonRect.width))}px`;
  noButton.style.top = `${Math.max(0, Math.min(next.top, window.innerHeight - buttonRect.height))}px`;
}

function dodgeNoButton() {
  if (stage !== "main" && stage !== "follow-up" && stage !== "final") return;
  if (dodgeCount >= 10) return;
  const now = Date.now();
  if (now - lastDodgeAt < 120) return;
  lastDodgeAt = now;
  dodgeCount += 1;

  const noButton = document.querySelector("#noButton");
  const counter = document.querySelector("#dodgeCounter");
  if (!noButton) return;

  noButton.textContent = DODGE_LABELS[(dodgeCount - 1) % DODGE_LABELS.length];
  noButton.style.fontSize = `${Math.max(12, 16 - dodgeCount * 0.35)}px`;
  noButton.style.minWidth = `${Math.max(84, 100 - dodgeCount * 1.5)}px`;
  noButton.style.minHeight = `${Math.max(48, 52 - dodgeCount * 0.4)}px`;
  noButton.style.padding = `${Math.max(10, 13 - dodgeCount * 0.2)}px ${Math.max(14, 25 - dodgeCount)}px`;
  noButton.classList.toggle("is-slow", dodgeCount >= 8);
  positionNoButton();

  if (counter) {
    counter.textContent = `Dodged ${dodgeCount} ${dodgeCount === 1 ? "time" : "times"} 😏`;
  }
}

function dodgeIfNear(event) {
  if (event.pointerType === "touch" || dodgeCount >= 10) return;
  const noButton = document.querySelector("#noButton");
  if (!noButton) return;
  const rect = noButton.getBoundingClientRect();
  const nearestX = Math.max(rect.left, Math.min(event.clientX, rect.right));
  const nearestY = Math.max(rect.top, Math.min(event.clientY, rect.bottom));
  if (Math.hypot(event.clientX - nearestX, event.clientY - nearestY) < 100) {
    dodgeNoButton();
  }
}

function startConfetti() {
  const colors = ["#d76b89", "#f7a8b8", "#ffc89f", "#e7b4d2", "#f5d774", "#c5dba7"];
  const symbols = ["♥", "♡", "✦"];
  const count = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 55;
  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--piece-color", colors[index % colors.length]);
    piece.style.setProperty("--fall-duration", `${3 + Math.random() * 3}s`);
    piece.style.setProperty("--fall-delay", `${Math.random() * 1.4}s`);
    piece.style.setProperty("--drift", `${Math.random() * 220 - 110}px`);
    piece.style.fontSize = `${12 + Math.random() * 18}px`;
    confettiLayer.append(piece);
    window.setTimeout(() => piece.remove(), 6500);
  }
}

function addFloatingHearts() {
  const field = document.querySelector("#heartField");
  for (let index = 0; index < 17; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = index % 3 === 0 ? "♡" : "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.setProperty("--duration", `${11 + Math.random() * 12}s`);
    heart.style.setProperty("--delay", `${-Math.random() * 22}s`);
    heart.style.setProperty("--drift", `${Math.random() * 100 - 50}px`);
    heart.style.fontSize = `${12 + Math.random() * 20}px`;
    field.append(heart);
  }
}

document.addEventListener("click", (event) => {
  if (event.target.closest("#openSurprise")) {
    startQuiz();
  } else if (event.target.closest("#yesButton")) {
    if (stage === "main") goToFinale();
    else if (stage === "follow-up") advanceQuestion();
    else if (stage === "final" && questionIndex === FINAL_QUESTIONS.length - 1) goToFinale();
    else if (stage === "final") advanceQuestion();
  } else if (event.target.closest("#noButton")) {
    if (dodgeCount >= 10 && stage === "main") {
      stage = "follow-up";
      questionIndex = 0;
      dodgeCount = 0;
      transitionTo(renderQuestion);
    } else if (dodgeCount >= 10 && (stage === "follow-up" || stage === "final")) {
      if (stage === "final" && questionIndex === FINAL_QUESTIONS.length - 1) {
        const noButton = document.querySelector("#noButton");
        noButton.textContent = "Okay fine, Yes 💖";
        noButton.classList.add("is-final-yes");
        noButton.disabled = true;
        window.setTimeout(goToFinale, 550);
      } else {
        advanceQuestion(true);
      }
    }
  } else if (event.target.closest("#replayButton")) {
    finaleShown = false;
    transitionTo(renderLanding);
  }
});

document.addEventListener("pointermove", dodgeIfNear, { passive: true });

document.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "touch" || !event.target.closest("#noButton")) return;
  if (dodgeCount < 10) {
    event.preventDefault();
    dodgeNoButton();
  }
}, { passive: false });

window.addEventListener("resize", () => {
  if (document.querySelector("#noButton")) positionNoButton(dodgeCount > 0);
});

addFloatingHearts();
renderLanding();
