document.querySelectorAll('.milestone').forEach(checkbox => {
    checkbox.addEventListener('change', handleMilestoneCheck);
});

document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', toggleDescriptions);
});

function handleMilestoneCheck(event) {
    const milestone = event.target;
    const goalId = milestone.getAttribute('data-goal');

    if (!isSequential(milestone)) {
        alert("Complete milestones in order.");
        milestone.checked = false;
        return;
    }

    updateProgress(goalId);
    playSound();
}

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
    
    total = Math.min(total, 100);
    progressBar.style.width = `${total}%`;

    progressText.className = 'progress-percentage';
    progressText.textContent = `${total}%`;
    progressBar.appendChild(progressText);
}

function toggleDescriptions(event) {
    const goalId = event.target.getAttribute('data-goal');
    const milestones = document.getElementById(`milestones-${goalId}`);
    milestones.style.display = (milestones.style.display === 'none') ? 'flex' : 'none';
}

function playSound() {
    const audio = new Audio('https://example.com/sci-fi-sound.mp3'); // Replace with a sci-fi sound URL
    audio.play();
}
