
// Version 1: placeholder details
document.addEventListener('DOMContentLoaded', function() {
    const sentenceContainer = document.getElementById('sentence-container');
    const words = sentenceContainer.textContent.split(' ');
    
    sentenceContainer.innerHTML = words.map(word => 
        `<span class="clickable-word">${word}</span>`
    ).join(' ');

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
});

