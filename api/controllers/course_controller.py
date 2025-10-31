from fastapi import HTTPException
from typing import List
from models.course import Course, courses_db

def get_courses() -> List[Course]:
    """Get all courses"""
    return courses_db

def get_course(course_id: int) -> Course:
    """Get a course by ID"""
    course = next((c for c in courses_db if c.id == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course