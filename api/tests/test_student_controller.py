import pytest
from fastapi import HTTPException
from controllers.student_controller import (
    get_students, get_student, create_student, update_student, delete_student
)
from models.student import Student, StudentCreate, students_db

# Backup original data for cleanup
original_students = students_db.copy()

def setup_function():
    """Reset students_db before each test"""
    global students_db
    students_db.clear()
    students_db.extend(original_students)

def test_get_students():
    """Test getting all students"""
    students = get_students()
    assert isinstance(students, list)
    assert len(students) > 0
    assert all(isinstance(student, Student) for student in students)

def test_get_student_exists():
    """Test getting an existing student"""
    student = get_student(1)
    assert isinstance(student, Student)
    assert student.id == 1

def test_get_student_not_exists():
    """Test getting a non-existent student"""
    with pytest.raises(HTTPException) as exc_info:
        get_student(999)
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Student not found"

def test_create_student():
    """Test creating a new student"""
    initial_count = len(students_db)
    student_data = StudentCreate(
        name="Test Student",
        email="test@university.edu",
        major="Computer Science",
        year=2
    )
    
    new_student = create_student(student_data)
    
    assert isinstance(new_student, Student)
    assert new_student.name == student_data.name
    assert new_student.email == student_data.email
    assert new_student.major == student_data.major
    assert new_student.year == student_data.year
    assert len(students_db) == initial_count + 1

def test_update_student_exists():
    """Test updating an existing student"""
    student_data = StudentCreate(
        name="Updated Student",
        email="updated@university.edu",
        major="Mathematics",
        year=3
    )
    
    updated_student = update_student(1, student_data)
    
    assert isinstance(updated_student, Student)
    assert updated_student.id == 1
    assert updated_student.name == student_data.name
    assert updated_student.email == student_data.email
    assert updated_student.major == student_data.major
    assert updated_student.year == student_data.year

def test_update_student_not_exists():
    """Test updating a non-existent student"""
    student_data = StudentCreate(
        name="Updated Student",
        email="updated@university.edu",
        major="Mathematics",
        year=3
    )
    
    with pytest.raises(HTTPException) as exc_info:
        update_student(999, student_data)
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Student not found"

def test_delete_student_exists():
    """Test deleting an existing student"""
    initial_count = len(students_db)
    
    result = delete_student(1)
    
    assert result == {"message": "Student deleted successfully"}
    assert len(students_db) == initial_count - 1
    
    # Verify student is actually deleted
    with pytest.raises(HTTPException):
        get_student(1)

def test_delete_student_not_exists():
    """Test deleting a non-existent student"""
    with pytest.raises(HTTPException) as exc_info:
        delete_student(999)
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Student not found"