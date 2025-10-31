import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService, Stats, Student, Course } from '../../services/api.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  stats: Stats | null = null;
  students: Student[] = [];
  courses: Course[] = [];
  loading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Only load data in browser environment, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadAllData();
    }
  }

  async loadAllData() {
    this.loading = true;
    this.error = '';

    try {
      // Load stats, students, and courses in parallel
      const [stats, students, courses] = await Promise.all([
        this.apiService.getStats().toPromise(),
        this.apiService.getStudents().toPromise(),
        this.apiService.getCourses().toPromise()
      ]);
      
      this.stats = stats!;
      this.students = students!;
      this.courses = courses!;
      this.loading = false;
    } catch (err) {
      this.error = 'Failed to load statistics. Please try again.';
      this.loading = false;
      console.error('Error loading statistics:', err);
    }
  }

  getMajorData(): { major: string; count: number; percentage: number }[] {
    if (!this.stats) return [];
    
    const total = this.stats.total_students;
    return Object.entries(this.stats.students_by_major).map(([major, count]) => ({
      major,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  }

  getYearData(): { year: number; count: number; percentage: number }[] {
    if (!this.stats) return [];
    
    const total = this.stats.total_students;
    return Object.entries(this.stats.students_by_year)
      .map(([year, count]) => ({
        year: parseInt(year),
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => a.year - b.year);
  }

  getTopMajor(): string {
    if (!this.stats) return '';
    
    const majors = this.stats.students_by_major;
    return Object.keys(majors).reduce((a, b) => majors[a] > majors[b] ? a : b);
  }

  getAverageCreditsPerCourse(): number {
    if (this.courses.length === 0) return 0;
    
    const totalCredits = this.courses.reduce((sum, course) => sum + course.credits, 0);
    return Math.round((totalCredits / this.courses.length) * 10) / 10;
  }

  getUniqueInstructors(): number {
    const instructors = new Set(this.courses.map(course => course.instructor));
    return instructors.size;
  }

  // Additional utility methods
  getCoursesByInstructor(instructor: string): Course[] {
    return this.courses.filter(course => course.instructor === instructor);
  }

  getAverageCredits(): number {
    if (this.courses.length === 0) return 0;
    const total = this.courses.reduce((sum, course) => sum + course.credits, 0);
    return Math.round((total / this.courses.length) * 10) / 10;
  }

  getStudentsPerMajor(): { major: string; students: Student[] }[] {
    const majorGroups: { [key: string]: Student[] } = {};
    this.students.forEach(student => {
      if (!majorGroups[student.major]) {
        majorGroups[student.major] = [];
      }
      majorGroups[student.major].push(student);
    });
    
    return Object.entries(majorGroups)
      .map(([major, students]) => ({ major, students }))
      .sort((a, b) => b.students.length - a.students.length);
  }

  getInstructorCourseLoad(): { instructor: string; courses: Course[]; totalCredits: number }[] {
    const instructorGroups: { [key: string]: Course[] } = {};
    this.courses.forEach(course => {
      if (!instructorGroups[course.instructor]) {
        instructorGroups[course.instructor] = [];
      }
      instructorGroups[course.instructor].push(course);
    });

    return Object.entries(instructorGroups)
      .map(([instructor, courses]) => ({
        instructor,
        courses,
        totalCredits: courses.reduce((sum, course) => sum + course.credits, 0)
      }))
      .sort((a, b) => b.totalCredits - a.totalCredits);
  }

  getTotalCreditsOffered(): number {
    return this.courses.reduce((sum, course) => sum + course.credits, 0);
  }

  getMostActiveYear(): number | null {
    if (!this.stats) return null;
    const yearData = this.stats.students_by_year;
    const maxYear = Object.keys(yearData).reduce((a, b) => 
      yearData[a] > yearData[b] ? a : b
    );
    return parseInt(maxYear);
  }

  getEnrollmentTrend(): { year: number; count: number; trend: string }[] {
    const yearData = this.getYearData();
    return yearData.map((item, index) => {
      let trend = 'stable';
      if (index > 0) {
        const prev = yearData[index - 1];
        if (item.count > prev.count) trend = 'up';
        else if (item.count < prev.count) trend = 'down';
      }
      return { ...item, trend };
    });
  }

  getCapacityUtilization(): number {
    // Simulate capacity utilization (this would come from real data in production)
    const totalCapacity = this.courses.length * 30; // Assuming 30 students per course
    const totalEnrolled = this.stats ? this.stats.total_students : 0;
    return totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  }

  getDiversityIndex(): number {
    // Calculate diversity based on major distribution (Shannon diversity index simplified)
    if (!this.stats) return 0;
    const total = this.stats.total_students;
    const majors = Object.values(this.stats.students_by_major);
    const diversity = majors.reduce((acc, count) => {
      const proportion = count / total;
      return acc - (proportion * Math.log2(proportion));
    }, 0);
    return Math.round(diversity * 100) / 100;
  }
}
