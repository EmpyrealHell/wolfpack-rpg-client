import { Utils } from './utils';

describe('Utils', () => {
  it('should return true if all items in the target array exist in the source', () => {
    const source = ['a', 'b', 'c'];
    const target = ['a', 'b'];
    expect(Utils.hasAll(source, target)).toBeTruthy();
  });

  it('should return false if all items in the target array do not exist in the source', () => {
    const source = ['a', 'b', 'c'];
    const target = ['a', 'b', 'd'];
    expect(Utils.hasAll(source, target)).toBeFalsy();
  });

  it('should create a map from a delimited list of key-value pairs', () => {
    const input = 'a=1&b=2&c=3';
    const map = Utils.createMap('&', '=', input);
    expect(map.has('a') && map.has('b') && map.has('c')).toBeTruthy();
    expect(map.get('a')).toEqual('1');
    expect(map.get('b')).toEqual('2');
    expect(map.get('c')).toEqual('3');
  });

  it('should return an empty map if the input string is invalid', () => {
    const input = 'a=1&b=2&c=3';
    const map = Utils.createMap('|', '-', input);
    expect(map.size).toBe(0);
  });

  it('should generate a random state of the correct size', () => {
    const size = 32;
    const state = Utils.generateState(size);
    expect(state.length).toBe(size * 2);
    const otherState = Utils.generateState(size);
    expect(state).not.toEqual(otherState);
  });

  it('should join an array of strings with a delimiter', () => {
    const array = ['one', 'two', 'three'];
    const joined = 'one, two, three';
    expect(Utils.stringJoin(', ', array)).toEqual(joined);
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
    expect(response.success).toBeTruthy();
    expect(response.response).toBeTruthy();
    expect(called).toBeTruthy();
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
    expect(response.success).toBeFalsy();
    expect(response.response).toBeFalsy();
    expect(called).toBeFalsy();
  });
});
