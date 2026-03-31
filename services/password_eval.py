# services/password_eval.py
import zxcvbn

def evaluate_strength(password: str) -> dict:
    result = zxcvbn.zxcvbn(password)
    return {
        "score": result['score'],  # 0 to 4
        "crack_time_display": result['crack_times_display']['offline_fast_hashing_1e10_per_second'],
        "warning": result['feedback']['warning'], 
        "suggestions": result['feedback']['suggestions'] 
    }