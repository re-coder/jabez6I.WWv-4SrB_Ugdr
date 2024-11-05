document.querySelectorAll('.milestone').forEach(checkbox => {
    checkbox.addEventListener('change', updateProgress);
});

document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', toggleDescriptions);
});

function toggleDescriptions(event) {
    const goalId = event.target.getAttribute('data-goal');
    const milestones = document.getElementById(`milestones-${goalId}`);

    if (milestones.style.display === 'none') {
        milestones.style.display = 'flex'; // Show if currently hidden
    } else {
        milestones.style.display = 'none'; // Hide if currently shown
    }
}

function updateProgress(event) {
    const goalId = event.target.getAttribute('data-goal');
    const progressBar = document.getElementById(`progress-bar-${goalId}`);
    const milestones = document.querySelectorAll(`.milestone[data-goal="${goalId}"]`);
    
    let targetWidth = 0;
    milestones.forEach(milestone => {
        if (milestone.checked) {
            targetWidth += parseInt(milestone.value, 10);
        }
    });
    targetWidth = Math.min(targetWidth, 100);

    let currentWidth = parseFloat(progressBar.style.width) || 0;
    const step = targetWidth > currentWidth ? 1 : -1;

    const interval = setInterval(() => {
        currentWidth += step;
        progressBar.style.width = `${currentWidth}%`;

        if ((step > 0 && currentWidth >= targetWidth) || (step < 0 && currentWidth <= targetWidth)) {
            clearInterval(interval);
            progressBar.style.width = `${targetWidth}%`;
        }
    }, 10);
}
