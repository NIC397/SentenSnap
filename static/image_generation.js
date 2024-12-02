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

    function generateImage(prompt) {
        const imageContainer = document.getElementById('image-page-result');
        imageContainer.innerHTML = '';
        const { bar, text } = createProgressBar(imageContainer);
        generateButton.disabled = true;

        let progress = 0;
        const interval = setInterval(() => {
            progress += 100 / 30;
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
                imageContainer.innerHTML = `<p>${data.error}</p>`;
            }
        })
        .catch(error => {
            clearInterval(interval);
            console.error('Error:', error);
            imageContainer.innerHTML = 'An error occurred while generating the image.';
        })
        .finally(() => {
            generateButton.disabled = false;
        });
    }

    const imageGenerationForm = document.getElementById('image-page-form');
    const imagePromptInput = document.getElementById('image-page-prompt');
    const generateButton = document.querySelector('#image-page-form button');

    imageGenerationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const prompt = imagePromptInput.value.trim();
        const style = document.getElementById('style-select').value; // Get selected style
        if (prompt) {
            const styledPrompt = style === 'ink' 
                ? 'Draw a Chinese ink painting describing: ' + prompt 
                : 'Draw a vibrant cartoon style picture of: ' + prompt; // Modify based on selected style
            generateImage(styledPrompt);
        }
    });
});