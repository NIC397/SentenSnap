document.addEventListener('DOMContentLoaded', function() {
    
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

    function disableAllButtons() {
        searchButton.disabled = true;
        console.log('Disabled all buttons');
    }

    function enableAllButtons() {
        searchButton.disabled = false;
        console.log('Enabled all buttons');
    }

    function fetchDefinition(word) {
        searchResults.style.display = 'block'; // Make the results visible
        searchResults.innerHTML = '';
        const { bar, text } = createProgressBar(searchResults);
        disableAllButtons();

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
            enableAllButtons();
        });
    }

    const searchForm = document.getElementById('search-form');
    const searchInput = document.querySelector('.search-box input');
    const searchResults = document.getElementById('search-results');
    const searchButton = document.getElementById('search-button');
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const word = searchInput.value.trim();
        if (word) {
            fetchDefinition(word);
        }
    });
});