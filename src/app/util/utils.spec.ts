import { Utils } from './utils';

describe('Utils', () => {
  it('should return true if all items in the target array exist in the source', async () => {
    const source = ['a', 'b', 'c'];
    const target = ['a', 'b'];
    await expect(Utils.hasAll(source, target)).toBeTruthy();
  });

  it('should return false if all items in the target array do not exist in the source', async () => {
    const source = ['a', 'b', 'c'];
    const target = ['a', 'b', 'd'];
    await expect(Utils.hasAll(source, target)).toBeFalsy();
  });

  it('should create a map from a delimited list of key-value pairs', async () => {
    const input = 'a=1&b=2&c=3';
    const map = Utils.createMap('&', '=', input);
    await expect(map.has('a') && map.has('b') && map.has('c')).toBeTruthy();
    await expect(map.get('a')).toEqual('1');
    await expect(map.get('b')).toEqual('2');
    await expect(map.get('c')).toEqual('3');
  });

  it('should return an empty map if the input string is invalid', async () => {
    const input = 'a=1&b=2&c=3';
    const map = Utils.createMap('|', '-', input);
    await expect(map.size).toBe(0);
  });

  it('should generate a random state of the correct size', async () => {
    const size = 32;
    const state = Utils.generateState(size);
    await expect(state.length).toBe(size * 2);
    const otherState = Utils.generateState(size);
    await expect(state).not.toEqual(otherState);
  });

  it('should join an array of strings with a delimiter', async () => {
    const array = ['one', 'two', 'three'];
    const joined = 'one, two, three';
    await expect(Utils.stringJoin(', ', array)).toEqual(joined);
  });

  it('should await a promise', async () => {
    let called = false;
    const promise = new Promise(resolve => {
      setTimeout(() => {
        called = true;
        resolve(true);
      }, 50);
    });

    const response = await Utils.promiseWithReject(promise);
    await expect(response.success).toBeTruthy();
    await expect(response.response).toBeTruthy();
    await expect(called).toBeTruthy();
  });

  it('should await a rejected promise', async () => {
    let called = false;
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        called = true;
        resolve(true);
      }, 500);
      setTimeout(() => {
        reject(false);
      }, 50);
    });

    const response = await Utils.promiseWithReject(promise);
    await expect(response.success).toBeFalsy();
    await expect(response.response).toBeFalsy();
    await expect(called).toBeFalsy();
  });

  it('should find all matches in a string for a global regexp', async () => {
    const regexp = /(c)/g;
    const str = 'acca';
    const result = Utils.execAll(regexp, str);
    await expect(result.length).toBe(2);
    await expect(result[0].length).toBe(2);
    await expect(result[1].length).toBe(2);
    const capture = result[0] ? result[0][1] : '';
    await expect(capture).toBe('c');
  });

  it('should find all matches in a string for a non-global regexp', async () => {
    const regexp = /(c)/;
    const str = 'acca';
    const result = Utils.execAll(regexp, str);
    await expect(result.length).toBe(2);
    await expect(result[0].length).toBe(2);
    await expect(result[1].length).toBe(2);
    const cname = result[0] ? result[0][1] : '';
    await expect(cname).toBe('c');
  });

  it('should return an empty array if there are no matches', async () => {
    const regexp = /c/;
    const str = 'aa';
    const result = Utils.execAll(regexp, str);
    await expect(result.length).toBe(0);
  });

  it('should create a map of named captures', async () => {
    const regexp = /(?<cname>c)/g;
    const str = 'acca';
    const result = Utils.execAll(regexp, str);
    await expect(result.length).toBe(2);
    const map = Utils.extractNameCaptures(result[0]);
    await expect(map.size).toBe(1);
    await expect(map.get('cname')).toBe('c');
  });
});
