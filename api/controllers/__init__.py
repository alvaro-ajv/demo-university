from .student_controller import (
    get_students,
    get_student,
    create_student,
    update_student,
    delete_student
)
from .course_controller import (
    get_courses,
    get_course
)
from .stats_controller import get_stats

__all__ = [
    "get_students", "get_student", "create_student", "update_student", "delete_student",
    "get_courses", "get_course",
    "get_stats"
]