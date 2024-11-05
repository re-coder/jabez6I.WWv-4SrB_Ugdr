// Initialize event listeners for milestone checkboxes, toggle buttons, and editor
document.addEventListener("DOMContentLoaded", () => {
    initializeMilestoneListeners();
    initializeEditor();
    initializeToggleButtons();
    loadAudioEffects();
    setupImportExportButtons();
});

// Sound effects for each goal
const audioEffects = {
    1: new Audio("sounds/goal1-sound.mp3"),
    2: new Audio("sounds/goal2-sound.mp3"),
    3: new Audio("sounds/goal3-sound.mp3")
};

// Function to load audio effects for each goal
function loadAudioEffects() {
    for (let key in audioEffects) {
        audioEffects[key].load();
    }
}

// Function to initialize milestone listeners for progress calculation
function initializeMilestoneListeners() {
    const milestoneCheckboxes = document.querySelectorAll(".milestone");
    milestoneCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            updateProgressBar(checkbox.dataset.goal);
        });
    });
}

// Function to toggle milestone visibility
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

// Function to calculate and update the progress bar for each goal
function updateProgressBar(goalNumber) {
    const progressBar = document.getElementById(`progress-bar-${goalNumber}`);
    const progressPercentageDisplay = document.getElementById(`progress-percentage-${goalNumber}`);
    const checkboxes = document.querySelectorAll(`.milestone[data-goal="${goalNumber}"]`);
    let total = 0;

    // Enforce sequential milestone completion
    let lastCompleted = true;
    checkboxes.forEach((checkbox, index) => {
        if (lastCompleted && checkbox.checked) {
            total += parseInt(checkbox.value);
            lastCompleted = true;
        } else if (!lastCompleted) {
            checkbox.checked = false; // Uncheck milestones if previous ones are not completed
        } else {
            lastCompleted = false;
        }
    });

    // Update the progress bar width and percentage display
    progressBar.style.width = `${total}%`;
    progressPercentageDisplay.textContent = `${total}%`;

    // Play corresponding sound effect
    if (total > 0) {
        audioEffects[goalNumber].play();
    }
}

// Function to initialize the editor section for editing goals
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

// Function to load data into the editor fields based on the selected goal
function loadGoalData() {
    const selectedGoal = document.getElementById("goal-select").value;
    const goalName = document.getElementById(`goal-name-${selectedGoal}`).textContent;
    document.getElementById("goal-name").value = goalName;

    // Load milestone names and percentages into the editor for the selected goal
    const milestoneEditor = document.getElementById("milestone-editor");
    milestoneEditor.innerHTML = ""; // Clear previous milestones

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

// Function to update goal and milestone data based on editor inputs
function updateGoalData() {
    const selectedGoal = document.getElementById("goal-select").value;

    // Update the goal name
    const goalNameInput = document.getElementById("goal-name").value;
    document.getElementById(`goal-name-${selectedGoal}`).textContent = goalNameInput;

    // Update each milestone's name and percentage value
    const milestoneInputs = document.querySelectorAll(".milestone-input");
    const milestoneValueInputs = document.querySelectorAll(".milestone-value-input");
    
    milestoneInputs.forEach((input, index) => {
        const milestoneIndex = input.dataset.index;
        const milestoneCheckbox = document.querySelectorAll(`.milestone[data-goal="${selectedGoal}"]`)[milestoneIndex];
        const milestoneLabel = milestoneCheckbox.parentElement;

        // Update the milestone name
        milestoneLabel.childNodes[1].textContent = input.value;

        // Update the milestone percentage value
        const milestoneValue = milestoneValueInputs[index].value;
        milestoneCheckbox.value = milestoneValue;
    });

    // Reset progress calculation to reflect any updates
    updateProgressBar(selectedGoal);
}

// Function to set up export and import buttons
function setupImportExportButtons() {
    const exportButton = document.getElementById("export-button");
    const importButton = document.getElementById("import-button");

    exportButton.addEventListener("click", exportData);
    importButton.addEventListener("change", importData);
}

// Export goal and milestone data to a .txt file
function exportData() {
    const data = { goals: [] };

    for (let i = 1; i <= 3; i++) {
        const goalName = document.getElementById(`goal-name-${i}`).textContent;
        const milestones = Array.from(document.querySelectorAll(`.milestone[data-goal="${i}"]`)).map((milestone, index) => ({
            name: milestone.parentElement.textContent.trim(),
            value: milestone.value
        }));
        data.goals.push({ goalName, milestones });
    }

    const textContent = JSON.stringify(data, null, 2);
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "saved_data.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Import goal and milestone data from a .txt file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            data.goals.forEach((goal, goalIndex) => {
                const goalNumber = goalIndex + 1;
                document.getElementById(`goal-name-${goalNumber}`).textContent = goal.goalName;
                goal.milestones.forEach((milestone, milestoneIndex) => {
                    const milestoneCheckbox = document.querySelectorAll(`.milestone[data-goal="${goalNumber}"]`)[milestoneIndex];
                    milestoneCheckbox.value = milestone.value;
                    const milestoneLabel = milestoneCheckbox.parentElement;
                    milestoneLabel.childNodes[1].textContent = milestone.name;
                });
            });
        } catch (error) {
            alert("Invalid file format. Please upload a valid JSON .txt file.");
        }
    };
    reader.readAsText(file);
}
