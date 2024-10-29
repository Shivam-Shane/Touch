/*--------------------
Vars
--------------------*/
let progress = 6
let startX = 0
let active = 0
let isDown = false

/*--------------------
Contants
--------------------*/
const speedWheel = 0.05
const speedDrag = -0.1

/*--------------------
Get Z
--------------------*/
const getZindex = (array, index) => (array.map((_, i) => (index === i) ? array.length : array.length - Math.abs(index - i)))

/*--------------------
Items
--------------------*/
const $items = document.querySelectorAll('.carousel-item')
const $cursors = document.querySelectorAll('.cursor')

const displayItems = (item, index, active) => {
  const zIndex = getZindex([...$items], active)[index]
  item.style.setProperty('--zIndex', zIndex)
  item.style.setProperty('--active', (index-active)/$items.length)
}

/*--------------------
Animate
--------------------*/
const animate = () => {
  progress = Math.max(0, Math.min(progress, 100))
  active = Math.floor(progress/100*($items.length-1))
  
  $items.forEach((item, index) => displayItems(item, index, active))
}
animate()

/*--------------------
Click on Items
--------------------*/
$items.forEach((item, i) => {
  item.addEventListener('click', () => {
    progress = (i/$items.length) * 100 + 10
    animate()
  })
})

/*--------------------
Handlers
--------------------*/
const handleWheel = e => {
  const wheelProgress = e.deltaY * speedWheel
  progress = progress + wheelProgress
  animate()
}

const handleMouseMove = (e) => {
  if (e.type === 'mousemove') {
    $cursors.forEach(($cursor) => {
      $cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    })
  }
  if (!isDown) return
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0
  const mouseProgress = (x - startX) * speedDrag
  progress = progress + mouseProgress
  startX = x
  animate()
}

const handleMouseDown = e => {
  isDown = true
  startX = e.clientX || (e.touches && e.touches[0].clientX) || 0
}

const handleMouseUp = () => {
  isDown = false
}
let showAuthModalOnLoad = true;
/*--------------------
Listeners
--------------------*/
document.addEventListener('mousewheel', handleWheel)
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mouseup', handleMouseUp)
document.addEventListener('touchstart', handleMouseDown)
document.addEventListener('touchmove', handleMouseMove)
document.addEventListener('touchend', handleMouseUp)
document.addEventListener('DOMContentLoaded', () => {
    const sessionStorageKey = 'accessBlocked';

    if (isBlocked() && sessionStorage.getItem(sessionStorageKey) !== 'false') {
        showTimer();
        // Set the flag to false when access is blocked
        showAuthModalOnLoad = false;
        // Store in session storage to persist state across page reloads
        sessionStorage.setItem(sessionStorageKey, 'false');
    } else if (showAuthModalOnLoad) {
        showModal(); // Show authentication box only if access is not blocked and the flag is true
    }
});

/*--------------------
Authentication Modal
--------------------*/
const predefinedCodes = ['shane', 'shiva', 'pilla', 'kaju','12'];
let incorrectAttempts = 0;
const maxAttempts = 10;
const blockDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
const localStorageKey = 'blockTimestamp';

function showModal() {
    const authCodeInput = document.getElementById('authCode');
    const isAccessBlocked = isBlocked();

    if (isAccessBlocked) {
        showTimer();
    } else {
        document.getElementById('customModal').style.display = 'block';
        document.getElementById('timer').style.display = 'none';
    }

    // Disable the input box if access is blocked
    authCodeInput.disabled = isAccessBlocked;
}
function closeModal() {
    document.getElementById('customModal').style.display = 'none';
    document.getElementById('timer').style.display = 'none';
}
const audio = document.getElementById('audioPlayer');

function checkCode() {
    const userCode = document.getElementById('authCode').value;

    if (isBlocked()) {
        // Access is blocked, show a message
        document.getElementById('authError').innerText = 'Access blocked. Try again later.';
        document.getElementById('authError').style.display = 'block';
        showTimer();
        return;
    }

    if (predefinedCodes.includes(userCode)) {
        // Correct code, show the content
        document.getElementById('pageContent').style.display = 'block';
        
        closeModal();

         // Play audio automatically on successful authentication
         audio.play().catch((error) => {
            console.log('Autoplay was prevented. User interaction may be needed.');
        });

        resetAttempts();
    } else {
        // Incorrect code
        incorrectAttempts++;

        if (incorrectAttempts >= maxAttempts) {
            // Block access after reaching the maximum attempts
            blockAccess();
            return;
        }

        document.getElementById('authError').innerText = `Incorrect code. ${maxAttempts - incorrectAttempts} attempts left.`;
        document.getElementById('authError').style.display = 'block';
    }
}

function isBlocked() {
    const blockTimestamp = localStorage.getItem(localStorageKey);
    if (blockTimestamp) {
        const remainingTime = blockDuration - (Date.now() - parseInt(blockTimestamp, 10));
        return remainingTime > 0;
    }
    return false;
}

function blockAccess() {
    const currentTimestamp = Date.now();
    localStorage.setItem(localStorageKey, currentTimestamp.toString());
    document.getElementById('authError').innerText = 'Access blocked.';
    document.getElementById('authError').style.display = 'block';
    showTimer(currentTimestamp);
    setTimeout(() => {
        closeModal();
        resetAttempts();
    }, blockDuration);
}

function resetAttempts() {
    incorrectAttempts = 0;
    // Do not remove localStorageKey to keep the timestamp for the next session
}

function showTimer() {
    const timerElement = document.getElementById('timer');
    const authCodeInput = document.getElementById('authCode');
    const blockTimestamp = localStorage.getItem(localStorageKey);

    // Disable the input box when the timer starts or access is blocked
    authCodeInput.disabled = true;

    if (blockTimestamp && isBlocked()) {
        timerElement.style.display = 'block';

        function updateTimer() {
            const remainingTime = blockDuration - (Date.now() - parseInt(blockTimestamp, 10));

            if (remainingTime > 0) {
                const minutes = Math.floor(remainingTime / (60 * 1000));
                const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
                timerElement.innerText = `Access will be unlocked in ${minutes} minutes and ${seconds} seconds.`;
                setTimeout(updateTimer, 1000);
            } else {
                timerElement.style.display = 'none';
                // Re-enable the input box when the timer ends
                authCodeInput.disabled = false;
            }
        }

        updateTimer();
    } else {
        timerElement.style.display = 'none';
    }
}

// Confetti function
function launchConfetti() {
    confetti({
        particleCount: 1100,
        spread: 100,
        drift: 0.1,
        origin: { x: 0.8, y: 0.5 } // Adjust this to control the confetti position

    });
}

// Click on surprise button images
let currentImageIndex = 0;
let cycleCount = 0; // Counter for cycle repetitions
const maxCycles = 3; // Limit to 3 repetitions
const images = document.querySelectorAll('.image');

function showImages() {
    
    // Add a 1-second delay before triggering the confetti effect
    setTimeout(() => {
        launchConfetti();
    }, 100);

    // Start showing images
    displayNextImage();
}

function displayNextImage() {
    //Hide the previous image if it's not the first one
    if (currentImageIndex > 0) {
        images[currentImageIndex - 1].classList.add('hidden'); // Fade out previous image
    }

    // Show current image
    images[currentImageIndex].classList.remove('hidden'); // Fade in current image
    images[currentImageIndex].style.display = 'block';

    // Move to the next image after some time
    setTimeout(() => {
        // Fade out current image after showing it for 2 seconds
        images[currentImageIndex].classList.add('hidden'); // Start fading out

        currentImageIndex++;

        if (currentImageIndex < images.length) {
            setTimeout(displayNextImage, 1000); // Wait for the fade out to complete
        } else {
             // One cycle completed, reset index
            currentImageIndex = 0; 
            cycleCount++; // Increase cycle count
            if (cycleCount < maxCycles) {
                 // Restart the cycle if cycle count is less than maxCycles
                 setTimeout(displayNextImage, 1000); // Pause before restarting the cycle
            }
            else {
            // Stop cycling if maxCycles reached
            console.log("Image cycle completed 3 times. Stopping.");
            }
        }
    }, 2000); // Show each image for 2 seconds
}



// Function to create and animate hearts
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');

    // Array of different emojis
    const emojis = ["❤️", "💖", "💜", "💙", "💚", "💛", "🧡", "💗", "💓", "💞","😘","💕","💖","🫠","🤍","😍","🤎","🩵","💚","🩶","🫶","🫶"," "];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]; // Randomly select an emoji

    heart.innerHTML = randomEmoji;

    // Randomize position
    const x = Math.random() * window.innerWidth;
    heart.style.left = `${x}px`;

    // Randomize animation duration
    const duration = Math.random() * 10 + 5; // 15s to 10s
    heart.style.animationDuration = `${duration}s`;

    // Randomize starting position
    heart.style.top = `${window.innerHeight}px`;

    // Append heart to the container
    document.getElementById('floatingHearts').appendChild(heart);

    // Remove heart after animation is complete
    heart.addEventListener('animationend', () => {
        heart.remove();
    });
}

// Generate multiple hearts
const heartCount = 100; // Change this value for more or fewer hearts
for (let i = 0; i < heartCount; i++) {
    createHeart();
}

// Create a new heart every milisecond
setInterval(createHeart, 100); // Adjust the interval as needed
