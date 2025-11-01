#!/usr/bin/env python3
"""
Simple test script to verify authentication system is working
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_auth_system():
    print("🧪 Testing DocFormat AI Authentication System")
    print("=" * 50)
    
    # Test 1: Check if server is running
    print("\n1. Testing server connection...")
    try:
        response = requests.get(f"{BASE_URL}/auth/test", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and auth endpoints are accessible")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure FastAPI is running on http://127.0.0.1:8000")
        print("   Run: cd smartdoc_formatter_j && python run_api.py")
        return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False
    
    # Test 2: Test signup
    print("\n2. Testing user signup...")
    test_user = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "123",
        "confirm_password": "123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=test_user, timeout=10)
        if response.status_code == 200:
            print("✅ Signup successful!")
            data = response.json()
            print(f"   User created: {data['user']['username']} ({data['user']['email']})")
            print(f"   Token received: {data['access_token'][:20]}...")
            return True
        else:
            print(f"❌ Signup failed with status {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error during signup: {e}")
        return False

if __name__ == "__main__":
    success = test_auth_system()
    if success:
        print("\n🎉 Authentication system is working correctly!")
    else:
        print("\n💥 Authentication system has issues that need to be fixed.")