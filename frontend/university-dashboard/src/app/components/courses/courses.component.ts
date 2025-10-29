import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Course } from '../../services/api.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  selectedCourse: Course | null = null;
  loading = false;
  error = '';

  // Filter properties
  selectedCreditFilter = '';
  selectedInstructorFilter = '';

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Only load data in browser environment, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadCourses();
    }
  }

  loadCourses() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.filteredCourses = [...courses];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
        console.error('Error loading courses:', err);
      }
    });
  }

  getTotalCredits(): number {
    return this.courses.reduce((total, course) => total + course.credits, 0);
  }

  getUniqueInstructors(): string[] {
    const instructors = this.courses.map(course => course.instructor);
    return [...new Set(instructors)];
  }

  getCoursesByCredits(credits: number): Course[] {
    return this.courses.filter(course => course.credits === credits);
  }

  // New filtering methods
  applyFilters() {
    this.filteredCourses = this.courses.filter(course => {
      const creditMatch = !this.selectedCreditFilter || course.credits.toString() === this.selectedCreditFilter;
      const instructorMatch = !this.selectedInstructorFilter || course.instructor === this.selectedInstructorFilter;
      return creditMatch && instructorMatch;
    });
  }

  getFilteredCourses(): Course[] {
    return this.filteredCourses;
  }

  clearFilters() {
    this.selectedCreditFilter = '';
    this.selectedInstructorFilter = '';
    this.filteredCourses = [...this.courses];
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedCreditFilter || this.selectedInstructorFilter);
  }

  // Course detail methods
  toggleCourseDetails(course: Course) {
    if (this.selectedCourse?.id === course.id) {
      this.selectedCourse = null;
    } else {
      this.selectedCourse = course;
    }
  }

  getEstimatedCapacity(course: Course): number {
    // Simulate capacity based on credits (higher credits = smaller classes)
    const baseCapacity = course.credits === 3 ? 30 : 25;
    return baseCapacity + Math.floor(Math.random() * 10);
  }

  getDifficultyLevel(course: Course): string {
    // Simulate difficulty based on course code
    const code = course.code;
    if (code.includes('101')) return 'Beginner';
    if (code.includes('201')) return 'Intermediate';
    if (code.includes('301')) return 'Advanced';
    return 'Intermediate';
  }

  getCourseType(course: Course): string {
    // Categorize courses based on name/code
    const name = course.name.toLowerCase();
    if (name.includes('introduction') || name.includes('intro')) return 'Foundation';
    if (name.includes('advanced') || name.includes('senior')) return 'Advanced';
    if (name.includes('lab') || name.includes('practical')) return 'Practical';
    return 'Core';
  }

  // Additional utility methods
  getCoursesByInstructor(instructor: string): Course[] {
    return this.courses.filter(course => course.instructor === instructor);
  }

  getAverageCredits(): number {
    if (this.courses.length === 0) return 0;
    const total = this.getTotalCredits();
    return Math.round((total / this.courses.length) * 10) / 10;
  }
}
