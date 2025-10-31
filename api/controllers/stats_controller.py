from models.student import students_db
from models.course import courses_db

def get_stats() -> dict:
    """Get statistics about students and courses"""
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