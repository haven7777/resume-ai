import re

_PATTERNS = [
    # Email
    (re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"), "[EMAIL]"),
    # Phone — covers (123) 456-7890, 123-456-7890, +1 123 456 7890, etc.
    (re.compile(r"(\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}"), "[PHONE]"),
    # SSN
    (re.compile(r"\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b"), "[SSN]"),
    # URLs
    (re.compile(r"https?://\S+|www\.\S+"), "[URL]"),
    # LinkedIn / GitHub handles (keep domain, strip username)
    (re.compile(r"(linkedin\.com/in/|github\.com/)[\w\-]+"), r"\1[USERNAME]"),
]


def sanitize(text: str) -> str:
    for pattern, replacement in _PATTERNS:
        text = pattern.sub(replacement, text)
    return text
