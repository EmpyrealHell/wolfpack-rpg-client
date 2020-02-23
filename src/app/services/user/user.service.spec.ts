import { UserData } from './user.data';
import { UserService } from './user.service';
import { TestUtils, ClassSpy } from 'src/test/test-utils';
import { HttpClient } from '@angular/common/http';


describe('UserService', () => {
  const cachedResponseKey = 'cachedResponse';

  const httpObj = TestUtils.spyOnClass(HttpClient);
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(httpObj as any);
  });

  it('should call the twitch oauth validation service', async () => {
    httpObj.get.and.returnValue({
      toPromise: () => new Promise(resolve => resolve())
    });
    const token = `token-${Date.now()}`;
    userService.UpdateCache(undefined);

    await userService.GetUserInfo(token);
    expect(httpObj.get).toHaveBeenCalled();
    const call = httpObj.get.calls.mostRecent();
    const opts = call.args[1];
    expect(opts.headers.Authorization).toContain(token);
  });

  it('should update the user cache', () => {
    const newCache = {} as UserData;
    userService.UpdateCache(newCache);
    expect(UserService[cachedResponseKey]).toBe(newCache);
  });

  it('should use the user cache', async () => {
    const newCache = {} as UserData;
    userService.UpdateCache(newCache);
    const userInfo = await userService.GetUserInfo(null);
    expect(userInfo).toBe(newCache);
  });
});
