
document.addEventListener('DOMContentLoaded', function() {

    console.log('App start running');

    // Function 1: Update Date
    function updateCurrentDate() {
        const currentDate = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        document.getElementById('current-date').textContent = formattedDate;
    }

    // Function 2a: disable all buttons
    function disableAllButtons() {
        refreshButton.disabled = true;
        styleSelect.disabled = true;
        generateImageBtn.disabled = true;
        console.log('Disabled all buttons');
    }

    // Function 2b: enable all buttons
    function enableAllButtons() {
        refreshButton.disabled = false;
        styleSelect.disabled = false;
        generateImageBtn.disabled = false;
        console.log('Enabled all buttons');
    }

    // Function 3a: make words clickable
    function makeWordsClickable() {
        const quoteTextElement = document.getElementById('quote-text');
        if (quoteTextElement) {
          const words = quoteTextElement.textContent.split(' ');
          quoteTextElement.innerHTML = words.map(word => `<span class="clickable-word">${word}</span>`).join(' ');
        } else {
          console.error('Quote text element not found');
        }
    }

    // Function 3b: show word snapshot when clicked
    function showSnapShot(word) {
        disableAllButtons();
        return new Promise((resolve, reject) => {
          const definitionResults = document.getElementById('definition-results');
          definitionResults.innerHTML = '';
          const { bar, text } = createProgressBar(definitionResults);
      
          let progress = 0;
          const interval = setInterval(() => {
            progress += 150 / 30;
            if (progress > 100) progress = 100;
            updateProgress(bar, text, progress);
          }, 500);
      
          fetch('/define', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: word })
          })
          .then(response => response.json())
          .then(data => {
            clearInterval(interval);
            word = word.charAt(0).toUpperCase() + word.slice(1);
            let definitionHTML = `<h2>${word}</h2>`;
            let sampleSentence = '';
            for (const [key, value] of Object.entries(data)) {
              definitionHTML += `<p><strong>${key}:</strong> ${value}</p>`;
              if (key === 'Sample Sentence') {
                sampleSentence = value;
              }
            }
            definitionResults.innerHTML = definitionHTML;
            // Store sample sentence for image generation
            window.sampleSentence = sampleSentence; // Store it globally
            resolve(sampleSentence);
          })
          .catch(error => {
            clearInterval(interval);
            definitionResults.innerHTML = 'Error fetching definition.';
            console.error('Error:', error);
            reject(error);
          })
          .finally(() => {
            enableAllButtons();
          });
        });
      }

    // Function 3c: display quote
    function displayQuote(data) {
        quoteText.textContent = data.Quote;
        quoteAuthor.textContent = `- ${data.Author}`;
        quoteContext.textContent = data.Context;
        makeWordsClickable();
    }

    // Function 3d: fetch new quote
    function fetchNewQuote() {
        console.log('Fetching new quote...');
        disableAllButtons();
        fetch('/generate-quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
        .then(response => response.json())
        .then(data => {
          displayQuote(data);
        })
        .catch(error => {
          console.error('Error fetching quote:', error);
          quoteText.textContent = 'Error fetching quote. Please try again.';
          quoteAuthor.textContent = '';
          quoteContext.textContent = '';
        })
        .finally(() => {
          enableAllButtons();
        });
    }
    
    // Function 4: generate image for sample sentence
    function generateImageForSentence(sentence, style) {
        disableAllButtons();
        const imageContainer = document.getElementById('generated-image');
        imageContainer.innerHTML = '';
        console.log(style);
        const styledPrompt = style === 'ink' 
          ? 'Draw a Chinese ink painting describing: ' + sentence 
          : 'Draw a vibrant cartoon style picture of: ' + sentence;

        const { bar, text } = createProgressBar(imageContainer);
        disableAllButtons();

        let progress = 0;
        const interval = setInterval(() => {
            progress += 100 / 30;
            if (progress > 100) progress = 100;
            updateProgress(bar, text, progress);
        }, 500);

        fetch('/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: styledPrompt }) // Include selected style
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(interval);
            if (data.image) {
                imageContainer.innerHTML = `<img src="data:image/png;base64,${data.image}" alt="Generated Image"/>`;
            } else if (data.error) {
                imageContainer.innerHTML = `<strong>Error:</strong> ${data.error}`;
            }
        })
        .catch(error => {
            clearInterval(interval);
            console.error('Error:', error);
            imageContainer.innerHTML = 'An error occurred while generating the image.';
        })
        .finally(() => {
            enableAllButtons();
        });
    }

    // Function 5a: Create Progress Bar
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

  // Function 5b: Update Progress Bar
  function updateProgress(progressBar, progressText, progress) {
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
          progressText.textContent = "Just a Second...";
      } else {
          progressText.textContent = `${Math.round(progress)}% Complete`;
      }
  }

    // STARTING POINT
    updateCurrentDate();

    // Get All Sections in HTML
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteContext = document.getElementById('quote-context');
    const refreshButton = document.getElementById('refresh-quote');
    const styleSelect = document.getElementById('home-style-select');
    const generateImageBtn = document.getElementById('generate-image-btn');

    // Load default quote
    fetch('/default_quote.json')
    .then(response => response.json())
    .then(data => {
        displayQuote(data);
    })
    .catch(error => {
        console.error('Error loading default quote:', error);
    });

    // Refresh button for quote
    refreshButton.addEventListener('click', fetchNewQuote);

    // Word Snapshot for Word Click
    document.getElementById('quote-text').addEventListener('click', function(e) {
        if (e.target.tagName === 'SPAN') {
            let word = e.target.textContent;
            // Check if the word ends with a period and remove it
            if (word.endsWith('.')) {
            word = word.slice(0, -1);
            }
            showSnapShot(word);
            // Depreciated: automatically trigger image generation
            // .then(sampleSentence => {
            //     if (sampleSentence) {
            //     generateImageForSentence(sampleSentence, styleSelect.value);
            //     }
            // });
            }
    });

    // Image Generation for Sample Sentence
    generateImageBtn.addEventListener('click', function() {
      if (window.sampleSentence) { // Check if sample sentence exists
          generateImageForSentence(window.sampleSentence, styleSelect.value); // Use stored sentence
      } else {
          alert('Please select a word first to get a sample sentence.');
      }
    });

    // Separate Page 1: Word Search
    document.addEventListener('DOMContentLoaded', function() {
        const wordSearchLink = document.getElementById('word-search-link');
        wordSearchLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'word_search.html';
        });
    });

    // Separate Page 2: Image Generation
    document.addEventListener('DOMContentLoaded', function() {
        const imageGenerationLink = document.getElementById('image-generation-link');
        imageGenerationLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'image_generation.html';
        });
    });


});

