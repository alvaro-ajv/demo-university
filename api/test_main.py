import pytest
import requests
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_students():
    response = client.get("/students")
    assert response.status_code == 200
    students = response.json()
    assert isinstance(students, list)
    assert len(students) > 0

def test_get_student():
    response = client.get("/students/1")
    assert response.status_code == 200
    student = response.json()
    assert "id" in student
    assert "name" in student
    assert student["id"] == 1

def test_get_nonexistent_student():
    response = client.get("/students/999")
    assert response.status_code == 404

def test_create_student():
    new_student = {
        "name": "Test Student",
        "email": "test@university.edu",
        "major": "Computer Science",
        "year": 2
    }
    response = client.post("/students", json=new_student)
    assert response.status_code == 200
    created_student = response.json()
    assert created_student["name"] == new_student["name"]
    assert created_student["email"] == new_student["email"]

def test_get_courses():
    response = client.get("/courses")
    assert response.status_code == 200
    courses = response.json()
    assert isinstance(courses, list)
    assert len(courses) > 0

def test_get_stats():
    response = client.get("/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total_students" in stats
    assert "total_courses" in stats
    assert isinstance(stats["total_students"], int)
    assert isinstance(stats["total_courses"], int)