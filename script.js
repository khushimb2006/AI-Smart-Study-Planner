
let subjects = JSON.parse(localStorage.getItem("studySubjects")) || [];
let studyPlan = JSON.parse(localStorage.getItem("studyPlan")) || [];

// Save data
function saveData() {
  localStorage.setItem("studySubjects", JSON.stringify(subjects));
  localStorage.setItem("studyPlan", JSON.stringify(studyPlan));
}

// Add a subject
function addSubject() {
  const name = document.getElementById("subject").value.trim();
  const hours = Number(document.getElementById("hours").value);
  const difficulty = Number(document.getElementById("difficulty").value);
  const examDate = document.getElementById("examDate").value;

  if (!name || !hours || !difficulty || !examDate) {
    alert("Please fill all the fields!");
    return;
  }

  if (hours < 1 || hours > 12) {
    alert("Study hours must be between 1 and 12.");
    return;
  }

  if (new Date(examDate + "T00:00:00") < new Date(new Date().toDateString())) {
    alert("Please choose a future exam date.");
    return;
  }

  const subject = {
    id: Date.now(),
    name: name,
    hours: hours,
    difficulty: difficulty,
    examDate: examDate
  };

  subjects.push(subject);

  // Clear old plan when subjects change
  studyPlan = [];

  saveData();
  renderSubjects();

  document.getElementById("subject").value = "";
  document.getElementElementById?.("hours");
  document.getElementById("hours").value = "";
  document.getElementById("difficulty").value = "";
  document.getElementById("examDate").value = "";
}

// Remove a subject
function deleteSubject(id) {
  subjects = subjects.filter(subject => subject.id !== id);
  studyPlan = [];

  saveData();
  renderSubjects();
}

// Display subjects
function renderSubjects() {
  const list = document.getElementById("subjectList");

  if (subjects.length === 0) {
    list.innerHTML = '<p class="empty">No subjects added yet.</p>';
    return;
  }

  list.innerHTML = subjects.map(subject => `
    <div class="subject-item">
      <div>
        <strong>${escapeHTML(subject.name)}</strong>
        <small>
          ${subject.hours} hours |
          ${difficultyName(subject.difficulty)} |
          Exam: ${formatDate(subject.examDate)}
        </small>
      </div>
      <button class="delete-btn" onclick="deleteSubject(${subject.id})">Delete</button>
    </div>
  `).join("");
}

// Convert difficulty to text
function difficultyName(value) {
  if (value == 1) return "Easy";
  if (value == 2) return "Medium";
  return "Hard";
}

// Format date
function formatDate(date) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// Calculate priority
function calculatePriority(subject) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exam = new Date(subject.examDate + "T00:00:00");
  const daysLeft = Math.max(1, Math.ceil((exam - today) / (1000 * 60 * 60 * 24)));

  // Higher difficulty and closer exam = higher priority
  const urgency = 30 / daysLeft;
  const score = (Number(subject.difficulty) * 2) + urgency;

  return score;
}

// Generate smart study plan
function generatePlan() {
  if (subjects.length === 0) {
    alert("Add subjects before generating your study plan!");
    return;
  }

  // Sort subjects based on AI priority score
  const sortedSubjects = [...subjects].sort(
    (a, b) => calculatePriority(b) - calculatePriority(a)
  );

  studyPlan = [];

  sortedSubjects.forEach(subject => {
    // Split study hours into 1-hour sessions
    for (let i = 1; i <= subject.hours; i++) {
      studyPlan.push({
        id: Date.now() + Math.random(),
        subjectId: subject.id,
        subject: subject.name,
        session: i,
        total: subject.hours,
        completed: false,
        priority: calculatePriority(subject)
      });
    }
  });

  renderPlan();
  saveData();
}

// Display study plan
function renderPlan() {
  const plan = document.getElementById("plan");

  if (studyPlan.length === 0) {
    plan.innerHTML = '<p class="empty">Your plan will appear here.</p>';
    updateProgress();
    return;
  }

  plan.innerHTML = studyPlan.map((item, index) => `
    <div class="plan-item">
      <h3>${index + 1}. ${escapeHTML(item.subject)}</h3>
      <p>Study Session ${item.session} of ${item.total} · ${item.session} hour(s)</p>
      <label>
        <input type="checkbox"
          ${item.completed ? "checked" : ""}
          onchange="toggleSession(${index})">
        Mark as completed
      </label>
    </div>
  `).join("");

  updateProgress();
}

// Mark session complete
function toggleSession(index) {
  studyPlan[index].completed = !studyPlan[index].completed;
  saveData();
  renderPlan();
}

// Update progress bar
function updateProgress() {
  const total = studyPlan.length;
  const completed = studyPlan.filter(item => item.completed).length;

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("progressText").textContent =
    percentage + "% Completed";

  document.getElementById("sessionText").textContent =
    completed + " / " + total + " sessions";

  document.getElementById("progressFill").style.width = percentage + "%";
}

// Prevent HTML injection in subject names
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// Load saved data
renderSubjects();
renderPlan();
