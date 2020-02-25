import { ConfigManager } from './config-manager';
import { Config } from './config-data';

const storageKey = 'Config';

describe('ConfigManager', () => {
  it('should return a reference to the global config data', () => {
    const firstRef = new ConfigManager().GetConfig();
    const secondRef = new ConfigManager().GetConfig();
    firstRef.Authentication.User = `TestUser${Date.now()}`;
    expect(secondRef).toBe(firstRef);
  });

  it('should alert subscribers when the config is saved', () => {
    const manager = new ConfigManager();
    const subscriber = {
      alert: () => { }
    };
    const alertSpy = spyOn(subscriber, 'alert');
    manager.Subscribe(() => { subscriber.alert(); });
    manager.Save();
    expect(alertSpy).toHaveBeenCalled();
  });

  it('should save data to local storage', () => {
    const manager = new ConfigManager();
    const current = localStorage.getItem(storageKey);
    try {
      const testData = manager.GetConfig();
      testData.Authentication.User = `TestUser${Date.now()}`;
      manager.Save();
      const loadedJson = localStorage.getItem(storageKey);
      expect(loadedJson).toBeTruthy();
      const loadedData = JSON.parse(loadedJson!);
      expect(loadedData.Authentication.User).toBe(testData.Authentication.User);
    } finally {
      if (current) {
        localStorage.setItem(storageKey, current);
      }
    }
  });

  it('should load data from local storage', () => {
    const manager = new ConfigManager();
    const current = localStorage.getItem(storageKey);
    try {
      const testData = new Config();
      testData.Authentication.User = `TestUser${Date.now()}`;
      let loadedData: Config;
      localStorage.setItem(storageKey, JSON.stringify(testData));
      manager.Load();
      loadedData = manager.GetConfig();
      expect(loadedData.Authentication.User).toBe(testData.Authentication.User);
    } finally {
      if (current) {
        localStorage.setItem(storageKey, current);
      }
    }
  });
});

