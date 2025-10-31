from pydantic import BaseModel

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

# In-memory data storage for students (for demo purposes)
students_db = [
    Student(id=1, name="Alice Johnson", email="alice.johnson@university.edu", major="Computer Science", year=3),
    Student(id=2, name="Bob Smith", email="bob.smith@university.edu", major="Mathematics", year=2),
    Student(id=3, name="Carol Williams", email="carol.williams@university.edu", major="Physics", year=4),
    Student(id=4, name="David Brown", email="david.brown@university.edu", major="Engineering", year=1),
    Student(id=5, name="Eva Davis", email="eva.davis@university.edu", major="Computer Science", year=2),
]