import { Utils } from './utils';

describe('Utils', () => {
  it('should return true if all items in the target array exist in the source', () => {
    const source = ['a', 'b', 'c'];
    const target = ['a', 'b'];
    expect(Utils.HasAll(source, target)).toBeTruthy();
  });

  it('should return false if all items in the target array do not exist in the source', () => {
    const source = ['a', 'b', 'c'];
    const target = ['a', 'b', 'd'];
    expect(Utils.HasAll(source, target)).toBeFalsy();
  });

  it('should return false if either item is not an array', () => {
    const array = ['a', 'b', 'c'];
    expect(Utils.HasAll(array, null)).toBeFalsy();
    expect(Utils.HasAll(null, array)).toBeFalsy();
  });

  it('should create a map from a delimited list of key-value pairs', () => {
    const input = 'a=1&b=2&c=3';
    const map = Utils.CreateMap('&', '=', input);
    expect(map.has('a') && map.has('b') && map.has('c')).toBeTruthy();
    expect(map.get('a')).toEqual('1');
    expect(map.get('b')).toEqual('2');
    expect(map.get('c')).toEqual('3');
  });

  it('should return an empty map if the input string is invalid', () => {
    const input = 'a=1&b=2&c=3';
    let map = Utils.CreateMap('|', '-', input);
    expect(map.size).toBe(0);
    map = Utils.CreateMap('&', '=', null);
    expect(map.size).toBe(0);
    map = Utils.CreateMap('&', null, input);
    expect(map.size).toBe(0);
    map = Utils.CreateMap(null, '=', input);
    expect(map.size).toBe(0);
  });

  it('should generate a random state of the correct size', () => {
    const size = 32;
    const state = Utils.GenerateState(size);
    expect(state.length).toBe(size * 2);
    const otherState = Utils.GenerateState(size);
    expect(state).not.toEqual(otherState);
  });

  it('should join an array of strings with a delimiter', () => {
    const array = ['one', 'two', 'three'];
    const joined = 'one, two, three';
    expect(Utils.StringJoin(', ', array)).toEqual(joined);
  });

  it('should join an array of strings without a delimiter', () => {
    const array = ['one', 'two', 'three'];
    const joined = 'onetwothree';
    expect(Utils.StringJoin(null, array)).toEqual(joined);
  });

  it('should await a promise', async () => {
    let called = false;
    const promise = new Promise(resolve => {
      setTimeout(() => {
        called = true;
        resolve(true);
      }, 50);
    });

    const response = await Utils.PromiseWithReject(promise);
    expect(response.Success).toBeTruthy();
    expect(response.Response).toBeTruthy();
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

    const response = await Utils.PromiseWithReject(promise);
    expect(response.Success).toBeFalsy();
    expect(response.Response).toBeFalsy();
    expect(called).toBeFalsy();
  });
});
