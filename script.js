// Global Variables
let currentGoalCount = 3;
const maxGoalCount = 20;
const maxMilestonesPerGoal = 20;

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

// Toggle buttons for showing/hiding milestone containers and mini editor
function initializeToggleButtons() {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const goalId = button.getAttribute("data-goal");
      const aboveContainer = document.getElementById(`milestones-above-${goalId}`);
      const belowContainer = document.getElementById(`milestones-below-${goalId}`);
      const miniEditor = document.getElementById(`mini-editor-${goalId}`);
      aboveContainer.classList.toggle("hidden");
      belowContainer.classList.toggle("hidden");
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

// --- MINI EDITOR FUNCTIONS ---

// Load the mini editor for a specific goal
function loadMiniEditor(goalNumber) {
  const miniMilestoneEditor = document.getElementById("mini-milestone-editor-" + goalNumber);
  if (!miniMilestoneEditor) return;
  miniMilestoneEditor.innerHTML = "";
  // Get milestones for this goal and sort them
  let milestones = Array.from(document.querySelectorAll(`.milestone[data-goal="${goalNumber}"]`));
  milestones.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
  milestones.forEach((milestone, index) => {
    // Create input field for milestone name
    const label = document.createElement("label");
    label.textContent = `Milestone ${index + 1} Name:`;
    const input = document.createElement("input");
    input.type = "text";
    // Use the text from the milestone’s parent label (trim the checkbox text)
    input.value = milestone.parentElement.textContent.trim();
    input.dataset.index = milestone.dataset.index;
    input.dataset.goal = goalNumber;
    miniMilestoneEditor.appendChild(label);
    miniMilestoneEditor.appendChild(input);
    // Create input field for milestone percentage
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
  // Also update the mini goal name field
  const miniGoalNameInput = document.getElementById("mini-goal-name-" + goalNumber);
  const goalTitleSpan = document.querySelector(`#goal-name-${goalNumber} .goal-title`);
  if (miniGoalNameInput && goalTitleSpan) {
    miniGoalNameInput.value = goalTitleSpan.textContent;
  }
}

// Update the goal and milestones from the mini editor inputs
function updateMiniGoal(goalNumber) {
  // Update goal title
  const miniGoalNameInput = document.getElementById("mini-goal-name-" + goalNumber);
  const goalTitleSpan = document.querySelector(`#goal-name-${goalNumber} .goal-title`);
  if (miniGoalNameInput && goalTitleSpan) {
    goalTitleSpan.textContent = miniGoalNameInput.value;
  }
  // Update milestones from mini editor fields
  const miniMilestoneEditor = document.getElementById("mini-milestone-editor-" + goalNumber);
  const inputs = miniMilestoneEditor.querySelectorAll("input");
  // Process inputs in pairs (name and percentage)
  for (let i = 0; i < inputs.length; i += 2) {
    let nameInput = inputs[i];
    let percentInput = inputs[i + 1];
    let milestoneIndex = nameInput.dataset.index;
    let checkbox = document.querySelector(`.milestone[data-goal="${goalNumber}"][data-index="${milestoneIndex}"]`);
    if (checkbox) {
      let parent = checkbox.parentElement;
      // Remove existing text nodes (except the checkbox) and append updated name
      while (parent.childNodes.length > 1) {
        parent.removeChild(parent.lastChild);
      }
      parent.appendChild(document.createTextNode(" " + nameInput.value));
      // Update the checkbox value (percentage)
      checkbox.value = percentInput.value;
    }
  }
  updateProgressBar(goalNumber);
}

// Add a new milestone for a specific goal from its mini editor
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
  let container = (newIndex % 2 === 1) ? below : above;
  const newLabel = document.createElement("label");
  newLabel.innerHTML = `<input type="checkbox" class="milestone" data-goal="${goalNumber}" data-index="${newIndex}" value="${defaultValue}" /> ${labelText}`;
  container.appendChild(newLabel);
  newLabel.querySelector("input").addEventListener("change", () => {
    updateProgressBar(goalNumber);
  });
  loadMiniEditor(goalNumber);
}

// Initialize mini editor button event listeners (for all current mini editors)
function initializeMiniEditorButtons() {
  const miniAddButtons = document.querySelectorAll(".mini-add-milestone");
  miniAddButtons.forEach(button => {
    button.addEventListener("click", () => {
      let goal = button.getAttribute("data-goal");
      miniAddMilestone(goal);
    });
  });
  const miniUpdateButtons = document.querySelectorAll(".mini-update-goal");
  miniUpdateButtons.forEach(button => {
    button.addEventListener("click", () => {
      let goal = button.getAttribute("data-goal");
      updateMiniGoal(goal);
    });
  });
}

// --- GLOBAL EXPORT/IMPORT FUNCTIONS ---

function setupExportImport() {
  document.getElementById("export-button").onclick = exportData;
  document.getElementById("import-button").addEventListener("change", importData);
  // New event listener for saving page title from general editor
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
        goalDiv.innerHTML = `
          <h2 id="goal-name-${goalNumber}">
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
          </div>
        `;
        goalsContainer.appendChild(goalDiv);
        // Attach toggle button event
        let newToggle = goalDiv.querySelector(".toggle-btn");
        newToggle.addEventListener("click", () => {
          let goalId = newToggle.getAttribute("data-goal");
          let aboveContainer = document.getElementById("milestones-above-" + goalId);
          let belowContainer = document.getElementById("milestones-below-" + goalId);
          let miniEditor = document.getElementById("mini-editor-" + goalId);
          aboveContainer.classList.toggle("hidden");
          belowContainer.classList.toggle("hidden");
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
