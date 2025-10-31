import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';
import { StudentsComponent } from './students.component';
import { ApiService, Student } from '../../services/api.service';

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockStudents: Student[] = [
    { id: 1, name: 'John Doe', email: 'john@test.com', major: 'Computer Science', year: 2 },
    { id: 2, name: 'Jane Smith', email: 'jane@test.com', major: 'Mathematics', year: 3 },
    { id: 3, name: 'Bob Johnson', email: 'bob@test.com', major: 'Computer Science', year: 1 }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getStudents', 'createStudent', 'updateStudent', 'deleteStudent'
    ]);

    await TestBed.configureTestingModule({
      imports: [StudentsComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    
    // Prevent automatic ngOnInit call by not calling fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load students on init', () => {
    apiService.getStudents.and.returnValue(of(mockStudents));
    
    component.loadStudents();
    
    expect(apiService.getStudents).toHaveBeenCalled();
    expect(component.students).toEqual(mockStudents);
    expect(component.filteredStudents).toEqual(mockStudents);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading students', () => {
    apiService.getStudents.and.returnValue(throwError(() => new Error('API Error')));
    
    spyOn(console, 'error'); // Suppress console error logs during testing
    component.loadStudents();
    
    expect(component.error).toBe('Failed to load students. Please try again.');
    expect(component.loading).toBeFalse();
  });

  it('should filter students by major', () => {
    component.students = mockStudents;
    component.selectedMajorFilter = 'Computer Science';
    
    component.applyFilters();
    
    expect(component.filteredStudents.length).toBe(2);
    expect(component.filteredStudents.every(s => s.major === 'Computer Science')).toBeTruthy();
  });

  it('should filter students by year', () => {
    component.students = mockStudents;
    component.selectedYearFilter = '2';
    
    component.applyFilters();
    
    expect(component.filteredStudents.length).toBe(1);
    expect(component.filteredStudents[0].year).toBe(2);
  });

  it('should filter students by search term', () => {
    component.students = mockStudents;
    component.searchTerm = 'john';
    
    component.applyFilters();
    
    expect(component.filteredStudents.length).toBe(2); // John Doe and Bob Johnson
  });

  it('should clear all filters', () => {
    component.students = mockStudents;
    component.selectedMajorFilter = 'Computer Science';
    component.selectedYearFilter = '2';
    component.searchTerm = 'john';
    
    component.clearFilters();
    
    expect(component.selectedMajorFilter).toBe('');
    expect(component.selectedYearFilter).toBe('');
    expect(component.searchTerm).toBe('');
    expect(component.filteredStudents).toEqual(mockStudents);
  });

  it('should validate form correctly', () => {
    // Invalid form - empty name
    component.studentForm = { name: '', email: 'test@test.com', major: 'CS', year: 1 };
    expect(component.validateForm()).toBeFalse();
    expect(component.error).toBe('Name is required.');

    // Invalid form - empty email
    component.studentForm = { name: 'Test', email: '', major: 'CS', year: 1 };
    expect(component.validateForm()).toBeFalse();
    expect(component.error).toBe('Email is required.');

    // Invalid form - invalid email
    component.studentForm = { name: 'Test', email: 'invalid-email', major: 'CS', year: 1 };
    expect(component.validateForm()).toBeFalse();
    expect(component.error).toBe('Please enter a valid email address.');

    // Valid form
    component.studentForm = { name: 'Test', email: 'test@test.com', major: 'CS', year: 1 };
    component.students = [];
    expect(component.validateForm()).toBeTrue();
    expect(component.error).toBe('');
  });

  it('should create student', () => {
    const newStudent: Student = { id: 4, name: 'New Student', email: 'new@test.com', major: 'Physics', year: 1 };
    apiService.createStudent.and.returnValue(of(newStudent));
    
    component.studentForm = { name: 'New Student', email: 'new@test.com', major: 'Physics', year: 1 };
    component.students = [];
    
    component.addStudent();
    
    expect(apiService.createStudent).toHaveBeenCalledWith({ name: 'New Student', email: 'new@test.com', major: 'Physics', year: 1 });
    expect(component.students).toContain(newStudent);
  });

  it('should update student', () => {
    const updatedStudent: Student = { id: 1, name: 'Updated Name', email: 'updated@test.com', major: 'Physics', year: 2 };
    apiService.updateStudent.and.returnValue(of(updatedStudent));
    
    component.editingStudent = mockStudents[0];
    component.students = [...mockStudents];
    component.studentForm = { name: 'Updated Name', email: 'updated@test.com', major: 'Physics', year: 2 };
    
    component.updateStudent();
    
    expect(apiService.updateStudent).toHaveBeenCalledWith(1, { name: 'Updated Name', email: 'updated@test.com', major: 'Physics', year: 2 });
    expect(component.students[0]).toEqual(updatedStudent);
  });

  it('should delete student', () => {
    apiService.deleteStudent.and.returnValue(of({}));
    component.students = [...mockStudents];
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.deleteStudent(1);
    
    expect(apiService.deleteStudent).toHaveBeenCalledWith(1);
    expect(component.students.length).toBe(2);
    expect(component.students.find(s => s.id === 1)).toBeUndefined();
  });

  it('should not delete student if not confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.students = [...mockStudents];
    
    component.deleteStudent(1);
    
    expect(apiService.deleteStudent).not.toHaveBeenCalled();
    expect(component.students.length).toBe(3);
  });

  it('should reset form', () => {
    component.studentForm = { name: 'Test', email: 'test@test.com', major: 'CS', year: 2 };
    component.showAddForm = true;
    component.editingStudent = mockStudents[0];
    component.error = 'Some error';
    
    component.resetForm();
    
    expect(component.studentForm).toEqual({ name: '', email: '', major: '', year: 1 });
    expect(component.showAddForm).toBeFalse();
    expect(component.editingStudent).toBeNull();
    expect(component.error).toBe('');
  });

  it('should calculate students by major correctly', () => {
    component.students = mockStudents;
    
    const result = component.getStudentsByMajor();
    
    expect(result['Computer Science']).toBe(2);
    expect(result['Mathematics']).toBe(1);
  });

  it('should calculate students by year correctly', () => {
    component.students = mockStudents;
    
    const result = component.getStudentsByYear();
    
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(1);
    expect(result[3]).toBe(1);
  });
});
