from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
import pandas as pd
import json
from process import alibaba, runProcess

import logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

@app.route("/test")
def home():
	return json.dumps({"success":True}), 200, {"ContentType":"application/json"}

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = set(['xlsx', 'csv'])
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

allFiles = []

@app.route('/file', methods=['POST'])
def upload_file():
	global allFiles
	if request.method == 'POST':

		if 'file' not in request.files:
			print('No file part')
			return redirect(request.url)
		file = request.files['file']
		if file.filename == '':
			print('No selected file')
		if file and allowed_file(file.filename):
			df = pd.read_csv(file, header=None, names=['date','item','debit','credit','card'])
			print('got ', file.filename);
			# file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
			dummy = {}
			dummy["data"] = df
			dummy["name"] =file.filename

			allFiles.append(dummy)
			allFileNames = [file["name"] for file in allFiles]
			return json.dumps({"success":True, "data":allFileNames}), 200, {"ContentType":"application/json"}
		else:
			return json.dumps({"success":False, "error":"extension not accepted"}), 400, {"ContentType":"application/json"}

@app.route('/process', methods=['POST'])
def process_files():
	global allFiles
	if request.method == 'POST':
		runProcess(allFiles)
		return json.dumps({"success":True}), 200, {"ContentType":"application/json"}

if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=True, port=600)
