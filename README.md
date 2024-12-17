# SentenSnap

SentenSnap is an interactive web application that combines natural language processing and AI-powered image generation to provide a unique and educational experience. Users can explore random quotes, learn word definitions, and generate artistic images based on sample sentences.

## Features

- **Random Quote Generation**: Displays a new, unique quote every time the page is refreshed.
- **Word Definitions**: Click on any word in the quote to get its definition, part of speech, sample sentence, and synonyms.
- **AI Image Generation**: Generates an image based on the sample sentence of the selected word.
- **Customizable Image Styles**: Choose between Chinese ink painting or vibrant cartoon styles for generated images.
- **Word Search Functionality**: A dedicated page for searching and retrieving detailed word definitions, synonyms, and example usages.
- **Image Generation Page**: A separate interface for generating fixed-style images based on user-provided prompts.

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, JavaScript
- **Natural Language Processing**: Hugging Face Transformers (Qwen2.5-3B-Instruct model)
- **Image Generation**: Stable Diffusion (v1-5 model)

## Project Structure

| File/Directory       | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `app.py`             | Main Flask application containing backend routes and logic.                |
| `index.html`         | HTML template for the application's user interface.                        |
| `scripts.js`         | JavaScript file for handling client-side interactions and API calls.       |
| `word_search.js`     | JavaScript file for handling the dedicated word search functionality.       |
| `image_generation.js`| JavaScript file for managing the image generation page logic.              |
| `word_search.html`   | HTML template for the word search page interface.                          |
| `image_generation.html`| HTML template for the image generation page interface.                   |
| `static/`            | Directory containing static files such as `default_quote.json`.            |

## Setup and Installation

Follow these steps to set up and run SentenSnap locally:

1. Clone the repository:

```
git clone <repository-url>
cd SentenSnap
```
2. Install required Python packages:
```
pip install flask flask_cors transformers torch diffusers
```
3. Run the Flask application:
```
python app.py
```


4. Open your browser and navigate to `http://localhost:5000` to use the application.

## Usage Instructions

### **Home Page**
1. **Generate Random Quotes**:
- The application starts by displaying a random quote.
- Refresh the page to load a new quote.

2. **Get Word Definitions**:
- Click on any word in the displayed quote to view its definition, synonyms, part of speech, and a sample sentence.

3. **Generate Images**:
- Use the "Generate Image" button to create an AI-generated image based on the sample sentence of the selected word.
- Choose between "Chinese Ink Painting" or "Vibrant Cartoon" styles using the dropdown menu.

4. **Navigate to Additional Functionalities**:
- Use the buttons in the top-right corner of the home page to access extra features.

### **Word Search Page**
The Word Search functionality is accessible via the "Word Search" button on the home page.

- Enter a word into the search box and submit it to retrieve:
- Detailed definitions.
- Synonyms.
- Example usages.
- Progress indicators provide feedback during data retrieval.

### **Image Generation Page**
The Image Generation functionality is accessible via the "Image Generation" button on the home page.

- Input a prompt describing your desired image.
- Select an image style ("Ink Style" or "Cartoon Style").
- Submit your request to generate a fixed-style artistic image using AI models.

## Notes

- The image generation feature requires significant computational resources. Ensure your system meets the necessary hardware requirements for running machine learning models efficiently.
- For optimal performance, use a GPU-enabled system when generating images.

## Contributing

Contributions are welcome! Feel free to fork this repository, make changes, and submit a pull request.

---

Enjoy exploring SentenSnap!

