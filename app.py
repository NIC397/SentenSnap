import warnings
warnings.filterwarnings("ignore")

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import transformers
import torch

from diffusers import StableDiffusionPipeline
import torch
import io
import base64
import time

app = Flask(__name__)
CORS(app)

# Load page
@app.route('/')
def index():
    return render_template('index.html')

# App Route 1: LLM Word Search
@app.route('/define', methods=['POST'])
def define_word():
    start_rout_time = time.perf_counter()
    word = request.json['word']

    # Text generation pipeline setup
    model_id = "meta-llama/Llama-3.2-3B-Instruct"
    text_pipeline = transformers.pipeline(
        "text-generation",
        model=model_id,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    
    prompts = {
        'Definition': f'Define the word "{word}" in a single, concise sentence:',
        'Part of Speech': f'What is the part of speech for the word "{word}"? If the answer is unique, respond with only the part of speech (e.g., noun, verb, adjective); if not, respond with all possible answers separated by commas:',
        'Sample Sentence': f'Provide a sample sentence using the word "{word}":',
        'Synonyms': f'List 3-5 synonyms for the word "{word}". Respond with only the synonyms, separated by commas:'
    }
    
    response = {}
    
    for key, prompt in prompts.items():
        start_pip_time = time.perf_counter()
        output = text_pipeline(
            prompt,
            max_new_tokens=50,  # Reduced token limit for more concise responses
            do_sample=True,
            temperature=0.3,  # Reduced temperature for more deterministic output
            top_k=50,
            top_p=0.95,
            num_return_sequences=1,
            return_full_text=False,
            num_beams=3,
            early_stopping=True,
            no_repeat_ngram_size=2,
            repetition_penalty=1.2
        )
        
        result = output[0]['generated_text'].strip()
        response[key] = result

        print(f'Generated {key} using {time.perf_counter()-start_pip_time:.2f} seconds.')

    # Free memory
    del text_pipeline
    torch.cuda.empty_cache()
    
    # Clean up the responses
    response['Definition'] = response['Definition'].split('.')[0] + '.'          # Take the 1st sentence
    response['Part of Speech'] = response['Part of Speech'].lower().split('.')[0]   # Take the 1st segmant
    response['Sample Sentence'] = response['Sample Sentence'].split('.')[0]+ '.'      # Take the 1st sentence
    response['Synonyms'] = ', '.join(response['Synonyms'].split(', ')[:5])       # Limit to 5 synonyms
    
    print(f'Finished word search route using {time.perf_counter()-start_rout_time:.2f} seconds.')
    return jsonify(response)

# Function to generate images
def generate_image(prompt):
    start_pip_time = time.perf_counter()

    # Image generation pipeline setup
    model_id = "sd-legacy/stable-diffusion-v1-5"
    image_pipeline = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
    image_pipeline = image_pipeline.to("cuda")

    image = image_pipeline(
    prompt=prompt,
    height=512,  # Image height (default is 512)
    width=512,  # Image width (default is 512)
    num_inference_steps=100,  # Number of denoising steps (default is 50)
    guidance_scale=7.5,  # Higher values enforce the prompt more strongly (default is 7.5)
    negative_prompt="ugly, blurry, low quality",  # Things to avoid in the image
    num_images_per_prompt=1,  # Number of images to generate (default is 1),
    max_sequence_length=512,  # Maximum length of the text prompt
    ).images[0] 
    
    # Free memory
    del image_pipeline
    torch.cuda.empty_cache()

    # Convert image to base64
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    print(f'Generated image using {time.perf_counter()-start_pip_time:.2f} seconds.')
    return img_str

# App Route 2: Image Generation
@app.route('/generate-image', methods=['POST'])
def generate_image_route():
    start_rout_time = time.perf_counter()
    prompt = request.json['prompt']
    prompt = 'Draw a Chinese ink painting describing: ' + prompt
    print(prompt)
    try:
        image_data = generate_image(prompt)
        return jsonify({'image': image_data})
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return jsonify({'error': 'An error occurred while generating the image'}), 500
    finally:
        print(f'Finished image generation route using {time.perf_counter()-start_rout_time:.2f} seconds.')


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)