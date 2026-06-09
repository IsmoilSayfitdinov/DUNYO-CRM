# test/test_security.py
from app.core.security import hash_password, check_password

# Test 1
def test_hash_password_returns_string():
    result = hash_password("password123")
    assert isinstance(result, str)

# Test 2
def test_hash_password_different_each_time():
    """Bir xil parolda — har xil hash chiqsin (bcrypt salt)"""
    hash1 = hash_password("12345")
    hash2 = hash_password("12345")
    assert hash1 != hash2     # har safar boshqacha!

# Test 3
def test_check_password_correct():
    hashed = hash_password("12345")
    assert check_password("12345", hashed) is True

# Test 4
def test_check_password_wrong():
    hashed = hash_password("12345")
    assert check_password("noto'g'ri", hashed) is False
