document.querySelectorAll('.milestone').forEach(checkbox => {
    checkbox.addEventListener('change', handleMilestoneCheck);
});

document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', toggleDescriptions);
});

function handleMilestoneCheck(event) {
    const milestone = event.target;
    const goalId = milestone.getAttribute('data-goal');
    const milestoneValue = parseInt(milestone.value, 10);
    const progressBar = document.getElementById(`progress-bar-${goalId}`);
    const progressText = document.createElement('span');

    // Ensure sequential completion
    if (!isSequential(milestone)) {
        alert("Complete milestones in order.");
        milestone.checked = false;
        return;
    }

    updateProgress(goalId);
    playSound(); // Play sound effect when a milestone is checked
}

// Ensure milestones are completed in sequence
function isSequential(milestone) {
    const goalId = milestone.getAttribute('data-goal');
    const milestones = document.querySelectorAll(`.milestone[data-goal="${goalId}"]`);
    const index = Array.from(milestones).indexOf(milestone);

    for (let i = 0; i < index; i++) {
        if (!milestones[i].checked) {
            return false;
        }
    }
    return true;
}

function updateProgress(goalId) {
    const progressBar = document.getElementById(`progress-bar-${goalId}`);
    const milestones = document.querySelectorAll(`.milestone[data-goal="${goalId}"]`);
    const progressText = progressBar.querySelector('.progress-percentage') || document.createElement('span');

    let total = 0;
    milestones.forEach(milestone => {
        if (milestone.checked) {
            total += parseInt(milestone.value, 10);
        }
    });
    
    total = Math.min(total, 100); // Cap the progress at 100%
    progressBar.style.width = `${total}%`;

    // Update percentage display
    progressText.className = 'progress-percentage';
    progressText.textContent = `${total}%`;
    progressBar.appendChild(progressText);
}

function toggleDescriptions(event) {
    const goalId = event.target.getAttribute('data-goal');
    const milestones = document.getElementById(`milestones-${goalId}`);

    if (milestones.style.display === 'none') {
        milestones.style.display = 'flex';
    } else {
        milestones.style.display = 'none';
    }
}

// Function to play sound on milestone check
function playSound() {
    const audio = new Audio('https://example.com/sci-fi-sound.mp3'); // Replace with a URL of a sci-fi sound effect
    audio.play();
}
