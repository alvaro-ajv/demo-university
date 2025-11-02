import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Component } from '@angular/core';

// Mock component for routing tests
@Component({ template: '' })
class MockComponent { }

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule.withRoutes([
          { path: 'students', component: MockComponent },
          { path: 'courses', component: MockComponent },
          { path: 'stats', component: MockComponent }
        ])
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'university-dashboard' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('university-dashboard');
  });

  it('should render navigation links', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    const links = compiled.querySelectorAll('.nav-links a');
    expect(links.length).toBe(3);
    expect(links[0].textContent).toContain('Students');
    expect(links[1].textContent).toContain('Courses');
    expect(links[2].textContent).toContain('Statistics');
  });

  it('should have correct router links', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    const studentsLink = compiled.querySelector('a[routerLink="/students"]');
    const coursesLink = compiled.querySelector('a[routerLink="/courses"]');
    const statsLink = compiled.querySelector('a[routerLink="/stats"]');
    
    expect(studentsLink).toBeTruthy();
    expect(coursesLink).toBeTruthy();
    expect(statsLink).toBeTruthy();
  });
});
