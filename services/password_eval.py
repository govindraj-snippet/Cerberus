import re

def check_password_strength(password: str) -> dict:
    score = 0

    if len(password) >= 8:
        score += 1
    if re.search(r"[A-Z]", password) and re.search(r"[a-z]", password):
        score += 1
    if re.search(r"\d", password):
        score += 1
    if re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        score += 1

    return {
        "score": score,
        "max_score": 4
    }