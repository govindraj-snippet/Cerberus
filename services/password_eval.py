import zxcvbn

def check_password_strength(password: str) -> dict:
    # Run the password through the AI cracking engine
    results = zxcvbn.zxcvbn(password)
    score = results['score'] 
    
    warning = results['feedback']['warning']
    suggestions = results['feedback']['suggestions']
    
    # Collect all feedback provided by zxcvbn
    feedback_messages = []
    if warning:
        feedback_messages.append(warning)
    if suggestions:
        feedback_messages.extend(suggestions)
        
    # If no specific warning was generated, assign reliable fallback text
    if not feedback_messages:
        if score == 4:
            feedback_messages = ["This password is highly secure and unpredictable!"]
        elif score == 3:
            feedback_messages = ["It's an okay password, but adding more random characters makes it truly secure."]
        else:
            feedback_messages = ["This password is too predictable. Hackers could guess it easily."]
            
    return {
        "score": score,
        "max_score": 4,
        "feedback": feedback_messages,
        "estimated_guesses_to_crack": results.get('guesses', 0) 
    }