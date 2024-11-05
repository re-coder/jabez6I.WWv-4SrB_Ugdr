// Initialize event listeners for milestone checkboxes and goal editor
document.addEventListener("DOMContentLoaded", () => {
    initializeMilestoneListeners();
    initializeEditor();
});

// Function to initialize milestone listeners for progress calculation
function initializeMilestoneListeners() {
    const milestoneCheckboxes = document.querySelectorAll(".milestone");
    milestoneCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", updateProgressBar);
    });
}

// Function to calculate and update the progress bar for each goal
function updateProgressBar() {
    const goalNumber = this.dataset.goal;
    const progressBar = document.getElementById(`progress-bar-${goalNumber}`);
    const checkboxes = document.querySelectorAll(`.milestone[data-goal="${goalNumber}"]`);
    let total = 0;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            total += parseInt(checkbox.value);
        }
    });

    // Update the progress bar width
    progressBar.style.width = `${total}%`;
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

    // Load milestone values into the editor for the selected goal
    const milestoneEditor = document.getElementById("milestone-editor");
    milestoneEditor.innerHTML = ""; // Clear previous milestones

    const milestones = document.querySelectorAll(`.milestone[data-goal="${selectedGoal}"]`);
    milestones.forEach((milestone, index) => {
        const milestoneValue = milestone.value;

        const milestoneInput = document.createElement("input");
        milestoneInput.type = "number";
        milestoneInput.value = milestoneValue;
        milestoneInput.classList.add("milestone-input");
        milestoneInput.dataset.index = index;
        milestoneInput.dataset.goal = selectedGoal;

        const milestoneLabel = document.createElement("label");
        milestoneLabel.textContent = `Milestone ${index + 1} Value (%):`;
        milestoneLabel.appendChild(milestoneInput);
        milestoneEditor.appendChild(milestoneLabel);
    });
}
// Function to update goal and milestone data based on editor inputs
function updateGoalData() {
    const selectedGoal = document.getElementById("goal-select").value;

    // Update the goal name
    const goalNameInput = document.getElementById("goal-name").value;
    document.getElementById(`goal-name-${selectedGoal}`).textContent = goalNameInput;

    // Update each milestone's percentage value
    const milestoneInputs = document.querySelectorAll(".milestone-input");
    milestoneInputs.forEach(input => {
        const milestoneIndex = input.dataset.index;
        const milestoneCheckbox = document.querySelectorAll(`.milestone[data-goal="${selectedGoal}"]`)[milestoneIndex];
        milestoneCheckbox.value = input.value;
    });

    // Reset progress calculation based on new values
    updateProgressBar.call(document.querySelector(`.milestone[data-goal="${selectedGoal}"]`));
}
