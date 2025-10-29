from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="University Workshop API",
    description="A simple API for demonstrating Docker and Kubernetes deployment",
    version="1.0.0"
)

# Configure CORS to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Student(BaseModel):
    id: int
    name: str
    email: str
    major: str
    year: int

class StudentCreate(BaseModel):
    name: str
    email: str
    major: str
    year: int

class Course(BaseModel):
    id: int
    name: str
    code: str
    credits: int
    instructor: str

# In-memory data storage (for demo purposes)
students_db = [
    Student(id=1, name="Alice Johnson", email="alice.johnson@university.edu", major="Computer Science", year=3),
    Student(id=2, name="Bob Smith", email="bob.smith@university.edu", major="Mathematics", year=2),
    Student(id=3, name="Carol Williams", email="carol.williams@university.edu", major="Physics", year=4),
    Student(id=4, name="David Brown", email="david.brown@university.edu", major="Engineering", year=1),
    Student(id=5, name="Eva Davis", email="eva.davis@university.edu", major="Computer Science", year=2),
]

courses_db = [
    Course(id=1, name="Introduction to Programming", code="CS101", credits=3, instructor="Dr. Smith"),
    Course(id=2, name="Data Structures", code="CS201", credits=4, instructor="Dr. Johnson"),
    Course(id=3, name="Calculus I", code="MATH101", credits=4, instructor="Dr. Williams"),
    Course(id=4, name="Physics I", code="PHYS101", credits=3, instructor="Dr. Brown"),
    Course(id=5, name="Software Engineering", code="CS301", credits=3, instructor="Dr. Davis"),
]

# API Endpoints

@app.get("/")
def read_root():
    return {"message": "Welcome to University Workshop API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "university-api"}

# Students endpoints
@app.get("/students", response_model=List[Student])
def get_students():
    return students_db

@app.get("/students/{student_id}", response_model=Student)
def get_student(student_id: int):
    student = next((s for s in students_db if s.id == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.post("/students", response_model=Student)
def create_student(student: StudentCreate):
    new_id = max([s.id for s in students_db]) + 1 if students_db else 1
    new_student = Student(id=new_id, **student.dict())
    students_db.append(new_student)
    return new_student

@app.put("/students/{student_id}", response_model=Student)
def update_student(student_id: int, student: StudentCreate):
    existing_student = next((s for s in students_db if s.id == student_id), None)
    if not existing_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    updated_student = Student(id=student_id, **student.dict())
    index = students_db.index(existing_student)
    students_db[index] = updated_student
    return updated_student

@app.delete("/students/{student_id}")
def delete_student(student_id: int):
    student = next((s for s in students_db if s.id == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    students_db.remove(student)
    return {"message": "Student deleted successfully"}

# Courses endpoints
@app.get("/courses", response_model=List[Course])
def get_courses():
    return courses_db

@app.get("/courses/{course_id}", response_model=Course)
def get_course(course_id: int):
    course = next((c for c in courses_db if c.id == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

# Statistics endpoint
@app.get("/stats")
def get_stats():
    majors = {}
    years = {}
    
    for student in students_db:
        majors[student.major] = majors.get(student.major, 0) + 1
        years[student.year] = years.get(student.year, 0) + 1
    
    return {
        "total_students": len(students_db),
        "total_courses": len(courses_db),
        "students_by_major": majors,
        "students_by_year": years
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)