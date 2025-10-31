import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';
import { StatisticsComponent } from './statistics.component';
import { ApiService, Stats, Student, Course } from '../../services/api.service';

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockStats: Stats = {
    total_students: 5,
    total_courses: 3,
    students_by_major: {
      'Computer Science': 2,
      'Mathematics': 1,
      'Physics': 2
    },
    students_by_year: {
      '1': 1,
      '2': 2,
      '3': 1,
      '4': 1
    }
  };

  const mockStudents: Student[] = [
    { id: 1, name: 'John Doe', email: 'john@test.com', major: 'Computer Science', year: 2 },
    { id: 2, name: 'Jane Smith', email: 'jane@test.com', major: 'Mathematics', year: 3 },
    { id: 3, name: 'Bob Johnson', email: 'bob@test.com', major: 'Computer Science', year: 1 },
    { id: 4, name: 'Alice Brown', email: 'alice@test.com', major: 'Physics', year: 2 },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@test.com', major: 'Physics', year: 4 }
  ];

  const mockCourses: Course[] = [
    { id: 1, name: 'Introduction to Programming', code: 'CS101', credits: 3, instructor: 'Dr. Smith' },
    { id: 2, name: 'Data Structures', code: 'CS201', credits: 4, instructor: 'Dr. Johnson' },
    { id: 3, name: 'Advanced Mathematics', code: 'MATH301', credits: 3, instructor: 'Dr. Smith' }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getStats', 'getStudents', 'getCourses']);

    await TestBed.configureTestingModule({
      imports: [StatisticsComponent, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    
    // Prevent automatic ngOnInit call by not calling fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadAllData on ngOnInit in browser', () => {
    spyOn(component, 'loadAllData');
    
    component.ngOnInit();
    
    expect(component.loadAllData).toHaveBeenCalled();
  });

  it('should load all data on init', async () => {
    // Setup spies to return promises that resolve immediately
    apiService.getStats.and.returnValue(of(mockStats));
    apiService.getStudents.and.returnValue(of(mockStudents));
    apiService.getCourses.and.returnValue(of(mockCourses));
    
    // Call loadAllData and wait for it to complete
    await component.loadAllData();
    
    expect(component.stats).toEqual(mockStats);
    expect(component.students).toEqual(mockStudents);
    expect(component.courses).toEqual(mockCourses);
    expect(component.loading).toBeFalse();
  });

  it('should handle error when loading data', async () => {
    // Setup spies - make one fail and others succeed
    apiService.getStats.and.returnValue(throwError(() => new Error('API Error')));
    apiService.getStudents.and.returnValue(of(mockStudents));
    apiService.getCourses.and.returnValue(of(mockCourses));
    
    spyOn(console, 'error'); // Suppress console error logs during testing
    
    // Call loadAllData and wait for it to complete
    await component.loadAllData();
    
    expect(component.error).toBe('Failed to load statistics. Please try again.');
    expect(component.loading).toBeFalse();
  });

  it('should get major data with percentages', () => {
    component.stats = mockStats;
    
    const majorData = component.getMajorData();
    
    expect(majorData.length).toBe(3);
    expect(majorData[0]).toEqual({ major: 'Computer Science', count: 2, percentage: 40 });
    expect(majorData[1]).toEqual({ major: 'Mathematics', count: 1, percentage: 20 });
    expect(majorData[2]).toEqual({ major: 'Physics', count: 2, percentage: 40 });
  });

  it('should get year data sorted by year', () => {
    component.stats = mockStats;
    
    const yearData = component.getYearData();
    
    expect(yearData.length).toBe(4);
    expect(yearData[0]).toEqual({ year: 1, count: 1, percentage: 20 });
    expect(yearData[1]).toEqual({ year: 2, count: 2, percentage: 40 });
    expect(yearData[2]).toEqual({ year: 3, count: 1, percentage: 20 });
    expect(yearData[3]).toEqual({ year: 4, count: 1, percentage: 20 });
  });

  it('should get top major', () => {
    component.stats = mockStats;
    
    const topMajor = component.getTopMajor();
    
    // Both Computer Science and Physics have 2 students, so it could be either
    expect(['Computer Science', 'Physics']).toContain(topMajor);
  });

  it('should calculate average credits per course', () => {
    component.courses = mockCourses;
    
    const avgCredits = component.getAverageCreditsPerCourse();
    
    expect(avgCredits).toBe(3.3); // (3 + 4 + 3) / 3 = 3.33, rounded to 3.3
  });

  it('should get number of unique instructors', () => {
    component.courses = mockCourses;
    
    const uniqueInstructors = component.getUniqueInstructors();
    
    expect(uniqueInstructors).toBe(2); // Dr. Smith and Dr. Johnson
  });

  it('should group students by major', () => {
    component.students = mockStudents;
    
    const studentsPerMajor = component.getStudentsPerMajor();
    
    expect(studentsPerMajor.length).toBe(3);
    expect(studentsPerMajor[0].major).toBe('Computer Science'); // Should be sorted by count (desc)
    expect(studentsPerMajor[0].students.length).toBe(2);
  });

  it('should calculate instructor course load', () => {
    component.courses = mockCourses;
    
    const instructorLoad = component.getInstructorCourseLoad();
    
    expect(instructorLoad.length).toBe(2);
    expect(instructorLoad[0].instructor).toBe('Dr. Smith'); // Should be sorted by total credits (desc)
    expect(instructorLoad[0].totalCredits).toBe(6); // 3 + 3
    expect(instructorLoad[1].instructor).toBe('Dr. Johnson');
    expect(instructorLoad[1].totalCredits).toBe(4);
  });

  it('should calculate total credits offered', () => {
    component.courses = mockCourses;
    
    const totalCredits = component.getTotalCreditsOffered();
    
    expect(totalCredits).toBe(10); // 3 + 4 + 3
  });

  it('should get most active year', () => {
    component.stats = mockStats;
    
    const mostActiveYear = component.getMostActiveYear();
    
    expect(mostActiveYear).toBe(2); // Year 2 has 2 students (most)
  });

  it('should calculate enrollment trend', () => {
    component.stats = mockStats;
    
    const trend = component.getEnrollmentTrend();
    
    expect(trend.length).toBe(4);
    expect(trend[0].trend).toBe('stable'); // First year has no previous year to compare
    expect(trend[1].trend).toBe('up'); // Year 2 has more than Year 1
    expect(trend[2].trend).toBe('down'); // Year 3 has less than Year 2
    expect(trend[3].trend).toBe('stable'); // Year 4 has same as Year 3
  });

  it('should calculate capacity utilization', () => {
    component.courses = mockCourses;
    component.stats = mockStats;
    
    const utilization = component.getCapacityUtilization();
    
    expect(utilization).toBe(6); // 5 students / (3 courses * 30 capacity) * 100 = 5.56, rounded to 6
  });

  it('should calculate diversity index', () => {
    component.stats = mockStats;
    
    const diversity = component.getDiversityIndex();
    
    expect(diversity).toBeGreaterThan(0);
    expect(diversity).toBeLessThan(2); // Shannon diversity index max for 3 groups
  });

  it('should return empty arrays when stats is null', () => {
    component.stats = null;
    
    expect(component.getMajorData()).toEqual([]);
    expect(component.getYearData()).toEqual([]);
    expect(component.getTopMajor()).toBe('');
    expect(component.getMostActiveYear()).toBeNull();
  });

  it('should handle empty courses array', () => {
    component.courses = [];
    
    expect(component.getAverageCreditsPerCourse()).toBe(0);
    expect(component.getUniqueInstructors()).toBe(0);
    expect(component.getTotalCreditsOffered()).toBe(0);
  });
});
