import warnings
warnings.filterwarnings("ignore")

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import transformers
import torch


app = Flask(__name__)
CORS(app)

# Load the model
model_id = "meta-llama/Llama-3.2-3B-Instruct"
pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/define', methods=['POST'])
def define_word():
    word = request.json['word']
    prompt = f'Define "{word}" in a single, concise sentence:'
    
    output = pipeline(
        prompt,
        max_new_tokens=50,
        do_sample=True,
        temperature=0.7,
        top_k=30,
        top_p=0.9,
        num_return_sequences=1,
        return_full_text=False,
        num_beams=5,
        early_stopping=True,
        no_repeat_ngram_size=3
    )
    
    # Extract the first sentence and remove any trailing whitespace
    definition = output[0]['generated_text'].strip().split('.')[0] + '.'
    return jsonify({'definition': definition})

if __name__ == '__main__':
    app.run(debug=True)