import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CoursesComponent } from './courses.component';
import { ApiService, Course } from '../../services/api.service';

describe('CoursesComponent', () => {
  let component: CoursesComponent;
  let fixture: ComponentFixture<CoursesComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockCourses: Course[] = [
    { id: 1, name: 'Introduction to Programming', code: 'CS101', credits: 3, instructor: 'Dr. Smith' },
    { id: 2, name: 'Data Structures', code: 'CS201', credits: 4, instructor: 'Dr. Johnson' },
    { id: 3, name: 'Advanced Mathematics', code: 'MATH301', credits: 3, instructor: 'Dr. Williams' }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCourses']);

    await TestBed.configureTestingModule({
      imports: [CoursesComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    
    // Prevent automatic ngOnInit call by not calling fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load courses on init', () => {
    apiService.getCourses.and.returnValue(of(mockCourses));
    
    component.loadCourses();
    
    expect(apiService.getCourses).toHaveBeenCalled();
    expect(component.courses).toEqual(mockCourses);
    expect(component.filteredCourses).toEqual(mockCourses);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading courses', () => {
    apiService.getCourses.and.returnValue(throwError(() => new Error('API Error')));
    
    spyOn(console, 'error'); // Suppress console error logs during testing
    component.loadCourses();
    
    expect(component.error).toBe('Failed to load courses. Please try again.');
    expect(component.loading).toBeFalse();
  });

  it('should calculate total credits correctly', () => {
    component.courses = mockCourses;
    
    const totalCredits = component.getTotalCredits();
    
    expect(totalCredits).toBe(10); // 3 + 4 + 3
  });

  it('should get unique instructors', () => {
    component.courses = mockCourses;
    
    const instructors = component.getUniqueInstructors();
    
    expect(instructors).toEqual(['Dr. Smith', 'Dr. Johnson', 'Dr. Williams']);
  });

  it('should filter courses by credits', () => {
    component.courses = mockCourses;
    component.selectedCreditFilter = '3';
    
    component.applyFilters();
    
    expect(component.filteredCourses.length).toBe(2);
    expect(component.filteredCourses.every(c => c.credits === 3)).toBeTruthy();
  });

  it('should filter courses by instructor', () => {
    component.courses = mockCourses;
    component.selectedInstructorFilter = 'Dr. Smith';
    
    component.applyFilters();
    
    expect(component.filteredCourses.length).toBe(1);
    expect(component.filteredCourses[0].instructor).toBe('Dr. Smith');
  });

  it('should clear all filters', () => {
    component.courses = mockCourses;
    component.selectedCreditFilter = '3';
    component.selectedInstructorFilter = 'Dr. Smith';
    
    component.clearFilters();
    
    expect(component.selectedCreditFilter).toBe('');
    expect(component.selectedInstructorFilter).toBe('');
    expect(component.filteredCourses).toEqual(mockCourses);
  });

  it('should toggle course details', () => {
    const course = mockCourses[0];
    
    // Select course
    component.toggleCourseDetails(course);
    expect(component.selectedCourse).toBe(course);
    
    // Deselect same course
    component.toggleCourseDetails(course);
    expect(component.selectedCourse).toBeNull();
    
    // Select different course
    component.selectedCourse = mockCourses[1];
    component.toggleCourseDetails(course);
    expect(component.selectedCourse).toBe(course);
  });

  it('should get courses by credits', () => {
    component.courses = mockCourses;
    
    const threeCredits = component.getCoursesByCredits(3);
    
    expect(threeCredits.length).toBe(2);
    expect(threeCredits.every(c => c.credits === 3)).toBeTruthy();
  });

  it('should calculate average credits', () => {
    component.courses = mockCourses;
    
    const average = component.getAverageCredits();
    
    expect(average).toBe(3.3); // (3 + 4 + 3) / 3 = 3.33, rounded to 3.3
  });

  it('should return 0 average credits for empty courses', () => {
    component.courses = [];
    
    const average = component.getAverageCredits();
    
    expect(average).toBe(0);
  });

  it('should get difficulty level correctly', () => {
    expect(component.getDifficultyLevel(mockCourses[0])).toBe('Beginner'); // CS101
    expect(component.getDifficultyLevel(mockCourses[1])).toBe('Intermediate'); // CS201
    expect(component.getDifficultyLevel(mockCourses[2])).toBe('Advanced'); // MATH301
  });

  it('should get course type correctly', () => {
    expect(component.getCourseType(mockCourses[0])).toBe('Foundation'); // Introduction to Programming
    expect(component.getCourseType(mockCourses[2])).toBe('Advanced'); // Advanced Mathematics
  });

  it('should check if has active filters', () => {
    expect(component.hasActiveFilters()).toBeFalse();
    
    component.selectedCreditFilter = '3';
    expect(component.hasActiveFilters()).toBeTrue();
    
    component.selectedCreditFilter = '';
    component.selectedInstructorFilter = 'Dr. Smith';
    expect(component.hasActiveFilters()).toBeTrue();
  });
});
