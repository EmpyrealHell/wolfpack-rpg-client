import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth.data';
import { UserService } from './user.service';

describe('UserService', () => {
  const cachedResponseKey = 'cachedResponse';

  const httpObj = jasmine.createSpyObj('HttpClient', ['get']);
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(httpObj as jasmine.SpyObj<HttpClient>);
  });

  it('should call the twitch oauth validation service', async () => {
    httpObj.get.and.returnValue({
      toPromise: () => new Promise<void>(resolve => resolve()),
    });
    const token = `token-${Date.now()}`;
    userService.updateCache(null);

    await userService.getUserAuth(token);
    expect(httpObj.get).toHaveBeenCalled();
    const call = httpObj.get.calls.mostRecent();
    const opts = call.args[1];
    expect(opts.headers.Authorization).toContain(token);
  });

  it('should update the user cache', () => {
    const newCache = {} as AuthData;
    userService.updateCache(newCache);
    expect(UserService[cachedResponseKey]).toBe(newCache);
  });

  it('should use the user cache', async () => {
    const newCache = {} as AuthData;
    userService.updateCache(newCache);
    const userInfo = await userService.getUserAuth('');
    expect(userInfo).toBe(newCache);
  });
});
