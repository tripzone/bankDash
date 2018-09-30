from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
import pandas as pd
import json
from process import runProcess, convertToJsonArray, getFile

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

allFiles = {}


@app.route('/reset', methods=['POST'])
def reset_backend_files():
	global allFiles
	allFiles={}
	return json.dumps({"success":True}), 200, {"ContentType":"application/json"}

@app.route('/file', methods=['POST'])
def upload_file():
	global allFiles
	reset_backend_files()
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
			allFiles[file.filename]=df
			allFileNames = list(allFiles.keys())
			return json.dumps({"success":True, "data":allFileNames}), 200, {"ContentType":"application/json"}
		else:
			return json.dumps({"success":False, "error":"extension not accepted"}), 400, {"ContentType":"application/json"}

def transform_allFiles(files):
	global allFiles
	allFilesTransformed = []
	for file in allFiles:
		dummy = {}
		dummy['name']=file;
		dummy['data']=allFiles[file]
		allFilesTransformed.append(dummy)
	return allFilesTransformed;

@app.route('/process', methods=['POST'])
def process_files():
	global allFiles
	allFilesTransformed = transform_allFiles(allFiles)
	if request.method == 'POST':
		results = runProcess(allFilesTransformed)
		# print(convertToJsonArray(results))
		print(results)
		return json.dumps({"success":True, "missing":results['missing'], "data": convertToJsonArray(results['items'])}), 200, {"ContentType":"application/json"}

@app.route('/getCategories', methods=['GET'])
def get_categories():
	categories = getFile('categories')
	print(categories)
	return json.dumps({"success":True, "data": convertToJsonArray(categories)}), 200, {"ContentType":"application/json"}




if __name__ == "__main__":
  app.run(host="0.0.0.0", debug=True, port=600)
