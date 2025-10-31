import pytest
from fastapi import HTTPException
from controllers.course_controller import get_courses, get_course
from models.course import Course, courses_db

def test_get_courses():
    """Test getting all courses"""
    courses = get_courses()
    assert isinstance(courses, list)
    assert len(courses) > 0
    assert all(isinstance(course, Course) for course in courses)

def test_get_course_exists():
    """Test getting an existing course"""
    course = get_course(1)
    assert isinstance(course, Course)
    assert course.id == 1
    assert hasattr(course, 'name')
    assert hasattr(course, 'code')
    assert hasattr(course, 'credits')
    assert hasattr(course, 'instructor')

def test_get_course_not_exists():
    """Test getting a non-existent course"""
    with pytest.raises(HTTPException) as exc_info:
        get_course(999)
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Course not found"

def test_course_data_integrity():
    """Test that course data has correct structure"""
    courses = get_courses()
    
    for course in courses:
        assert isinstance(course.id, int)
        assert isinstance(course.name, str)
        assert isinstance(course.code, str)
        assert isinstance(course.credits, int)
        assert isinstance(course.instructor, str)
        assert course.credits > 0
        assert len(course.name) > 0
        assert len(course.code) > 0
        assert len(course.instructor) > 0