import { ConfigManager } from './config-manager';
import { Config } from './config-data';

const storageKey = 'Config';

describe('ConfigManager', () => {
  it('should return a reference to the global config data', async () => {
    const firstRef = new ConfigManager().getConfig(),
      secondRef = new ConfigManager().getConfig();
    firstRef.authentication.user = `TestUser${Date.now()}`;
    await expect(secondRef).toBe(firstRef);
  });

  it('should alert subscribers when the config is saved', async () => {
    const manager = new ConfigManager(),
      subscriber = {
        alert: () => {},
      },
      alertSpy = spyOn(subscriber, 'alert');
    manager.subscribe(() => {
      subscriber.alert();
    });
    manager.save();
    await expect(alertSpy).toHaveBeenCalled();
  });

  it('should save data to local storage', async () => {
    const manager = new ConfigManager(),
      current = localStorage.getItem(storageKey);
    try {
      const testData = manager.getConfig();
      testData.authentication.user = `TestUser${Date.now()}`;
      manager.save();
      const loadedJson = localStorage.getItem(storageKey);
      await expect(loadedJson).toBeTruthy();
      const loadedData = JSON.parse(loadedJson!) as Config;
      await expect(loadedData.authentication.user).toBe(
        testData.authentication.user
      );
    } finally {
      if (current) {
        localStorage.setItem(storageKey, current);
      }
    }
  });

  it('should load data from local storage', async () => {
    const manager = new ConfigManager(),
      current = localStorage.getItem(storageKey);
    try {
      const testData = new Config();
      testData.authentication.user = `TestUser${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(testData));
      manager.load();
      const loadedData = manager.getConfig();
      await expect(loadedData.authentication.user).toBe(
        testData.authentication.user
      );
    } finally {
      if (current) {
        localStorage.setItem(storageKey, current);
      }
    }
  });
});
