from zxcvbn import zxcvbn

def analyze_password_strength(password: str, user_inputs: list = None) -> dict:
    """
    Evaluates password strength using zxcvbn.
    Takes an optional list of user_inputs (name, email, dob, etc.) to catch predictable patterns.
    """
    if user_inputs is None:
        user_inputs = []
        
    # The magic happens here: We feed the user context into the AI
    result = zxcvbn(password, user_inputs=user_inputs)
    
    score = result.get('score', 0)
    feedback = result.get('feedback', {})
    
    # Extract warnings and suggestions
    warnings = feedback.get('warning', '')
    suggestions = feedback.get('suggestions', [])
    
    combined_feedback = []
    if warnings:
        combined_feedback.append(warnings)
    combined_feedback.extend(suggestions)
    
    # If the password gets a low score, but zxcvbn doesn't give specific feedback, provide a default
    if score < 4 and not combined_feedback:
        combined_feedback.append("Add more random words, numbers, or symbols to improve strength.")
    elif score == 4 and not combined_feedback:
        combined_feedback.append("This password is highly secure and unpredictable!")
        
    return {
        "score": score,
        "max_score": 4,
        "feedback": combined_feedback,
        "estimated_guesses_to_crack": result.get('guesses', 0)
    }