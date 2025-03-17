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
  initializeEditor();
  initializeToggleButtons();
  loadAudioEffects();
  setupImportExportButtons();

  // Listener for "Add New Goal" button
  document.getElementById("add-goal").addEventListener("click", addNewGoal);
  // Listener for "Add Milestone" button
  document.getElementById("add-milestone").addEventListener("click", addMilestone);

  // Title editing listener
  const titleInput = document.getElementById("page-title");
  const titleHeading = document.querySelector("h1");
  titleInput.addEventListener("input", function () {
    titleHeading.textContent = titleInput.value || "The steward's Responsibilities";
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

// Add event listeners to all toggle buttons (for hiding/showing milestone containers)
function initializeToggleButtons() {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const goalId = button.getAttribute("data-goal");
      const aboveContainer = document.getElementById(`milestones-above-${goalId}`);
      const belowContainer = document.getElementById(`milestones-below-${goalId}`);
      aboveContainer.classList.toggle("hidden");
      belowContainer.classList.toggle("hidden");
    });
  });
}

// Update progress bar by sorting milestones (by data-index) and calculating total
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

// Helper: Add a milestone to a specific goal with a given index, value, and label
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

// Create and append a new goal (up to maxGoalCount)
function addNewGoal() {
  if (currentGoalCount >= maxGoalCount) {
    alert("Maximum number of goals reached.");
    return;
  }
  currentGoalCount++;
  const goalNumber = currentGoalCount;
  const goalDiv = document.createElement("div");
  goalDiv.className = "goal";
  goalDiv.id = "goal" + goalNumber;
  goalDiv.innerHTML = `
    <h2 id="goal-name-${goalNumber}">
      Goal ${goalNumber} <button class="toggle-btn" data-goal="${goalNumber}">Toggle Descriptions</button>
    </h2>
    <div class="milestones milestones-above" id="milestones-above-${goalNumber}"></div>
    <div class="progress-bar-container">
      <div class="progress-bar" id="progress-bar-${goalNumber}">
        <span class="progress-percentage" id="progress-percentage-${goalNumber}">0%</span>
      </div>
    </div>
    <div class="milestones milestones-below" id="milestones-below-${goalNumber}"></div>
  `;
  document.getElementById("goals-container").appendChild(goalDiv);

  // Attach toggle functionality for the new goal
  const newToggle = goalDiv.querySelector(".toggle-btn");
  newToggle.addEventListener("click", () => {
    const goalId = newToggle.getAttribute("data-goal");
    const aboveContainer = document.getElementById(`milestones-above-${goalId}`);
    const belowContainer = document.getElementById(`milestones-below-${goalId}`);
    aboveContainer.classList.toggle("hidden");
    belowContainer.classList.toggle("hidden");
  });

  // Add default 3 milestones (milestone 1 & 3 go below; milestone 2 goes above)
  addMilestoneToGoal(goalNumber, 1, "33", "Milestone 1");
  addMilestoneToGoal(goalNumber, 2, "66", "Milestone 2");
  addMilestoneToGoal(goalNumber, 3, "100", "Milestone 3");

  // Update the goal select dropdown in the editor
  const goalSelect = document.getElementById("goal-select");
  const newOption = document.createElement("option");
  newOption.value = goalNumber;
  newOption.textContent = "Goal " + goalNumber;
  goalSelect.appendChild(newOption);

  // Optionally, add a default audio effect for the new goal if none exists
  if (!audioEffects[goalNumber]) {
    audioEffects[goalNumber] = new Audio("sounds/goal1-sound.mp3");
    audioEffects[goalNumber].load();
  }
}

// Add a new milestone to the currently selected goal (up to maxMilestonesPerGoal)
function addMilestone() {
  const selectedGoal = document.getElementById("goal-select").value;
  const aboveContainer = document.getElementById("milestones-above-" + selectedGoal);
  const belowContainer = document.getElementById("milestones-below-" + selectedGoal);
  const countAbove = aboveContainer.querySelectorAll(".milestone").length;
  const countBelow = belowContainer.querySelectorAll(".milestone").length;
  const totalMilestones = countAbove + countBelow;
  if (totalMilestones >= maxMilestonesPerGoal) {
    alert("Maximum number of milestones reached for this goal.");
    return;
  }
  const newMilestoneNumber = totalMilestones + 1;
  const defaultValue = "10";
  const milestoneLabelText = "Milestone " + newMilestoneNumber;
  let container = (newMilestoneNumber % 2 === 1) ? belowContainer : aboveContainer;
  const newLabel = document.createElement("label");
  newLabel.innerHTML = `<input type="checkbox" class="milestone" data-goal="${selectedGoal}" data-index="${newMilestoneNumber}" value="${defaultValue}" /> ${milestoneLabelText}`;
  container.appendChild(newLabel);
  newLabel.querySelector("input").addEventListener("change", () => {
    updateProgressBar(selectedGoal);
  });
  loadGoalData();
}

// Editor initialization: load and update goal data in the editor
function initializeEditor() {
  const goalSelect = document.getElementById("goal-select");
  const updateGoalButton = document.getElementById("update-goal");
  goalSelect.addEventListener("change", loadGoalData);
  updateGoalButton.addEventListener("click", updateGoalData);
  loadGoalData();
}

// Load goal and milestone data into the editor (sorted by data-index)
function loadGoalData() {
  const selectedGoal = document.getElementById("goal-select").value;
  const goalName = document.getElementById(`goal-name-${selectedGoal}`).textContent;
  document.getElementById("goal-name").value = goalName;
  const milestoneEditor = document.getElementById("milestone-editor");
  milestoneEditor.innerHTML = "";
  let milestones = Array.from(document.querySelectorAll(`.milestone[data-goal="${selectedGoal}"]`));
  milestones.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
  milestones.forEach((milestone, index) => {
    const milestoneName = milestone.parentElement.textContent.trim();
    const milestoneValue = milestone.value;
    const milestoneLabel = document.createElement("label");
    milestoneLabel.textContent = `Milestone ${index + 1} Name:`;
    const milestoneInput = document.createElement("input");
    milestoneInput.type = "text";
    milestoneInput.value = milestoneName;
    milestoneInput.classList.add("milestone-input");
    milestoneInput.dataset.index = milestone.dataset.index;
    milestoneInput.dataset.goal = selectedGoal;
    const milestoneValueLabel = document.createElement("label");
    milestoneValueLabel.textContent = `Milestone ${index + 1} Percentage:`;
    const milestoneValueInput = document.createElement("input");
    milestoneValueInput.type = "number";
    milestoneValueInput.value = milestoneValue;
    milestoneValueInput.classList.add("milestone-value-input");
    milestoneValueInput.dataset.index = milestone.dataset.index;
    milestoneValueInput.dataset.goal = selectedGoal;
    milestoneLabel.appendChild(milestoneInput);
    milestoneValueLabel.appendChild(milestoneValueInput);
    milestoneEditor.appendChild(milestoneLabel);
    milestoneEditor.appendChild(milestoneValueLabel);
  });
}

// Update goal and milestone data based on editor inputs
function updateGoalData() {
  const selectedGoal = document.getElementById("goal-select").value;
  const goalNameInput = document.getElementById("goal-name").value;
  document.getElementById(`goal-name-${selectedGoal}`).textContent = goalNameInput;
  
  let milestoneInputs = Array.from(document.querySelectorAll(`.milestone-input[data-goal="${selectedGoal}"]`));
  milestoneInputs.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
  let milestoneValueInputs = Array.from(document.querySelectorAll(`.milestone-value-input[data-goal="${selectedGoal}"]`));
  milestoneValueInputs.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
  
  milestoneInputs.forEach((input, index) => {
    const milestoneIndex = input.dataset.index;
    let checkbox = document.querySelector(`.milestone[data-goal="${selectedGoal}"][data-index="${milestoneIndex}"]`);
    if (checkbox) {
      // Update the parent label’s text (replace the text node) while keeping the checkbox intact.
      checkbox.parentElement.innerText = input.value;
      checkbox.parentElement.insertBefore(checkbox, checkbox.parentElement.firstChild);
      const milestoneValue = milestoneValueInputs[index].value;
      checkbox.value = milestoneValue;
    }
  });
  updateProgressBar(selectedGoal);
}

// Setup export and import button event listeners
function setupImportExportButtons() {
  document.getElementById("export-button").onclick = exportData;
  document.getElementById("import-button").addEventListener("change", importData);
}

// Export all data (goals and milestones) to a JSON file
function exportData() {
  const titleHeading = document.querySelector("h1").textContent;
  const goals = [];
  document.querySelectorAll(".goal").forEach((goal) => {
    const goalData = {
      name: goal.querySelector("h2").textContent.trim(),
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

// Import data from a JSON file and rebuild the goals and milestones
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
    const goalSelect = document.getElementById("goal-select");
    goalSelect.innerHTML = "";
    currentGoalCount = 0;
    if (data.goals) {
      data.goals.forEach((goalData) => {
        currentGoalCount++;
        const goalNumber = currentGoalCount;
        const goalDiv = document.createElement("div");
        goalDiv.className = "goal";
        goalDiv.id = "goal" + goalNumber;
        const toggleBtn = `<button class="toggle-btn" data-goal="${goalNumber}">Toggle Descriptions</button>`;
        goalDiv.innerHTML = `
          <h2 id="goal-name-${goalNumber}">${goalData.name} ${toggleBtn}</h2>
          <div class="milestones milestones-above" id="milestones-above-${goalNumber}"></div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="progress-bar-${goalNumber}">
              <span class="progress-percentage" id="progress-percentage-${goalNumber}">0%</span>
            </div>
          </div>
          <div class="milestones milestones-below" id="milestones-below-${goalNumber}"></div>
        `;
        const aboveContainer = goalDiv.querySelector(".milestones.milestones-above");
        const belowContainer = goalDiv.querySelector(".milestones.milestones-below");
        goalData.milestones.forEach((milestoneData, mIndex) => {
          const milestoneNumber = mIndex + 1;
          let container = (milestoneNumber % 2 === 1) ? belowContainer : aboveContainer;
          const label = document.createElement("label");
          label.innerHTML = `<input type="checkbox" class="milestone" data-goal="${goalNumber}" data-index="${milestoneNumber}" value="${milestoneData.value}"> ${milestoneData.name}`;
          if(milestoneData.completed) {
            label.querySelector("input").checked = true;
          }
          container.appendChild(label);
        });
        goalsContainer.appendChild(goalDiv);
        const newToggle = goalDiv.querySelector(".toggle-btn");
        newToggle.addEventListener("click", () => {
          const goalId = newToggle.getAttribute("data-goal");
          const aboveContainer = document.getElementById(`milestones-above-${goalId}`);
          const belowContainer = document.getElementById(`milestones-below-${goalId}`);
          aboveContainer.classList.toggle("hidden");
          belowContainer.classList.toggle("hidden");
        });
        let checkboxes = goalDiv.querySelectorAll(".milestone");
        checkboxes.forEach(checkbox => {
          checkbox.addEventListener("change", () => {
            updateProgressBar(checkbox.dataset.goal);
          });
        });
        const newOption = document.createElement("option");
        newOption.value = goalNumber;
        newOption.textContent = "Goal " + goalNumber;
        goalSelect.appendChild(newOption);
        updateProgressBar(goalNumber);
      });
    }
  };
  reader.readAsText(file);
}
