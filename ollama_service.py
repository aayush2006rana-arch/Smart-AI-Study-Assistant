import requests

def ask_ai(message):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": f"""
You are SmartAI, a helpful coding and study assistant.

Rules:
- Give complete working code when user asks for code.
- Use clear headings.
- Use proper code blocks with language names.
- Do not give incomplete snippets.
- Explain shortly after code.

User question:
{message}
""",
                "stream": False
            }
        )

        data = response.json()
        return data["response"]

    except Exception:
        return "Ollama is not running. Please start Ollama and try again."