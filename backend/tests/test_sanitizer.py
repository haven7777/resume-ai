"""PII sanitizer unit tests."""
from app.services.pii_sanitizer import sanitize


def test_email_redacted():
    result = sanitize("Contact me at john.doe@example.com for details.")
    assert "john.doe@example.com" not in result
    assert "[EMAIL]" in result


def test_phone_redacted():
    result = sanitize("Call me at 555-867-5309.")
    assert "555-867-5309" not in result


def test_ssn_redacted():
    result = sanitize("SSN: 123-45-6789")
    assert "123-45-6789" not in result


def test_clean_text_unchanged():
    text = "Senior Software Engineer with 5 years of Python experience."
    result = sanitize(text)
    assert "Python" in result
    assert "Senior Software Engineer" in result


def test_multiple_emails():
    result = sanitize("Email: a@b.com or backup@work.org")
    assert "a@b.com" not in result
    assert "backup@work.org" not in result
    assert result.count("[EMAIL]") == 2
