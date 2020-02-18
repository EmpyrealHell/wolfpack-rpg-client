import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthComponent } from './auth.component';
import { ConfigManager } from '../../services/data/config-manager';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { ConfigAuthentication } from '../../services/data/config-data';
import { Utils } from 'src/app/util/utils';


const userInfo = {
  login: 'testuser',
  scopes: ['chat:read']
};
const configManagerSpy = jasmine.createSpyObj('ConfigManager', ['Save']);
const userServiceSpy = jasmine.createSpyObj('UserService', ['GetUserInfo', 'UpdateCache']);
userServiceSpy.GetUserInfo.and.returnValue(userInfo);
const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
const activatedRouteSpy = {
  snapshot: {
    fragment: 'state=test&access_token=token'
  }
} as ActivatedRoute;

describe('AuthComponent', () => {
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
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();
  }));

  it('should validate saved tokens', async () => {
    const fixture = TestBed.createComponent(AuthComponent);
    const router = TestBed.get<Router>(Router);

    const configAuth = new ConfigAuthentication();
    configAuth.State = 'test';
    await fixture.componentInstance.ValidateToken(configAuth, configManagerSpy, userServiceSpy, routerSpy);
    expect(userServiceSpy.GetUserInfo).toHaveBeenCalled();
    expect(configAuth.User).toBe(userInfo.login);
    expect(configAuth.Scope).toBe(Utils.StringJoin(' ', userInfo.scopes));
    expect(userServiceSpy.UpdateCache).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/play']);
  });
});
