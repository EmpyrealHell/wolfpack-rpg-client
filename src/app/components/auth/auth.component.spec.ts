import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthComponent } from './auth.component';
import { ConfigManager } from '../../services/data/config-manager';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { ConfigAuthentication } from '../../services/data/config-data';

const configManagerSpy = jasmine.createSpyObj('ConfigManager', ['Save']);
const userServiceSpy = jasmine.createSpyObj('UserService', ['UpdateCache', 'GetUserInfo']);
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const routeSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AuthComponent
      ],
      providers: [
        { provide: ConfigManager, use: configManagerSpy },
        { provide: UserService, use: userServiceSpy },
        { provide: Router, use: routerSpy },
        { provide: ActivatedRoute, use: routeSpy }
      ]
    }).compileComponents();
  }));

  it('should validate saved tokens', () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const router = TestBed.get<Router>(Router);

    const configAuth = new ConfigAuthentication();
    fixture.componentInstance.ValidateToken(configAuth, configManagerSpy, userServiceSpy, routerSpy);
    expect(userServiceSpy).toHaveBeenCalled();
  });

  it(`should have as title 'wolfpack-rpg-client'`, () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('wolfpack-rpg-client');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AuthComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('wolfpack-rpg-client app is running!');
  });
});
