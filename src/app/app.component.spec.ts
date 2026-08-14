import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(async () => {
    await TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    declarations: [AppComponent],
}).compileComponents();
  }));

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(AppComponent),
      app = fixture.debugElement.componentInstance;
    await expect(app).toBeTruthy();
  });
});
