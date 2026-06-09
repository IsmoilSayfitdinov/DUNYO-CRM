# test/test_jwt.py
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from fastapi import HTTPException
import pytest


def test_create_access_token_returns_string():
    token = create_access_token("user-abc", "manager")
    assert isinstance(token, str)
    assert len(token) > 50    # JWT tokenlar uzunqq


def test_access_token_contains_user_id():
    token = create_access_token("user-abc", "manager")
    data = decode_token(token, token_type="access")
    assert data["sub"] == "user-abc"
    assert data["role"] == "manager"
    assert data["type"] == "access"


def test_refresh_token_no_role():
    """Refresh token'da role bo'lmasin"""
    token = create_refresh_token("user-abc")
    data = decode_token(token, token_type="refresh")
    assert data["sub"] == "user-abc"
    assert data["type"] == "refresh"
    assert "role" not in data    # role yo'q!


def test_decode_wrong_type_fails():
    """Refresh tokenni 'access' deb decode qilsa — xato chiqsin"""
    token = create_refresh_token("user-abc")
    
    with pytest.raises(HTTPException) as exc_info:
        decode_token(token, token_type="access")
    
    assert exc_info.value.status_code == 401


def test_decode_invalid_token():
    """Yolg'on token — xato chiqsin"""
    with pytest.raises(HTTPException):
        decode_token("yolgon-token-string", token_type="access")
