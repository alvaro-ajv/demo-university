from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn

from models import Student, StudentCreate, Course
from controllers import (
    get_students, get_student, create_student, update_student, delete_student,
    get_courses, get_course, get_stats
)

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

# API Endpoints

@app.get("/")
def read_root():
    return {"message": "Welcome to University Workshop API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "university-api"}

# Students endpoints
@app.get("/students", response_model=List[Student])
def get_students_route():
    return get_students()

@app.get("/students/{student_id}", response_model=Student)
def get_student_route(student_id: int):
    return get_student(student_id)

@app.post("/students", response_model=Student)
def create_student_route(student: StudentCreate):
    return create_student(student)

@app.put("/students/{student_id}", response_model=Student)
def update_student_route(student_id: int, student: StudentCreate):
    return update_student(student_id, student)

@app.delete("/students/{student_id}")
def delete_student_route(student_id: int):
    return delete_student(student_id)

# Courses endpoints
@app.get("/courses", response_model=List[Course])
def get_courses_route():
    return get_courses()

@app.get("/courses/{course_id}", response_model=Course)
def get_course_route(course_id: int):
    return get_course(course_id)

# Statistics endpoint
@app.get("/stats")
def get_stats_route():
    return get_stats()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)