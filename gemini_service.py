import google.generativeai as genai

API_KEY = "AQ.Ab8RN6IGrjb6zEZo9uumNZh8xliOlucDtrvxvTkryq3YptIung"

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")

def ask_gemini(prompt):

    response = model.generate_content(prompt)

    return response.text