from fastapi import HTTPException
from typing import List
from models.student import Student, StudentCreate, students_db

def get_students() -> List[Student]:
    """Get all students"""
    return students_db

def get_student(student_id: int) -> Student:
    """Get a student by ID"""
    student = next((s for s in students_db if s.id == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

def create_student(student: StudentCreate) -> Student:
    """Create a new student"""
    new_id = max([s.id for s in students_db]) + 1 if students_db else 1
    new_student = Student(id=new_id, **student.model_dump())
    students_db.append(new_student)
    return new_student

def update_student(student_id: int, student: StudentCreate) -> Student:
    """Update an existing student"""
    existing_student = next((s for s in students_db if s.id == student_id), None)
    if not existing_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    updated_student = Student(id=student_id, **student.model_dump())
    index = students_db.index(existing_student)
    students_db[index] = updated_student
    return updated_student

def delete_student(student_id: int) -> dict:
    """Delete a student"""
    student = next((s for s in students_db if s.id == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    students_db.remove(student)
    return {"message": "Student deleted successfully"}