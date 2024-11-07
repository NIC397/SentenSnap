
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

    // Search Function
    const searchForm = document.getElementById('search-form');
    const searchInput = document.querySelector('.search-box input');
    const searchResults = document.getElementById('search-results');
    const loader = document.getElementById('loader');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const word = searchInput.value.trim();
        if (word) {
            fetchDefinition(word);
        }
    });

    // 1. Basic 1-sentence Version
    // function fetchDefinition(word) {
    //     searchResults.innerHTML = '';
    //     loader.style.display = 'block';  // Show the loader
    //     fetch('/define', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ word: word }),
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         loader.style.display = 'none';  // Hide the loader
    //         searchResults.innerHTML = `<p><strong>${word}:</strong> ${data.definition}</p>`;
    //     })
    //     .catch(error => {
    //         loader.style.display = 'none';  // Hide the loader
    //         searchResults.innerHTML = 'An error occurred while fetching the definition.';
    //         console.error('Error:', error);
    //     });
    // }

    // 2. Detailed Version
    function fetchDefinition(word) {
    searchResults.innerHTML = 'Searching...';
    fetch('/define', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: word }),
    })
    .then(response => response.json())
    .then(data => {
        let resultHTML = `<h3>${word}</h3>`;
        for (const [key, value] of Object.entries(data)) {
            if (value) {
                resultHTML += `<p><strong>${key}:</strong> ${value}</p>`;
            }
        }
        searchResults.innerHTML = resultHTML;
    })
    .catch(error => {
        searchResults.innerHTML = 'An error occurred while fetching the definition.';
        console.error('Error:', error);
    });
    }

    // Image Generation Function
    const imageGenerationForm = document.getElementById('image-generation-form');
    const imagePromptInput = document.getElementById('image-prompt');
    const generatedImageContainer = document.getElementById('generated-image');

    imageGenerationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const prompt = imagePromptInput.value.trim();
        if (prompt) {
            generateImage(prompt);
        }
    });

    function generateImage(prompt) {
        const imageContainer = document.getElementById('generated-image');
        imageContainer.innerHTML = 'Generating image...';
    
        fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.image) {
                imageContainer.innerHTML = `<img src="data:image/png;base64,${data.image}" alt="Generated Image">`;
            } else if (data.error) {
                imageContainer.innerHTML = data.error;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            imageContainer.innerHTML = 'An error occurred while generating the image.';
        });
    }


});

