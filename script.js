// Global Variables
let currentGoalCount = 3;
const maxGoalCount = 20;
const maxMilestonesPerGoal = 20;
let allGoalsHidden = false; // For "Hide All Goals" toggling

// Audio effects for each goal (predefined for initial goals)
const audioEffects = {
  1: new Audio("sounds/goal1-sound.mp3"),
  2: new Audio("sounds/goal2-sound.mp3"),
  3: new Audio("sounds/goal3-sound.mp3")
};

// Load audio for initial goals
function loadAudioEffects() {
  for (let key in audioEffects) {
    audioEffects[key].load();
  }
}

// Initialize listeners on DOM content load
document.addEventListener("DOMContentLoaded", () => {
  initializeMilestoneListeners();
  initializeToggleButtons();
  loadAudioEffects();
  setupExportImport();
  // Load mini editors for each existing goal
  for (let i = 1; i <= currentGoalCount; i++) {
    loadMiniEditor(i);
  }
  initializeMiniEditorButtons();

  // Add event listener for the Add Goal button
  document.getElementById("add-goal").addEventListener("click", addNewGoal);

  // Existing event listener for General Editor button
  document.getElementById("general-editor-button").addEventListener("click", () => {
    document.querySelector(".general-editor").scrollIntoView({ behavior: "smooth" });
  });

  // Toggle all goals for "Hide All Goals" button
  document.getElementById("hide-all-goals").addEventListener("click", toggleAllGoals);

  // NEW: When "Jump to Goals" is clicked (button inside the General Editor), scroll to the Goals Container
  document.getElementById("jump-to-goals").addEventListener("click", () => {
    document.getElementById("goals-container").scrollIntoView({ behavior: "smooth" });
  });
});

// Add event listeners to all existing milestone checkboxes
function initializeMilestoneListeners() {
  const milestoneCheckboxes = document.querySelectorAll(".milestone");
  milestoneCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateProgressBar(checkbox.dataset.goal);
    });
  });
}

// Toggle buttons for showing/hiding milestone containers, progress bar, and mini editor
function initializeToggleButtons() {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const goalId = button.getAttribute("data-goal");
      const aboveContainer = document.getElementById(`milestones-above-${goalId}`);
      const belowContainer = document.getElementById(`milestones-below-${goalId}`);
      const miniEditor = document.getElementById(`mini-editor-${goalId}`);
      const progressBarContainer = document.querySelector(`#goal${goalId} .progress-bar-container`);

      aboveContainer.classList.toggle("hidden");
      belowContainer.classList.toggle("hidden");
      progressBarContainer.classList.toggle("hidden");
      if (miniEditor) {
        miniEditor.classList.toggle("hidden");
      }
    });
  });
}

// Update progress bar calculation and play sound if applicable
function updateProgressBar(goalNumber) {
  let checkboxes = Array.from(document.querySelectorAll(`.milestone[data-goal="${goalNumber}"]`));
  checkboxes.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
  let total = 0;
  let lastCompleted = true;
  checkboxes.forEach(checkbox => {
    if (lastCompleted && checkbox.checked) {
      total += parseInt(checkbox.value);
      lastCompleted = true;
    } else if (!lastCompleted) {
      checkbox.checked = false;
    } else {
      lastCompleted = false;
    }
  });
  const progressBar = document.getElementById(`progress-bar-${goalNumber}`);
  const progressPercentageDisplay = document.getElementById(`progress-percentage-${goalNumber}`);
  progressBar.style.width = `${total}%`;
  progressPercentageDisplay.textContent = `${total}%`;
  if (total > 0 && audioEffects[goalNumber]) {
    audioEffects[goalNumber].play();
  }
}

// Helper: Add a milestone to a specific goal (used in addNewGoal)
function addMilestoneToGoal(goalNumber, milestoneIndex, value, labelText) {
  const aboveContainer = document.getElementById("milestones-above-" + goalNumber);
  const belowContainer = document.getElementById("milestones-below-" + goalNumber);
  let container = (milestoneIndex % 2 === 1) ? belowContainer : aboveContainer;
  const newLabel = document.createElement("label");
  newLabel.innerHTML = `<input type="checkbox" class="milestone" data-goal="${goalNumber}" data-index="${milestoneIndex}" value="${value}" /> ${labelText}`;
  container.appendChild(newLabel);
  newLabel.querySelector("input").addEventListener("change", () => {
    updateProgressBar(goalNumber);
  });
}

// --- ADD NEW GOAL FUNCTION ---
function addNewGoal() {
  if (currentGoalCount >= maxGoalCount) {
    alert("Maximum number of goals reached.");
    return;
  }
  currentGoalCount++;
  let goalNumber = currentGoalCount;
  const goalsContainer = document.getElementById("goals-container");
  const goalDiv = document.createElement("div");
  goalDiv.className = "goal";
  goalDiv.id = "goal" + goalNumber;
  let toggleBtn = `<button class="toggle-btn" data-goal="${goalNumber}">Toggle Descriptions</button>`;
  goalDiv.innerHTML = 
    `<h2 id="goal-name-${goalNumber}">
      <span class="goal-title">Goal ${goalNumber}</span>
      ${toggleBtn}
    </h2>
    <div class="milestones milestones-above" id="milestones-above-${goalNumber}"></div>
    <div class="progress-bar-container">
      <div class="progress-bar" id="progress-bar-${goalNumber}">
        <span class="progress-percentage" id="progress-percentage-${goalNumber}">0%</span>
      </div>
    </div>
    <div class="milestones milestones-below" id="milestones-below-${goalNumber}"></div>
    <div class="mini-editor" id="mini-editor-${goalNumber}">
      <label for="mini-goal-name-${goalNumber}">Edit Goal Name:</label>
      <input type="text" id="mini-goal-name-${goalNumber}" value="Goal ${goalNumber}">
      <div class="mini-milestone-editor" id="mini-milestone-editor-${goalNumber}"></div>
      <button class="mini-add-milestone" data-goal="${goalNumber}">Add Milestone</button>
      <button class="mini-update-goal" data-goal="${goalNumber}">Update Goal</button>
    </div>`;
  goalsContainer.appendChild(goalDiv);

  // Attach toggle event for new goal
  let newToggle = goalDiv.querySelector(".toggle-btn");
  newToggle.addEventListener("click", () => {
    let goalId = newToggle.getAttribute("data-goal");
    let aboveContainer = document.getElementById("milestones-above-" + goalId);
    let belowContainer = document.getElementById("milestones-below-" + goalId);
    let miniEditor = document.getElementById("mini-editor-" + goalId);
    let progressBarContainer = document.querySelector(`#goal${goalId} .progress-bar-container`);

    aboveContainer.classList.toggle("hidden");
    belowContainer.classList.toggle("hidden");
    progressBarContainer.classList.toggle("hidden");
    if (miniEditor) {
      miniEditor.classList.toggle("hidden");
    }
  });

  // Initialize mini editor for the new goal
  loadMiniEditor(goalNumber);
  // Reinitialize mini editor buttons so the new goal's mini buttons work
  initializeMiniEditorButtons();
}

// MINI EDITOR FUNCTIONS
function loadMiniEditor(goalNumber) {
  const miniMilestoneEditor = document.getElementById("mini-milestone-editor-" + goalNumber);
  if (!miniMilestoneEditor) return;
  miniMilestoneEditor.innerHTML = "";
  let milestones = Array.from(document.querySelectorAll(`.milestone[data-goal="${goalNumber}"]`));
  milestones.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
  milestones.forEach((milestone, index) => {
    const label = document.createElement("label");
    label.textContent = `Milestone ${index + 1} Name:`;
    const input = document.createElement("input");
    input.type = "text";
    input.value = milestone.parentElement.textContent.trim();
    input.dataset.index = milestone.dataset.index;
    input.dataset.goal = goalNumber;
    miniMilestoneEditor.appendChild(label);
    miniMilestoneEditor.appendChild(input);

    const percentLabel = document.createElement("label");
    percentLabel.textContent = `Milestone ${index + 1} Percentage:`;
    const percentInput = document.createElement("input");
    percentInput.type = "number";
    percentInput.value = milestone.value;
    percentInput.dataset.index = milestone.dataset.index;
    percentInput.dataset.goal = goalNumber;
    miniMilestoneEditor.appendChild(percentLabel);
    miniMilestoneEditor.appendChild(percentInput);
  });
  const miniGoalNameInput = document.getElementById("mini-goal-name-" + goalNumber);
  const goalTitleSpan = document.querySelector(`#goal-name-${goalNumber} .goal-title`);
  if (miniGoalNameInput && goalTitleSpan) {
    miniGoalNameInput.value = goalTitleSpan.textContent;
  }
}

function updateMiniGoal(goalNumber) {
  const miniGoalNameInput = document.getElementById("mini-goal-name-" + goalNumber);
  const goalTitleSpan = document.querySelector(`#goal-name-${goalNumber} .goal-title`);
  if (miniGoalNameInput && goalTitleSpan) {
    goalTitleSpan.textContent = miniGoalNameInput.value;
  }
  const miniMilestoneEditor = document.getElementById("mini-milestone-editor-" + goalNumber);
  const inputs = miniMilestoneEditor.querySelectorAll("input");
  for (let i = 0; i < inputs.length; i += 2) {
    let nameInput = inputs[i];
    let percentInput = inputs[i + 1];
    let milestoneIndex = nameInput.dataset.index;
    let checkbox = document.querySelector(`.milestone[data-goal="${goalNumber}"][data-index="${milestoneIndex}"]`);
    if (checkbox) {
      let parent = checkbox.parentElement;
      while (parent.childNodes.length > 1) {
        parent.removeChild(parent.lastChild);
      }
      parent.appendChild(document.createTextNode(" " + nameInput.value));
      checkbox.value = percentInput.value;
    }
  }
  updateProgressBar(goalNumber);
}

function miniAddMilestone(goalNumber) {
  const above = document.getElementById("milestones-above-" + goalNumber);
  const below = document.getElementById("milestones-below-" + goalNumber);
  let countAbove = above.querySelectorAll(".milestone").length;
  let countBelow = below.querySelectorAll(".milestone").length;
  let total = countAbove + countBelow;
  if (total >= maxMilestonesPerGoal) {
    alert("Maximum number of milestones reached for this goal.");
    return;
  }
  let newIndex = total + 1;
  let defaultValue = "10";
  let labelText = "Milestone " + newIndex;
  // Always add to the "below" container for consistency
  const container = below;
  const newLabel = document.createElement("label");
  newLabel.innerHTML = `<input type="checkbox" class="milestone" data-goal="${goalNumber}" data-index="${newIndex}" value="${defaultValue}" /> ${labelText}`;
  container.appendChild(newLabel);
  newLabel.querySelector("input").addEventListener("change", () => {
    updateProgressBar(goalNumber);
  });
  loadMiniEditor(goalNumber);
}

function initializeMiniEditorButtons() {
  const miniAddButtons = document.querySelectorAll(".mini-add-milestone");
  miniAddButtons.forEach(button => {
    // Attach the event listener only once per button
    if (!button.dataset.listenerAttached) {
      button.addEventListener("click", () => {
        let goal = button.getAttribute("data-goal");
        miniAddMilestone(goal);
      });
      button.dataset.listenerAttached = "true";
    }
  });
  const miniUpdateButtons = document.querySelectorAll(".mini-update-goal");
  miniUpdateButtons.forEach(button => {
    if (!button.dataset.listenerAttached) {
      button.addEventListener("click", () => {
        let goal = button.getAttribute("data-goal");
        updateMiniGoal(goal);
      });
      button.dataset.listenerAttached = "true";
    }
  });
}

// GLOBAL EXPORT/IMPORT FUNCTIONS
function setupExportImport() {
  document.getElementById("export-button").onclick = exportData;
  document.getElementById("import-button").addEventListener("change", importData);
  document.getElementById("save-page-title").addEventListener("click", function() {
    const newTitle = document.getElementById("page-title").value;
    document.querySelector("h1").textContent = newTitle;
  });
}

function exportData() {
  const titleHeading = document.querySelector("h1").textContent;
  const goals = [];
  document.querySelectorAll(".goal").forEach((goal) => {
    const goalData = {
      name: goal.querySelector(".goal-title").textContent.trim(),
      milestones: []
    };
    let milestones = Array.from(goal.querySelectorAll(".milestone"));
    milestones.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
    milestones.forEach((milestone) => {
      const milestoneLabel = milestone.parentElement;
      goalData.milestones.push({
        name: milestoneLabel.textContent.trim(),
        completed: milestone.checked,
        value: milestone.value
      });
    });
    goals.push(goalData);
  });
  const data = {
    title: titleHeading,
    goals: goals
  };
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "exported_data.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);
    if (data.title) {
      document.querySelector("h1").textContent = data.title;
      const titleInput = document.getElementById("page-title");
      if (titleInput) titleInput.value = data.title;
    }
    const goalsContainer = document.getElementById("goals-container");
    goalsContainer.innerHTML = "";
    currentGoalCount = 0;
    if (data.goals) {
      data.goals.forEach((goalData) => {
        currentGoalCount++;
        let goalNumber = currentGoalCount;
        const goalDiv = document.createElement("div");
        goalDiv.className = "goal";
        goalDiv.id = "goal" + goalNumber;
        const toggleBtn = `<button class="toggle-btn" data-goal="${goalNumber}">Toggle Descriptions</button>`;
        goalDiv.innerHTML = 
          `<h2 id="goal-name-${goalNumber}">
            <span class="goal-title">${goalData.name}</span>
            ${toggleBtn}
          </h2>
          <div class="milestones milestones-above" id="milestones-above-${goalNumber}"></div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="progress-bar-${goalNumber}">
              <span class="progress-percentage" id="progress-percentage-${goalNumber}">0%</span>
            </div>
          </div>
          <div class="milestones milestones-below" id="milestones-below-${goalNumber}"></div>
          <div class="mini-editor" id="mini-editor-${goalNumber}">
            <label for="mini-goal-name-${goalNumber}">Edit Goal Name:</label>
            <input type="text" id="mini-goal-name-${goalNumber}" value="${goalData.name}">
            <div class="mini-milestone-editor" id="mini-milestone-editor-${goalNumber}"></div>
            <button class="mini-add-milestone" data-goal="${goalNumber}">Add Milestone</button>
            <button class="mini-update-goal" data-goal="${goalNumber}">Update Goal</button>
          </div>`;
        goalsContainer.appendChild(goalDiv);

        // Import saved milestones
        if (goalData.milestones && goalData.milestones.length > 0) {
          goalData.milestones.forEach((milestoneData, mIndex) => {
            let milestoneNumber = mIndex + 1;
            let container;
            if (milestoneNumber % 2 === 1) {
              container = goalDiv.querySelector(".milestones.milestones-below");
            } else {
              container = goalDiv.querySelector(".milestones.milestones-above");
            }
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" class="milestone" data-goal="${goalNumber}" data-index="${milestoneNumber}" value="${milestoneData.value}"> ${milestoneData.name}`;
            if (milestoneData.completed) {
              label.querySelector("input").checked = true;
            }
            container.appendChild(label);
          });
        }

        // Attach toggle button event
        let newToggle = goalDiv.querySelector(".toggle-btn");
        newToggle.addEventListener("click", () => {
          let goalId = newToggle.getAttribute("data-goal");
          let aboveContainer = document.getElementById("milestones-above-" + goalId);
          let belowContainer = document.getElementById("milestones-below-" + goalId);
          let miniEditor = document.getElementById("mini-editor-" + goalId);
          let progressBarContainer = document.querySelector(`#goal${goalId} .progress-bar-container`);

          aboveContainer.classList.toggle("hidden");
          belowContainer.classList.toggle("hidden");
          progressBarContainer.classList.toggle("hidden");
          if (miniEditor) {
            miniEditor.classList.toggle("hidden");
          }
        });

        // Add milestone checkbox listeners
        let checkboxes = goalDiv.querySelectorAll(".milestone");
        checkboxes.forEach(checkbox => {
          checkbox.addEventListener("change", () => {
            updateProgressBar(checkbox.dataset.goal);
          });
        });
      });
      // Reinitialize mini editor buttons and load mini editors for all goals
      for (let i = 1; i <= currentGoalCount; i++) {
        loadMiniEditor(i);
      }
      initializeMiniEditorButtons();
      // After importing all goals, update each progress bar so that the milestones appear correctly.
      for (let i = 1; i <= currentGoalCount; i++) {
        updateProgressBar(i);
      }
    }
  };
  reader.readAsText(file);
}

// 3) Hide/Show All Goals at Once
function toggleAllGoals() {
  allGoalsHidden = !allGoalsHidden;
  // For each goal, forcibly hide or show the progress bar, milestone containers, and mini editor
  document.querySelectorAll(".goal").forEach(goal => {
    let aboveContainer = goal.querySelector(".milestones-above");
    let belowContainer = goal.querySelector(".milestones-below");
    let progressBarContainer = goal.querySelector(".progress-bar-container");
    let miniEditor = goal.querySelector(".mini-editor");
    if (allGoalsHidden) {
      aboveContainer.classList.add("hidden");
      belowContainer.classList.add("hidden");
      progressBarContainer.classList.add("hidden");
      miniEditor.classList.add("hidden");
    } else {
      aboveContainer.classList.remove("hidden");
      belowContainer.classList.remove("hidden");
      progressBarContainer.classList.remove("hidden");
      miniEditor.classList.remove("hidden");
    }
  });
}
