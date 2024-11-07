
// Version 1: placeholder details
document.addEventListener('DOMContentLoaded', function() {

    const sentenceContainer = document.getElementById('sentence-container');
    const words = sentenceContainer.textContent.split(' ');
    
    sentenceContainer.innerHTML = words.map(word => 
        `<span class="clickable-word">${word}</span>`
    ).join(' ');


    // Update current date
    function updateCurrentDate() {
        const currentDate = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        document.getElementById('current-date').textContent = formattedDate;
    }
    updateCurrentDate();

    // Function to close all detail boxes
    function closeAllDetailBoxes() {
        const detailBoxes = document.querySelectorAll('.details-box');
        detailBoxes.forEach(box => box.remove());
    }

    // Event listener for clicks on words
    sentenceContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('clickable-word')) {
            e.stopPropagation(); // Prevent this click from immediately closing the box
            closeAllDetailBoxes(); // Close any open detail boxes
            
            const detailsBox = e.target.querySelector('.details-box');
            
            if (!detailsBox) {
                const newDetailsBox = document.createElement('span');
                newDetailsBox.className = 'details-box';
                newDetailsBox.textContent = 'This is the detailed definition of the word';
                e.target.appendChild(newDetailsBox);
            }
        }
    });

    // Event listener for clicks anywhere on the document
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.clickable-word')) {
            closeAllDetailBoxes();
        }
    });

    // Progress Bar
    function createProgressBar(container) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        
        progressContainer.appendChild(progressBar);
        container.appendChild(progressContainer);
        container.appendChild(progressText);
        
        return { bar: progressBar, text: progressText };
    }

    function updateProgress(progressBar, progressText, progress) {
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            progressText.textContent = "Just a Second...";
        } else {
            progressText.textContent = `${Math.round(progress)}% Complete`;
        }
    }

    // Search Function
    const searchForm = document.getElementById('search-form');
    const searchInput = document.querySelector('.search-box input');
    const searchResults = document.getElementById('search-results');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const word = searchInput.value.trim();
        if (word) {
            fetchDefinition(word);
        }
    });

    // Get references to the buttons
    const searchButton = document.getElementById('search-button');
    const generateButton = document.getElementById('generate-button');

    // Fetch word definition
    function fetchDefinition(word) {
        searchResults.style.display = 'block'; // Make the results visible
        searchResults.innerHTML = '';
        const { bar, text } = createProgressBar(searchResults);
        searchButton.disabled = true;
        generateButton.disabled = true;

        let progress = 0;
        const interval = setInterval(() => {
            progress += 100 / 30; // Increment progress every 500ms for 15 seconds
            if (progress > 100) progress = 100;
            updateProgress(bar, text, progress);
        }, 500);

        fetch('/define', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word: word }),
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(interval);
            let resultHTML = `<h3>${word}</h3>`;
                for (const [key, value] of Object.entries(data)) {
                    if (value) {
                        resultHTML += `<p><strong>${key}:</strong> ${value}</p>`;
                    }
                }
            searchResults.innerHTML = resultHTML;
        })
        .catch(error => {
            clearInterval(interval);
            searchResults.innerHTML = 'An error occurred while fetching the definition.';
            console.error('Error:', error);
        })
        .finally(() => {
            searchButton.disabled = false;
            generateButton.disabled = false;
        });
    }

    // // Image Generation Function
    const imageGenerationForm = document.getElementById('image-generation-form');
    const imagePromptInput = document.getElementById('image-prompt');

    imageGenerationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const prompt = imagePromptInput.value.trim();
        if (prompt) {
            generateImage(prompt);
        }
    });

    // Update the generateImage function
    function generateImage(prompt) {
        const imageContainer = document.getElementById('generated-image');
        imageContainer.innerHTML = '';
        const { bar, text } = createProgressBar(imageContainer);
        searchButton.disabled = true;
        generateButton.disabled = true;

        let progress = 0;
        const interval = setInterval(() => {
            progress += 100 / 30; // Increment progress every 500ms for 15 seconds
            if (progress > 100) progress = 100;
            updateProgress(bar, text, progress);
        }, 500);

        fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(interval);
            if (data.image) {
                imageContainer.innerHTML = `<img src="data:image/png;base64,${data.image}" alt="Generated Image">`;
            } else if (data.error) {
                imageContainer.innerHTML = data.error;
            }
        })
        .catch(error => {
            clearInterval(interval);
            console.error('Error:', error);
            imageContainer.innerHTML = 'An error occurred while generating the image.';
        })
        .finally(() => {
            searchButton.disabled = false;
            generateButton.disabled = false;
        });
    }

    // function generateImage(prompt) {
    //     const imageContainer = document.getElementById('generated-image');
    //     imageContainer.innerHTML = 'Generating image...';
    
    //     fetch('/generate-image', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ prompt: prompt }),
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.image) {
    //             imageContainer.innerHTML = `<img src="data:image/png;base64,${data.image}" alt="Generated Image">`;
    //         } else if (data.error) {
    //             imageContainer.innerHTML = data.error;
    //         }
    //     })
    //     .catch(error => {
    //         console.error('Error:', error);
    //         imageContainer.innerHTML = 'An error occurred while generating the image.';
    //     });
    // }


});

