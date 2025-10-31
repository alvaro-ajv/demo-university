import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService, Student, Course, Stats } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Students API', () => {
    it('should get all students', () => {
      const mockStudents: Student[] = [
        { id: 1, name: 'John Doe', email: 'john@test.com', major: 'Computer Science', year: 2 },
        { id: 2, name: 'Jane Smith', email: 'jane@test.com', major: 'Mathematics', year: 3 }
      ];

      service.getStudents().subscribe(students => {
        expect(students).toEqual(mockStudents);
        expect(students.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/students`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStudents);
    });

    it('should get a student by id', () => {
      const mockStudent: Student = { id: 1, name: 'John Doe', email: 'john@test.com', major: 'Computer Science', year: 2 };

      service.getStudent(1).subscribe(student => {
        expect(student).toEqual(mockStudent);
      });

      const req = httpMock.expectOne(`${baseUrl}/students/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStudent);
    });

    it('should create a student', () => {
      const newStudent = { name: 'New Student', email: 'new@test.com', major: 'Physics', year: 1 };
      const createdStudent: Student = { id: 3, ...newStudent };

      service.createStudent(newStudent).subscribe(student => {
        expect(student).toEqual(createdStudent);
      });

      const req = httpMock.expectOne(`${baseUrl}/students`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newStudent);
      req.flush(createdStudent);
    });

    it('should update a student', () => {
      const updatedData = { name: 'Updated Student', email: 'updated@test.com', major: 'Engineering', year: 2 };
      const updatedStudent: Student = { id: 1, ...updatedData };

      service.updateStudent(1, updatedData).subscribe(student => {
        expect(student).toEqual(updatedStudent);
      });

      const req = httpMock.expectOne(`${baseUrl}/students/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedData);
      req.flush(updatedStudent);
    });

    it('should delete a student', () => {
      const deleteResponse = { message: 'Student deleted successfully' };

      service.deleteStudent(1).subscribe(response => {
        expect(response).toEqual(deleteResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/students/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(deleteResponse);
    });
  });

  describe('Courses API', () => {
    it('should get all courses', () => {
      const mockCourses: Course[] = [
        { id: 1, name: 'Introduction to Programming', code: 'CS101', credits: 3, instructor: 'Dr. Smith' },
        { id: 2, name: 'Data Structures', code: 'CS201', credits: 4, instructor: 'Dr. Johnson' }
      ];

      service.getCourses().subscribe(courses => {
        expect(courses).toEqual(mockCourses);
        expect(courses.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/courses`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCourses);
    });

    it('should get a course by id', () => {
      const mockCourse: Course = { id: 1, name: 'Introduction to Programming', code: 'CS101', credits: 3, instructor: 'Dr. Smith' };

      service.getCourse(1).subscribe(course => {
        expect(course).toEqual(mockCourse);
      });

      const req = httpMock.expectOne(`${baseUrl}/courses/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCourse);
    });
  });

  describe('Statistics API', () => {
    it('should get statistics', () => {
      const mockStats: Stats = {
        total_students: 5,
        total_courses: 3,
        students_by_major: { 'Computer Science': 2, 'Mathematics': 1, 'Physics': 2 },
        students_by_year: { '1': 1, '2': 2, '3': 1, '4': 1 }
      };

      service.getStats().subscribe(stats => {
        expect(stats).toEqual(mockStats);
        expect(stats.total_students).toBe(5);
        expect(stats.total_courses).toBe(3);
      });

      const req = httpMock.expectOne(`${baseUrl}/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });

  describe('Health Check', () => {
    it('should perform health check', () => {
      const healthResponse = { status: 'healthy', service: 'university-api' };

      service.healthCheck().subscribe(response => {
        expect(response).toEqual(healthResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/health`);
      expect(req.request.method).toBe('GET');
      req.flush(healthResponse);
    });
  });
});
