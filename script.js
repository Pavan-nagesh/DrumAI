// Map each drum key to its corresponding audio file
const sounds = {
  w: new Audio("sounds/tom-1.mp3"),
  a: new Audio("sounds/tom-2.mp3"),
  s: new Audio("sounds/tom-3.mp3"),
  d: new Audio("sounds/tom-4.mp3"),
  j: new Audio("sounds/snare.mp3"),
  k: new Audio("sounds/kick-bass.mp3"),
  l: new Audio("sounds/crash.mp3")
};

// Select all drum buttons
const buttons = document.querySelectorAll(".drum");

// Elements to display info to user
const displayKey = document.getElementById("display-key");      // Shows last pressed key

const rhythmDisplay = document.getElementById("rhythm-display"); // Shows suggested rhythm pattern

// Control buttons
const suggestBtn = document.getElementById("suggest-rhythm");  // Button to start AI rhythm suggestion

const teachBtn = document.getElementById("teach-mode");        // Button to start AI teaching mode

const stopAllBtn = document.getElementById("stop-all");        // Button to stop any running AI mode

// Extract drum keys from sounds object keys for random rhythm generation
const drumKeys = Object.keys(sounds);

// Control flag to stop any ongoing rhythm or teaching mode
let stopAll = false;

// Add click event listeners to each drum button to play sound on click
buttons.forEach(button => {
  const key = button.innerText.trim(); // Get letter from button text
  button.addEventListener("click", () => handleKey(key));
});

// Listen for keyboard key presses to play drum sounds
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase(); // Convert key to lowercase
  if (sounds[key]) handleKey(key);     // If key corresponds to a drum, play it
});

// Main handler function to play sound, animate button, and update display
function handleKey(key) {
  playSound(key);
  animateButton(key);
  updateDisplayKey(key);
}

// Play sound associated with the given key
function playSound(key) {
  const audio = sounds[key];
  if (audio) {
    audio.currentTime = 0; // Reset audio to start for immediate replay
    audio.play();
  }
}

// Animate the button by adding/removing the 'pressed' CSS class briefly
function animateButton(key) {
  const button = document.querySelector("." + key);
  if (!button) return;

  button.classList.add("pressed");
  setTimeout(() => button.classList.remove("pressed"), 100);
}

// Update the display to show which key was pressed or action performed
function updateDisplayKey(key) {
  displayKey.textContent = `You pressed: ${key.toUpperCase()}`;
}

// Generate a random rhythm pattern of given length
// 70% chance to pick a drum key, 30% chance to rest ("-")
function generateRhythmPattern(length = 8) {
  const pattern = [];
  for (let i = 0; i < length; i++) {
    if (Math.random() < 0.7) {
      pattern.push(drumKeys[Math.floor(Math.random() * drumKeys.length)]);
    } else {
      pattern.push("-");
    }
  }
  return pattern;
}

// Convert rhythm pattern array into a formatted string for display
// Replace "-" with an en-dash for visual clarity
function patternToString(pattern) {
  return pattern.map(k => (k === "-" ? "–" : k.toUpperCase())).join(" ");
}

// Play a rhythm pattern step-by-step with a specified interval (ms) between beats
// Stops immediately if stopAll is set to true
async function playRhythm(pattern, interval = 400) {
  stopAll = false;
  for (const key of pattern) {
    if (stopAll) {
      displayKey.textContent = "Stopped.";
      break;
    }
    if (key !== "-") {
      playSound(key);
      animateButton(key);
      updateDisplayKey(key);
    } else {
      updateDisplayKey("Rest");
    }
    await sleep(interval); // Wait interval before next beat
  }
  if (!stopAll) updateDisplayKey("Try to play this rhythm!");
}

// Teach rhythm mode: highlights each button in sequence without playing sound
// Highlights the drum button to visually guide user on what to press
async function teachRhythm(pattern, interval = 1000) {
  stopAll = false;
  for (const key of pattern) {
    if (stopAll) {
      displayKey.textContent = "Stopped.";
      break;
    }

    if (key !== "-") {
      const btn = document.querySelector("." + key);
      if (btn) btn.classList.add("teach-highlight"); // Highlight the button
    }

    await sleep(interval);  // Wait interval before next highlight
    // Remove highlight from all buttons before next iteration
    document.querySelectorAll(".drum").forEach(b => b.classList.remove("teach-highlight"));
  }
  if (!stopAll) displayKey.textContent = "Now try this rhythm!";
}

// Utility sleep function to pause execution asynchronously
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Event listener to start rhythm suggestion mode when button clicked
suggestBtn.addEventListener("click", async () => {
  const rhythm = generateRhythmPattern(8);
  rhythmDisplay.textContent = "Suggested rhythm: " + patternToString(rhythm);
  await playRhythm(rhythm);
});

// Event listener to start AI teaching mode when button clicked
teachBtn.addEventListener("click", async () => {
  const rhythm = generateRhythmPattern(8);
  rhythmDisplay.textContent = "Watch and follow the highlights!";
  await teachRhythm(rhythm);
});

// Event listener to stop all ongoing AI modes immediately when stop button clicked
stopAllBtn.addEventListener("click", () => {
  stopAll = true;
});