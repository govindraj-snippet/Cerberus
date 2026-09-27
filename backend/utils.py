import math

# A shared list of phishing keywords used by both the training engine and live inference.
# Keeping this in one place prevents logic drift between model training and production.
PHISH_KEYWORDS = [
    'login', 'verify', 'bank', 'secure', 'update', 
    'account', 'credential', 'banking', 'confirm', 'password'
]

def calculate_entropy(text):
    """
    Calculates the Shannon entropy of a given string.
    High entropy typically correlates with 'gibberish' (randomly generated) strings.
    """
    if not text:
        return 0
    entropy = 0
    for x in range(256):
        try:
            p_x = float(text.count(chr(x))) / len(text)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        except:
            pass
    return entropy
