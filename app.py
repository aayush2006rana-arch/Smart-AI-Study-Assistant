
from flask import Flask, json, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from matplotlib import text
from typer import prompt
from werkzeug.security import generate_password_hash, check_password_hash
from ollama_service import ask_ai
import smtplib
import datetime
from email.mime.text import MIMEText
import PyPDF2
import json
from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

uploaded_pdf_text = {}
uploaded_image_text = {}

# =========================
# CREATE FLASK APP
# =========================

app = Flask(__name__)
CORS(app)

# =========================
# DATABASE CONFIG
# =========================

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

DB = SQLAlchemy(app)

# =========================
# AI MODEL
# =========================


# =========================
# DATABASE TABLE
# =========================

class User(DB.Model):
    id = DB.Column(DB.Integer, primary_key=True)
    name = DB.Column(DB.String(100))
    email = DB.Column(DB.String(100), unique=True)
    password = DB.Column(DB.String(200))

# =========================
# CREATE DATABASE
# =========================

with app.app_context():
    DB.create_all()

# =========================
# SIGNUP API
# =========================

@app.route('/signup', methods=['POST'])
def signup():

    data = request.json

    # CHECK EXISTING USER

    existing_user = User.query.filter_by(
        email=data['email']
    ).first()

    if existing_user:

        return jsonify({
            "success": False,
            "message": "Email already exists"
        })

    # HASH PASSWORD

    hashed_password = generate_password_hash(
        data['password']
    )

    # CREATE USER

    user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )

    DB.session.add(user)
    DB.session.commit()

    return jsonify({
        "success": True,
        "message": "Signup successful"
    })

# =========================
# LOGIN API
# =========================

@app.route('/login', methods=['POST'])
def login():

    data = request.json

    user = User.query.filter_by(
        email=data['email']
    ).first()

    # CHECK PASSWORD

    if user and check_password_hash(
        user.password,
        data['password']
    ):

        return jsonify({
            "success": True,
            "message": "Login successful",
            "name": user.name,
            "email": user.email
        })

    return jsonify({
        "success": False,
        "message": "Invalid email or password"
    })

# =========================
# SUMMARIZER API
# =========================

@app.route('/summarize', methods=['POST'])
def summarize():

    text = request.form.get("text", "")
    pdf = request.files.get("pdf")

    if pdf:
        try:
            pdf_reader = PyPDF2.PdfReader(pdf)
            pdf_text = ""

            for page in pdf_reader.pages:
                page_text = page.extract_text()

                if page_text:
                    pdf_text += page_text + "\n"

            text = pdf_text

        except Exception:
            return jsonify({
                "summary": "Could not read PDF file. Please upload a readable PDF."
            })

    if text.strip() == "":
        return jsonify({
            "summary": "Please paste notes first or upload a readable PDF."
        })

    sentences = [
        sentence.strip()
        for sentence in text.split(".")
        if len(sentence.strip()) > 20
    ]

    short_summary = ". ".join(sentences[:3])

    if short_summary == "":
        short_summary = text[:300]

    key_points = sentences[3:8]

    points_html = ""

    for point in key_points:
        points_html += f"<li>{point}.</li>"

    if points_html == "":
        points_html = "<li>Important concepts detected from the notes.</li>"

    important_points = f"""
    <div class="summary-output">
        <h2>✅ Summary</h2>

        <p class="summary-paragraph">
            {short_summary}.
        </p>

        <h3>🔑 Key Points</h3>

        <ul class="summary-points">
            {points_html}
        </ul>
    </div>
    """

    return jsonify({
        "summary": important_points
    })

# =========================
# STUDY PLANNER API
# =========================

@app.route('/planner', methods=['POST'])
def planner():

    data = request.json

    subjects = data['subjects'].split(',')

    exam_date = datetime.datetime.strptime(
        data['examDate'],
        '%Y-%m-%d'
    )

    today = datetime.datetime.now()

    days_left = (exam_date - today).days

    if days_left <= 0:
        return jsonify({
            "plan": "Exam date should be future date"
        })

    plan = ""

    for i in range(days_left):

        subject = subjects[i % len(subjects)].strip()

        plan += (
            f"Day {i+1}: "
            f"Study {subject} for {data['hours']} hours. "
            f"Take 15 minute break after every 1 hour.\n"
        )

    return jsonify({
        "plan": plan
    })


# =========================
# GEMINI CHATBOT API
# =========================

@app.route('/chat-upload-pdf', methods=['POST'])
def chat_upload_pdf():

    user_email = request.form.get("userEmail", "guest")
    pdf = request.files.get("pdf")

    if not pdf:
        return jsonify({"message": "No PDF uploaded"})

    try:
        pdf_reader = PyPDF2.PdfReader(pdf)
        text = ""

        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        uploaded_pdf_text[user_email] = text

        return jsonify({
            "message": "PDF uploaded and read successfully"
        })

    except Exception:
        return jsonify({
            "message": "Could not read this PDF"
        }), 500

@app.route('/chat-upload-image', methods=['POST'])
def chat_upload_image():

    user_email = request.form.get("userEmail", "guest")
    image = request.files.get("image")

    if not image:
        return jsonify({"message": "No image uploaded"})

    try:
        img = Image.open(image)

        text = pytesseract.image_to_string(img)

        uploaded_image_text[user_email] = text

        return jsonify({
            "message": "Image uploaded and read successfully"
        })

    except Exception as e:
        return jsonify({
            "message": str(e)
        }), 500
    
@app.route('/clear-chat-context', methods=['POST'])
def clear_chat_context():

    data = request.json
    user_email = data.get("userEmail", "guest")

    uploaded_pdf_text.pop(user_email, None)
    uploaded_image_text.pop(user_email, None)

    return jsonify({
        "message": "Chat context cleared"
    })

@app.route('/chat', methods=['POST'])
def chat():

    data = request.json

    user_message = data['message']
    user_email = data.get("userEmail", "guest")

    pdf_text = uploaded_pdf_text.get(user_email, "")
    image_text = uploaded_image_text.get(user_email, "")

    if pdf_text:
            prompt = f"""
        Use this uploaded PDF content to answer:

PDF CONTENT:
{pdf_text[:5000]}

QUESTION:
{user_message}
"""
    elif    image_text:
        prompt = f"""
Use this uploaded image text to answer:

IMAGE TEXT:
{image_text[:3000]}

QUESTION:
{user_message}
"""
    else:
        prompt = user_message
    ai_reply = ask_ai(prompt)

    return jsonify({
        "reply": ai_reply
    })


@app.route('/contact', methods=['POST'])
def contact():

    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        message = data.get("message")

        if not name or not email or not message:
            return jsonify({
                "success": False,
                "message": "Please fill all fields"
            })

        sender_email = "aayush2006rana@gmail.com"
        sender_password = "uyqfulfqcirjnrlt"
        receiver_email = "aayush2006rana@gmail.com"
        receiver_email = "omsakpal2805@gmail.com"

        subject = f"SmartAI Contact Form - {name}"
        body = f"""
New Contact Message From SmartAI

Name: {name}
Email: {email}

Message:
{message}
"""

        msg = MIMEText(body)
        msg["Subject"] = "New Contact Message - SmartAI"
        msg["From"] = sender_email
        msg["To"] = receiver_email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()

        return jsonify({
            "success": True,
            "message": "Message sent successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    
@app.route('/generate-questions', methods=['POST'])
def generate_questions():

    text = request.form.get("text", "")
    types = request.form.get("types", "[]")
    pdf = request.files.get("pdf")

    try:
        types = json.loads(types)
    except:
        types = []

    if pdf:
        try:
            pdf_reader = PyPDF2.PdfReader(pdf)
            pdf_text = ""

            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    pdf_text += page_text + "\n"

            text = pdf_text

        except Exception:
            return jsonify({
                "questions": "Could not read PDF file."
            })

    if text.strip() == "":
        return jsonify({
            "questions": "Please paste notes or upload a readable PDF."
        })

    if len(types) == 0:
        return jsonify({
            "questions": "Please select at least one question type."
        })

    instructions = ""

    if "mcq" in types:
        instructions += """
Generate 5 MCQ questions.
Each MCQ must include:
A)
B)
C)
D)
Correct Answer:
"""

    if "viva" in types:
        instructions += """
    Generate 5 Viva Questions.

    Format:

    Q1. Question
    Answer: Detailed answer

    Q2. Question
    Answer: Detailed answer

    Q3. Question
    Answer: Detailed answer

    Q4. Question
    Answer: Detailed answer

    Q5. Question
    Answer: Detailed answer

    Important:
    - Every Viva question MUST have an answer.
    - Do NOT generate questions without answers.
    - Do NOT generate MCQ options.
    - Keep answers 3-5 lines long.
    """

    if "short" in types:
        instructions += """
Generate 5 Short Answer Questions only.
Each answer must be 2-3 lines.
Do NOT add options.
"""
    prompt = f"""
You are SmartAI Question Generator.

The user selected ONLY these question types:
{", ".join(types)}

Generate ONLY:
- MCQ
- Viva
- Short Answer Questions

Never generate Long Answer Questions.
Do NOT generate unselected types.
Do NOT ask the user any follow-up question.

Study Content:
{text[:6000]}

Required Output:
{instructions}

Start directly with the questions and answers.
"""

    questions = ask_ai(prompt)

    return jsonify({
        "questions": questions
    })
# =========================
# RUN SERVER
# =========================

if __name__ == '__main__':
    app.run(debug=True)
