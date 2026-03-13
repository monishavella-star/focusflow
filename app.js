// --- 0. INTRO SEQUENCE ---
const introScreen = document.getElementById('intro-screen');
const introText = document.getElementById('intro-text');
const mainApp = document.getElementById('main-app');

// You can customize these sentences to whatever motivates you!
const sentences = [
    "Take a deep breath.",
    "Disconnect from the noise.",
    "Find your focus.",
    "Let's begin."
];

let sentenceIndex = 0;

function showNextSentence() {
    if (sentenceIndex < sentences.length) {
        // 1. Set the text and fade it in
        introText.textContent = sentences[sentenceIndex];
        introText.style.opacity = '1';

        // 2. Wait 2.5 seconds, then fade it out
        setTimeout(() => {
            introText.style.opacity = '0';
            sentenceIndex++;
            
            // 3. Wait 1.5 seconds while it's dark, then show the next sentence
            setTimeout(showNextSentence, 1500);
        }, 2500);
    } else {
        // End of sequence: fade out the entire black screen
        introScreen.style.opacity = '0';
        
        // Wait 2 seconds for the black screen to fade, then reveal the app
        setTimeout(() => {
            introScreen.style.display = 'none';
            mainApp.classList.add('visible');
        }, 2000); 
    }
}

// Start the sequence 1 second after the page loads
setTimeout(showNextSentence, 1000);
// --- 1. POMODORO TIMER LOGIC ---
let currentModeTime = 25; // Default to 25 minutes
let timeLeft = currentModeTime * 60;
let timerId = null;

const timeDisplay = document.getElementById('time-display');
const modeBtns = document.querySelectorAll('.mode-btn');

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Handle Mode Switching (Focus, Short Break, Long Break)
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. Remove 'active' styling from all buttons
        modeBtns.forEach(b => b.classList.remove('active'));
        // 2. Add 'active' styling to the clicked button
        btn.classList.add('active');

        // 3. Update the time based on the button clicked
        currentModeTime = parseInt(btn.getAttribute('data-time'));
        timeLeft = currentModeTime * 60;
        updateDisplay();

        // 4. Stop the timer if it was running
        clearInterval(timerId);
        timerId = null;
    });
});

document.getElementById('start-btn').addEventListener('click', () => {
    if (timerId === null) {
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft === 0) {
                clearInterval(timerId);
                alert("Time's up! Great job.");
            }
        }, 1000);
    }
});

document.getElementById('pause-btn').addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
});

document.getElementById('reset-btn').addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    timeLeft = currentModeTime * 60; // Resets to whatever mode is currently selected
    updateDisplay();
    // Handle Custom Time Input
document.getElementById('set-custom-btn').addEventListener('click', () => {
    const customMins = parseInt(document.getElementById('custom-minutes').value);
    
    if (customMins > 0) {
        // 1. Remove 'active' styling from the standard Focus/Break buttons
        modeBtns.forEach(b => b.classList.remove('active'));
        
        // 2. Update the timer with the custom minutes
        currentModeTime = customMins;
        timeLeft = currentModeTime * 60;
        updateDisplay();
        
        // 3. Stop the timer if it was running
        clearInterval(timerId);
        timerId = null;
        
        // 4. Clear the input box so it looks clean
        document.getElementById('custom-minutes').value = '';
    }
});
});

// --- 2. AMBIENT AUDIO LOGIC & DYNAMIC BACKGROUNDS ---
const soundBtns = document.querySelectorAll('.sound-btn');
let currentAudio = null;

// The default background (your original starry mountain)
const defaultBg = "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1920')";

// Your clean dictionary with the exact 3 links you selected
const backgrounds = {
    'rain': "url('https://images.unsplash.com/photo-1532690505755-416f854618da?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    
    'brown': "url('https://images.unsplash.com/photo-1535905748047-14b2415c77d5?q=80&w=1150&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    
    'lofi': "url('https://images.unsplash.com/photo-1721456289938-cff65ad81034?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
};

// Set the default background when the app loads
document.body.style.backgroundImage = defaultBg;
document.body.style.transition = "background-image 0.8s ease-in-out"; // Smooth fade effect

soundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const soundType = btn.getAttribute('data-sound').toLowerCase();
        const audioToPlay = document.getElementById(`${soundType}-audio`);

        // If clicking the currently playing sound, pause it and reset background
        if (currentAudio === audioToPlay && !currentAudio.paused) {
            currentAudio.pause();
            btn.classList.remove('active');
            document.body.style.backgroundImage = defaultBg; // Go back to default
            return;
        }

        // Pause any currently playing sound before starting a new one
        if (currentAudio) {
            currentAudio.pause();
            soundBtns.forEach(b => b.classList.remove('active'));
        }

        // Play the selected sound, highlight the button, AND change the background
        if (audioToPlay) {
            audioToPlay.play().catch(err => console.log("Audio blocked by browser:", err));
            currentAudio = audioToPlay;
            btn.classList.add('active');

            // This line changes the background dynamically:
            document.body.style.backgroundImage = backgrounds[soundType];
        }
    });
});

// --- 3. TASK MANAGER WITH LOCAL STORAGE ---
const taskInput = document.getElementById('new-task');
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');

// Load tasks from LocalStorage on startup
let tasks = JSON.parse(localStorage.getItem('focusTasks')) || [];

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.onclick = () => {
            tasks.splice(index, 1);
            saveAndRender();
        };
        
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function saveAndRender() {
    localStorage.setItem('focusTasks', JSON.stringify(tasks));
    renderTasks();
}

addTaskBtn.addEventListener('click', () => {
    if (taskInput.value.trim() !== '') {
        tasks.push(taskInput.value.trim());
        taskInput.value = '';
        saveAndRender();
    }
});

// Initialize the app
updateDisplay();
renderTasks();
// --- 4. FOCUS ANALYTICS ---
const dailyStatsDisplay = document.getElementById('daily-stats');

// Load saved minutes from LocalStorage, default to 0 if none exist
let totalFocusMinutes = parseInt(localStorage.getItem('focusMinutes')) || 0;
dailyStatsDisplay.textContent = totalFocusMinutes;

function addFocusTime(minutes) {
    totalFocusMinutes += minutes;
    localStorage.setItem('focusMinutes', totalFocusMinutes); 
    dailyStatsDisplay.textContent = totalFocusMinutes; 
    updateChart(); // <--- ADD THIS LINE
}
// --- 5. DATA VISUALIZATION (CHART.JS) ---
const ctx = document.getElementById('focusChart').getContext('2d');

// We'll use some dummy data for the past week to make the portfolio look good,
// and append today's live data at the end!
let pastWeekData = [45, 120, 30, 90, 60, 150]; // Minutes studied Mon-Sat
let fullWeekData = [...pastWeekData, totalFocusMinutes]; // Add today (Sunday)

let focusChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
        datasets: [{
            label: 'Focus Minutes',
            data: fullWeekData,
            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Frosted white bars
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderWidth: 1,
            borderRadius: 5 // Rounded aesthetic edges
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)' // Very faint grid lines
                },
                ticks: { color: '#ffffff' }
            },
            x: {
                grid: { display: false }, // Hide vertical grid lines for a cleaner look
                ticks: { color: '#ffffff' }
            }
        },
        plugins: {
            legend: { display: false } // Hide the legend to save space
        }
    }
});

// Update the chart dynamically when a new session finishes
function updateChart() {
    focusChart.data.datasets[0].data[6] = totalFocusMinutes; // Update 'Today'
    focusChart.update(); // Redraw the chart smoothly
}
// --- 6. ZEN MODE (FULLSCREEN API) ---
const zenModeBtn = document.getElementById('zen-mode-btn');

zenModeBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
        zenModeBtn.textContent = '✖ Exit Zen Mode';
    } else {
        // Exit fullscreen
        document.exitFullscreen();
        zenModeBtn.textContent = '⛶ Zen Mode';
    }
});