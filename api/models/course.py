from pydantic import BaseModel

class Course(BaseModel):
    id: int
    name: str
    code: str
    credits: int
    instructor: str

# In-memory data storage for courses (for demo purposes)
courses_db = [
    Course(id=1, name="Introduction to Programming", code="CS101", credits=3, instructor="Dr. Smith"),
    Course(id=2, name="Data Structures", code="CS201", credits=4, instructor="Dr. Johnson"),
    Course(id=3, name="Calculus I", code="MATH101", credits=4, instructor="Dr. Williams"),
    Course(id=4, name="Physics I", code="PHYS101", credits=3, instructor="Dr. Brown"),
    Course(id=5, name="Software Engineering", code="CS301", credits=3, instructor="Dr. Davis"),
]