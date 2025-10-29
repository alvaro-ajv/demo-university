import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Student } from '../../services/api.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  loading = false;
  error = '';
  
  // Form for adding/editing students
  showAddForm = false;
  editingStudent: Student | null = null;
  studentForm = {
    name: '',
    email: '',
    major: '',
    year: 1
  };

  // Filter properties
  selectedMajorFilter = '';
  selectedYearFilter = '';
  searchTerm = '';

  // Available options
  availableMajors = ['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Business', 'Biology'];
  availableYears = [1, 2, 3, 4];

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Only load data in browser environment, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadStudents();
    }
  }

  loadStudents() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.filteredStudents = [...students];
        this.updateAvailableMajors();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load students. Please try again.';
        this.loading = false;
        console.error('Error loading students:', err);
      }
    });
  }

  updateAvailableMajors() {
    const existingMajors = [...new Set(this.students.map(s => s.major))];
    this.availableMajors = [...new Set([...this.availableMajors, ...existingMajors])];
  }

  // Filtering methods
  applyFilters() {
    this.filteredStudents = this.students.filter(student => {
      const majorMatch = !this.selectedMajorFilter || student.major === this.selectedMajorFilter;
      const yearMatch = !this.selectedYearFilter || student.year.toString() === this.selectedYearFilter;
      const searchMatch = !this.searchTerm || 
        student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return majorMatch && yearMatch && searchMatch;
    });
  }

  getFilteredStudents(): Student[] {
    return this.filteredStudents;
  }

  clearFilters() {
    this.selectedMajorFilter = '';
    this.selectedYearFilter = '';
    this.searchTerm = '';
    this.filteredStudents = [...this.students];
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedMajorFilter || this.selectedYearFilter || this.searchTerm);
  }

  // CRUD operations
  addStudent() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.apiService.createStudent(this.studentForm).subscribe({
      next: (student) => {
        this.students.push(student);
        this.applyFilters();
        this.resetForm();
        this.updateAvailableMajors();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to add student. Please try again.';
        this.loading = false;
        console.error('Error adding student:', err);
      }
    });
  }

  editStudent(student: Student) {
    this.editingStudent = student;
    this.studentForm = {
      name: student.name,
      email: student.email,
      major: student.major,
      year: student.year
    };
    this.showAddForm = true;
  }

  updateStudent() {
    if (!this.editingStudent || !this.validateForm()) {
      return;
    }

    this.loading = true;
    this.apiService.updateStudent(this.editingStudent.id, this.studentForm).subscribe({
      next: (updatedStudent) => {
        const index = this.students.findIndex(s => s.id === this.editingStudent!.id);
        if (index !== -1) {
          this.students[index] = updatedStudent;
          this.applyFilters();
        }
        this.resetForm();
        this.updateAvailableMajors();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to update student. Please try again.';
        this.loading = false;
        console.error('Error updating student:', err);
      }
    });
  }

  deleteStudent(id: number) {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    this.loading = true;
    this.apiService.deleteStudent(id).subscribe({
      next: () => {
        this.students = this.students.filter(s => s.id !== id);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to delete student. Please try again.';
        this.loading = false;
        console.error('Error deleting student:', err);
      }
    });
  }

  // Form management
  validateForm(): boolean {
    if (!this.studentForm.name.trim()) {
      this.error = 'Name is required.';
      return false;
    }
    if (!this.studentForm.email.trim()) {
      this.error = 'Email is required.';
      return false;
    }
    if (!this.isValidEmail(this.studentForm.email)) {
      this.error = 'Please enter a valid email address.';
      return false;
    }
    if (!this.studentForm.major.trim()) {
      this.error = 'Major is required.';
      return false;
    }
    
    // Check for duplicate email (excluding current student if editing)
    const existingStudent = this.students.find(s => 
      s.email.toLowerCase() === this.studentForm.email.toLowerCase() && 
      s.id !== this.editingStudent?.id
    );
    if (existingStudent) {
      this.error = 'A student with this email already exists.';
      return false;
    }

    this.error = '';
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetForm() {
    this.studentForm = {
      name: '',
      email: '',
      major: '',
      year: 1
    };
    this.showAddForm = false;
    this.editingStudent = null;
    this.error = '';
  }

  toggleAddForm() {
    if (this.showAddForm && this.editingStudent) {
      this.resetForm();
    } else {
      this.showAddForm = !this.showAddForm;
      if (!this.showAddForm) {
        this.resetForm();
      }
    }
  }

  // Utility methods
  getStudentsByMajor(): { [key: string]: number } {
    const majorCounts: { [key: string]: number } = {};
    this.students.forEach(student => {
      majorCounts[student.major] = (majorCounts[student.major] || 0) + 1;
    });
    return majorCounts;
  }

  getStudentsByYear(): { [key: number]: number } {
    const yearCounts: { [key: number]: number } = {};
    this.students.forEach(student => {
      yearCounts[student.year] = (yearCounts[student.year] || 0) + 1;
    });
    return yearCounts;
  }

  getUniqueEmailDomains(): string[] {
    const domains = this.students.map(student => 
      student.email.split('@')[1]
    ).filter(domain => domain);
    return [...new Set(domains)];
  }

  getYearSuffix(year: number): string {
    if (year === 1) return 'st';
    if (year === 2) return 'nd';
    if (year === 3) return 'rd';
    return 'th';
  }

  // Helper method to access Object.keys in template
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
