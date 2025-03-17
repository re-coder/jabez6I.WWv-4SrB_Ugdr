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

  // Add listener for new goal button
  document.getElementById("add-goal").addEventListener("click", addNewGoal);
  // Add listener for new milestone button
  document.getElementById("add-milestone").addEventListener("click", addMilestone);

  // Update title editing listener
  const titleInput = document.getElementById("page-title");
  const titleHeading = document.querySelector("h1");
  titleInput.addEventListener("input", function () {
    titleHeading.textContent = titleInput.value || "The steward's Responsibilities";
  });
});

// Function to add event listeners to milestone checkboxes (for initial goals)
function initializeMilestoneListeners() {
  const milestoneCheckboxes = document.querySelectorAll(".milestone");
  milestoneCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateProgressBar(checkbox.dataset.goal);
    });
  });
}

// Function to add event listeners to toggle buttons (for initial goals)
function initializeToggleButtons() {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const goalId = button.getAttribute("data-goal");
      const milestones = document.getElementById(`milestones-${goalId}`);
      milestones.classList.toggle("hidden");
    });
  });
}

// Update progress bar calculation and play sound if applicable
function updateProgressBar(goalNumber) {
  const progressBar = document.getElementById(`progress-bar-${goalNumber}`);
  const progressPercentageDisplay = document.getElementById(`progress-percentage-${goalNumber}`);
  const checkboxes = document.querySelectorAll(`.milestone[data-goal="${goalNumber}"]`);
  let total = 0;
  let lastCompleted = true;
  
  checkboxes.forEach((checkbox, index) => {
    if (lastCompleted && checkbox.checked) {
      total += parseInt(checkbox.value);
      lastCompleted = true;
    } else if (!lastCompleted) {
      checkbox.checked = false;
    } else {
      lastCompleted = false;
    }
  });
  
  progressBar.style.width = `${total}%`;
  progressPercentageDisplay.textContent = `${total}%`;
  
  if (total > 0 && audioEffects[goalNumber]) {
    audioEffects[goalNumber].play();
  }
}

// Function to create and append a new goal (up to maxGoalCount)
function addNewGoal() {
  if (currentGoalCount >= maxGoalCount) {
    alert("Maximum number of goals reached.");
    return;
  }
  currentGoalCount++;
  const goalNumber = currentGoalCount;

  // Create new goal element with default 3 milestones
  const goalDiv = document.createElement("div");
  goalDiv.className = "goal";
  goalDiv.id = "goal" + goalNumber;
  goalDiv.innerHTML = `
    <h2 id="goal-name-${goalNumber}">
      Goal ${goalNumber} <button class="toggle-btn" data-goal="${goalNumber}">Toggle Descriptions</button>
    </h2>
    <div class="progress-bar-container">
      <div class="progress-bar" id="progress-bar-${goalNumber}">
        <span class="progress-percentage" id="progress-percentage-${goalNumber}">0%</span>
      </div>
    </div>
    <div class="milestones" id="milestones-${goalNumber}">
      <label><input type="checkbox" class="milestone" data-goal="${goalNumber}" value="33" /> Milestone 1</label>
      <label><input type="checkbox" class="milestone" data-goal="${goalNumber}" value="66" /> Milestone 2</label>
      <label><input type="checkbox" class="milestone" data-goal="${goalNumber}" value="100" /> Milestone 3</label>
    </div>
  `;
  document.getElementById("goals-container").appendChild(goalDiv);

  // Add event listeners for new goal's checkboxes and toggle button
  const newCheckboxes = goalDiv.querySelectorAll(".milestone");
  newCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateProgressBar(checkbox.dataset.goal);
    });
  });
  const newToggle = goalDiv.querySelector(".toggle-btn");
  newToggle.addEventListener("click", () => {
    const goalId = newToggle.getAttribute("data-goal");
    const milestones = document.getElementById(`milestones-${goalId}`);
    milestones.classList.toggle("hidden");
  });

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

// Function to add a new milestone to the currently selected goal (up to maxMilestonesPerGoal)
function addMilestone() {
  const selectedGoal = document.getElementById("goal-select").value;
  const milestoneContainer = document.getElementById("milestones-" + selectedGoal);
  const currentMilestones = milestoneContainer.querySelectorAll(".milestone");
  
  if (currentMilestones.length >= maxMilestonesPerGoal) {
    alert("Maximum number of milestones reached for this goal.");
    return;
  }
  
  const newMilestoneNumber = currentMilestones.length + 1;
  const defaultValue = "10"; // default percentage value for new milestone
  
  // Create new milestone label with checkbox
  const newLabel = document.createElement("label");
  newLabel.innerHTML = `<input type="checkbox" class="milestone" data-goal="${selectedGoal}" value="${defaultValue}" /> Milestone ${newMilestoneNumber}`;
  
  // Append the new milestone to the container
  milestoneContainer.appendChild(newLabel);
  
  // Add event listener for the new checkbox
  newLabel.querySelector("input").addEventListener("change", () => {
    updateProgressBar(selectedGoal);
  });
  
  // Refresh the editor's milestone view for the selected goal
  loadGoalData();
}

// Editor initialization: load and update goal data in the editor
function initializeEditor() {
  const goalSelect = document.getElementById("goal-select");
  const goalNameInput = document.getElementById("goal-name");
  const milestoneEditor = document.getElementById("milestone-editor");
  const updateGoalButton = document.getElementById("update-goal");

  goalSelect.addEventListener("change", loadGoalData);
  updateGoalButton.addEventListener("click", updateGoalData);

  // Load initial data for the selected goal
  loadGoalData();
}

// Load goal and milestone data into the editor fields based on selection
function loadGoalData() {
  const selectedGoal = document.getElementById("goal-select").value;
  const goalName = document.getElementById(`goal-name-${selectedGoal}`).textContent;
  document.getElementById("goal-name").value = goalName;

  // Load milestone names and percentages for the selected goal
  const milestoneEditor = document.getElementById("milestone-editor");
  milestoneEditor.innerHTML = "";
  const milestones = document.querySelectorAll(`.milestone[data-goal="${selectedGoal}"]`);
  milestones.forEach((milestone, index) => {
    const milestoneName = milestone.parentElement.textContent.trim();
    const milestoneValue = milestone.value;

    const milestoneLabel = document.createElement("label");
    milestoneLabel.textContent = `Milestone ${index + 1} Name:`;

    const milestoneInput = document.createElement("input");
    milestoneInput.type = "text";
    milestoneInput.value = milestoneName;
    milestoneInput.classList.add("milestone-input");
    milestoneInput.dataset.index = index;
    milestoneInput.dataset.goal = selectedGoal;

    const milestoneValueLabel = document.createElement("label");
    milestoneValueLabel.textContent = `Milestone ${index + 1} Percentage:`;

    const milestoneValueInput = document.createElement("input");
    milestoneValueInput.type = "number";
    milestoneValueInput.value = milestoneValue;
    milestoneValueInput.classList.add("milestone-value-input");
    milestoneValueInput.dataset.index = index;
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

  const milestoneInputs = document.querySelectorAll(".milestone-input");
  const milestoneValueInputs = document.querySelectorAll(".milestone-value-input");
  
  milestoneInputs.forEach((input, index) => {
    const milestoneIndex = input.dataset.index;
    const milestoneCheckbox = document.querySelectorAll(`.milestone[data-goal="${selectedGoal}"]`)[milestoneIndex];
    const milestoneLabel = milestoneCheckbox.parentElement;
    milestoneLabel.childNodes[1].textContent = input.value;
    const milestoneValue = milestoneValueInputs[index].value;
    milestoneCheckbox.value = milestoneValue;
  });

  updateProgressBar(selectedGoal);
}

// Setup export and import button event listeners
function setupImportExportButtons() {
  document.getElementById("export-button").onclick = exportData;
  document.getElementById("import-button").addEventListener("change", importData);
}

// Enhanced Export Function: exports title and all goals dynamically
function exportData() {
  const titleHeading = document.querySelector("h1").textContent;
  const goals = [];
  document.querySelectorAll(".goal").forEach((goal, index) => {
    const goalData = {
      name: goal.querySelector("h2").textContent.trim(),
      milestones: []
    };
    goal.querySelectorAll(".milestone").forEach((milestone, mIndex) => {
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

// Enhanced Import Function: imports data and recreates goals accordingly
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);
    
    // Update title
    if (data.title) {
      document.querySelector("h1").textContent = data.title;
      const titleInput = document.getElementById("page-title");
      if (titleInput) titleInput.value = data.title;
    }
    
    // Clear current goals and goal selector
    const goalsContainer = document.getElementById("goals-container");
    goalsContainer.innerHTML = "";
    const goalSelect = document.getElementById("goal-select");
    goalSelect.innerHTML = "";
    currentGoalCount = 0;
    
    if (data.goals) {
      data.goals.forEach((goalData, index) => {
        currentGoalCount++;
        const goalNumber = currentGoalCount;
        const goalDiv = document.createElement("div");
        goalDiv.className = "goal";
        goalDiv.id = "goal" + goalNumber;
        const toggleBtn = `<button class="toggle-btn" data-goal="${goalNumber}">Toggle Descriptions</button>`;
        goalDiv.innerHTML = `
          <h2 id="goal-name-${goalNumber}">${goalData.name} ${toggleBtn}</h2>
          <div class="progress-bar-container">
            <div class="progress-bar" id="progress-bar-${goalNumber}">
              <span class="progress-percentage" id="progress-percentage-${goalNumber}">0%</span>
            </div>
          </div>
          <div class="milestones" id="milestones-${goalNumber}"></div>
        `;
        const milestonesDiv = goalDiv.querySelector(".milestones");
        goalData.milestones.forEach((milestoneData, mIndex) => {
          const label = document.createElement("label");
          label.innerHTML = `<input type="checkbox" class="milestone" data-goal="${goalNumber}" value="${milestoneData.value}"> ${milestoneData.name}`;
          if(milestoneData.completed) {
            label.querySelector("input").checked = true;
          }
          milestonesDiv.appendChild(label);
        });
        goalsContainer.appendChild(goalDiv);

        // Add event listeners for new goal's checkboxes and toggle button
        const newCheckboxes = goalDiv.querySelectorAll(".milestone");
        newCheckboxes.forEach(checkbox => {
          checkbox.addEventListener("change", () => {
            updateProgressBar(checkbox.dataset.goal);
          });
        });
        const newToggle = goalDiv.querySelector(".toggle-btn");
        newToggle.addEventListener("click", () => {
          const goalId = newToggle.getAttribute("data-goal");
          const milestones = document.getElementById(`milestones-${goalId}`);
          milestones.classList.toggle("hidden");
        });

        // Add option to the goal-select dropdown
        const newOption = document.createElement("option");
        newOption.value = goalNumber;
        newOption.textContent = "Goal " + goalNumber;
        goalSelect.appendChild(newOption);

        // Update progress bar
        updateProgressBar(goalNumber);
      });
    }
  };
  reader.readAsText(file);
}
