import warnings
warnings.filterwarnings("ignore")

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
# import transformers
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

from diffusers import StableDiffusionPipeline
import torch
import io
import base64
import time
import json

app = Flask(__name__)
CORS(app)

# Home Page
@app.route('/')
def index():
    return render_template('index.html')

# Load Default Quote by JSON
@app.route('/default_quote.json')
def default_quote():
    with open('static/default_quote.json', 'r') as file:
        return file.read()

# Word Search Page
@app.route('/word_search')
def word_search():
    return render_template('word_search.html')

# Image Generation Page
@app.route('/image_generation')
def image_generation():
    return render_template('image_generation.html')

# Qwen Word Search
@app.route('/define', methods=['POST'])
def define_word():
    start_rout_time = time.perf_counter()
    word = request.json['word']

    # Model and tokenizer setup
    # model_name = "Qwen/Qwen2.5-0.5B-Instruct"
    # model_name = "Qwen/Qwen2.5-1.5B-Instruct"
    model_name = "Qwen/Qwen2.5-3B-Instruct"
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype="auto",
        device_map="auto"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    prompts = {
        'Definition': f'Define the word "{word}" in a single, concise sentence:',
        # 'Part of Speech': f'What is the part of speech for the word "{word}"? If the answer is unique, respond with only the part of speech (e.g., noun, verb, adjective); if not, respond with all possible answers separated by commas:',
        'Sample Sentence': f'Provide a sample sentence using the word "{word}". Make sure the sentence depicts a concrete scenario:',
        'Synonyms': f'List 3-5 synonyms for the word "{word}". Do not include the word "{word}" itself. Respond with only the synonyms, separated by commas:'
    }

    response = {}

    for key, prompt in prompts.items():
        start_pip_time = time.perf_counter()
        
        messages = [
            {"role": "system", "content": "You are an accurate English dictionary."},
            {"role": "user", "content": prompt}
        ]
        text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

        generated_ids = model.generate(
            **model_inputs,
            max_new_tokens=50,
            do_sample=True,
            temperature=0.3,
            top_k=50,
            top_p=0.95,
            num_return_sequences=1,
            num_beams=3,
            early_stopping=True,
            no_repeat_ngram_size=2,
            repetition_penalty=1.2
        )
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        result = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        response[key] = result.strip()

        print(f'Generated {key} using {time.perf_counter()-start_pip_time:.2f} seconds.')

    # Free memory
    del model
    del tokenizer
    torch.cuda.empty_cache()

    # Clean up the responses
    response['Definition'] = response['Definition'].split('.')[0] + '.'
    # response['Part of Speech'] = response['Part of Speech'].lower().split('.')[0]
    response['Sample Sentence'] = response['Sample Sentence'].split('.')[0] + '.'
    synonym_list = response['Synonyms'].split(', ')
    synonym_list = [w for w in synonym_list if w.lower() != word.lower()]
    response['Synonyms'] = ', '.join(synonym_list[:5])

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

# Image Generation
@app.route('/generate-image', methods=['POST'])
def generate_image_route():
    start_rout_time = time.perf_counter()
    # sentence = request.json['prompt']
    prompt = request.json['prompt']
    # prompt = 'Draw a Chinese ink painting describing: ' + sentence
    # prompt = 'Draw a pixel styled picture describing: ' + sentence
    # prompt = 'Draw a minimalist styled picture describing: ' + sentence
#     prompt = f'''Create a simple black and white line art illustration of the following scenario: {sentence}
# Style guidelines:
# - Use only black lines on a white background
# - No shades of gray or other colors
# - High contrast between black lines and white space
# - Simple, clean linework without intricate details
# - No solid black areas, only outlines and basic shading techniques (e.g., hatching or stippling if necessary)

# Additional instructions:
# - Focus on key objects or actions mentioned in the sentence
# - Simplify any complex concepts into basic visual representations
# - Omit background details unless essential to the scene
# - Aim for a style reminiscent of old role-playing game book illustrations'''

    print(prompt)
    try:
        image_data = generate_image(prompt)
        return jsonify({'image': image_data})
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return jsonify({'error': 'An error occurred while generating the image'}), 500
    finally:
        print(f'Finished image generation route using {time.perf_counter()-start_rout_time:.2f} seconds.')

# Sentence Generation
@app.route('/generate-quote', methods=['POST'])
def generate_quote():
    start_rout_time = time.perf_counter()
    
    model_name = "Qwen/Qwen2.5-3B-Instruct"
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype="auto",
        device_map="auto"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    prompt = '''Generate a random, unique quote from any source (e.g., book, movie, speech, song, interview) and provide it in the following JSON format:
                {
                    "Quote": "The exact quote, enclosed in quotation marks",
                    "Author": "The full name of the person who said or wrote the quote",
                    "Context": "A brief explanation of where the quote comes from, including the title of the work (if applicable) and the year"
                }

                Ensure that:
                1. The quote is not a commonly overused one.
                2. The author and context are accurate and verifiable.
                3. The quote comes from a different source than any previously provided.
                4. The JSON format is strictly followed, with each field on a new line.'''
    
    messages = [
        {"role": "system", "content": "You are an assistant who remembers a vast array of diverse quotes from various sources including literature, movies, songs, speeches, and historical figures. Generate unique and interesting quotes each time you're asked."},
        {"role": "user", "content": prompt}
    ]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.8,
        top_k=50,
        top_p=0.95,
        repetition_penalty=1.1
    )
    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]

    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    # Clean up the response and parse it as JSON
    try:
        quote_data = json.loads(response)
    except json.JSONDecodeError:
        quote_data = {"Quote": "Error generating quote", "Author": "System", "Context": "An error occurred"}

    # Free memory
    del model
    del tokenizer
    torch.cuda.empty_cache()
    
    print(f'Finished quote generation route using {time.perf_counter()-start_rout_time:.2f} seconds.')
    return jsonify(quote_data)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)