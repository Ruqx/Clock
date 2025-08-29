const goalBoard = document.getElementById("goalBoard");
const addGoalBtn = document.getElementById("addGoalBtn");

// ===== Load Goals =====
let goals = [];

// Try Electron preload API first, else fallback to localStorage
if (window.goalsAPI?.readGoals) {
  goals = window.goalsAPI.readGoals() || [];
} else {
  const saved = localStorage.getItem("goals");
  goals = saved ? JSON.parse(saved) : [];
}

// ===== Render All Goals =====
function renderGoals() {
  goalBoard.innerHTML = "";
  goals.forEach(goal => {
    createGoalElement(goal);
  });
}

// ===== Create Goal Note Element =====
function createGoalElement(goal) {
  const note = document.createElement("div");
  note.className = "goal-note";
  note.style.top = goal.top || "40px";
  note.style.left = goal.left || "40px";
  note.style.width = goal.width || "250px";
  note.style.height = goal.height || "180px";
  note.dataset.id = goal.id;

  note.innerHTML = `
    <input type="text" class="title" placeholder="Goal Title" value="${goal.title || ""}">
    <textarea class="description" placeholder="Goal Description">${goal.description || ""}</textarea>
    <input type="date" value="${goal.date || ""}">
    <div class="resizer"></div>
  `;

  goalBoard.appendChild(note);

  // Attach drag + resize
  makeDraggable(note);
  makeResizable(note);

  // Save when inputs change
  const titleInput = note.querySelector(".title");
  const descInput = note.querySelector(".description");
  const dateInput = note.querySelector('input[type="date"]');

  titleInput.addEventListener("input", () => saveGoal(note));
  descInput.addEventListener("input", () => saveGoal(note));
  dateInput.addEventListener("change", () => saveGoal(note));
}

// ===== Add New Goal =====
addGoalBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const newGoal = {
    id: Date.now(),
    title: "",
    description: "",
    date: "",
    top: "40px",
    left: "40px",
    width: "250px",
    height: "180px"
  };

  goals.push(newGoal);
  saveAllGoals();
  createGoalElement(newGoal);
});

// ===== Save Single Goal =====
function saveGoal(note) {
  const id = Number(note.dataset.id);
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  goal.title = note.querySelector(".title").value;
  goal.description = note.querySelector(".description").value;
  goal.date = note.querySelector('input[type="date"]').value;
  goal.top = note.style.top;
  goal.left = note.style.left;
  goal.width = note.style.width;
  goal.height = note.style.height;

  saveAllGoals();
}

// ===== Save All Goals =====
function saveAllGoals() {
  if (window.goalsAPI?.saveGoals) {
    window.goalsAPI.saveGoals(goals);
  } else {
    localStorage.setItem("goals", JSON.stringify(goals));
  }
}

// ===== Dragging =====
function makeDraggable(note) {
  let isDragging = false, offsetX, offsetY;

  note.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resizer") || e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
    isDragging = true;
    offsetX = e.clientX - note.offsetLeft;
    offsetY = e.clientY - note.offsetTop;
    note.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (isDragging) {
      note.style.left = `${e.clientX - offsetX}px`;
      note.style.top = `${e.clientY - offsetY}px`;
      saveGoal(note);
    }
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    note.style.cursor = "grab";
  });
}

// ===== Resizing =====
function makeResizable(note) {
  const resizer = note.querySelector(".resizer");
  let isResizing = false, startX, startY, startW, startH;

  resizer.addEventListener("mousedown", (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startW = note.offsetWidth;
    startH = note.offsetHeight;
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (isResizing) {
      const newW = startW + (e.clientX - startX);
      const newH = startH + (e.clientY - startY);
      note.style.width = `${Math.max(200, newW)}px`;
      note.style.height = `${Math.max(150, newH)}px`;
      saveGoal(note);
    }
  });

  window.addEventListener("mouseup", () => {
    isResizing = false;
  });
}

// ===== Banner Options =====
const bannerColor = document.getElementById("bannerColor");
const bannerImage = document.getElementById("bannerImage");
const bannerType = document.getElementsByName("bannerType");
const banner = document.querySelector(".goals-banner");

bannerColor.addEventListener("input", () => {
  if (bannerType[0].checked) {
    banner.style.background = bannerColor.value;
    banner.style.backgroundImage = "";
  }
});

bannerImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    banner.style.backgroundImage = `url(${url})`;
    banner.style.backgroundSize = "cover";
    banner.style.backgroundPosition = "center";
  }
});

bannerType.forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.value === "color") {
      banner.style.background = bannerColor.value;
      banner.style.backgroundImage = "";
    } else {
      bannerImage.click();
    }
  });
});

// ===== Initial Render =====
renderGoals();
