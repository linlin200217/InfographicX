from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    question = request.form.get('question')
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    
    if file and file.filename.endswith('.pdf'):
        # 这里可以添加文件保存逻辑
        # 例如：file.save(os.path.join('uploads', file.filename))
        
        # 返回成功响应
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': file.filename,
            'question': question
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == "__main__":
    # 创建uploads目录用于存储上传的文件
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    
    app.run(host='0.0.0.0', port=9018, debug=True)