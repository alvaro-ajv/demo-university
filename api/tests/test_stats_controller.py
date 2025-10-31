from controllers.stats_controller import get_stats
from models.student import students_db
from models.course import courses_db

def test_get_stats_structure():
    """Test that stats return the correct structure"""
    stats = get_stats()
    
    assert isinstance(stats, dict)
    assert "total_students" in stats
    assert "total_courses" in stats
    assert "students_by_major" in stats
    assert "students_by_year" in stats
    
    assert isinstance(stats["total_students"], int)
    assert isinstance(stats["total_courses"], int)
    assert isinstance(stats["students_by_major"], dict)
    assert isinstance(stats["students_by_year"], dict)

def test_get_stats_accuracy():
    """Test that stats accurately reflect the data"""
    stats = get_stats()
    
    # Check totals
    assert stats["total_students"] == len(students_db)
    assert stats["total_courses"] == len(courses_db)
    
    # Manually calculate expected major distribution
    expected_majors = {}
    expected_years = {}
    for student in students_db:
        major = student.major
        year = student.year
        expected_majors[major] = expected_majors.get(major, 0) + 1
        expected_years[year] = expected_years.get(year, 0) + 1
    
    assert stats["students_by_major"] == expected_majors
    assert stats["students_by_year"] == expected_years

def test_stats_non_negative():
    """Test that all stats are non-negative"""
    stats = get_stats()
    
    assert stats["total_students"] >= 0
    assert stats["total_courses"] >= 0
    
    for count in stats["students_by_major"].values():
        assert count > 0  # Should have at least 1 student per major
    
    for count in stats["students_by_year"].values():
        assert count > 0  # Should have at least 1 student per year