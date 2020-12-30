import { RegExpNamed } from './command-response';

describe('CommandResponse', () => {
  it('should create a regex with named groups extracted', () => {
    const named = new RegExpNamed('(?<namedGroup>.*)');
    expect(named.pattern.source).toBe('(.*)');
    expect(named.names.length).toBe(1);
    expect(named.names[0]).toBe('namedGroup');
  });

  it('should ignore non-capturing groups', () => {
    const named = new RegExpNamed('(?:.*)');
    expect(named.pattern.source).toBe('(?:.*)');
    expect(named.names.length).toBe(0);
  });

  it('should give a default name to unnamed groups', () => {
    const named = new RegExpNamed('(.*)');
    expect(named.names.length).toBe(1);
    expect(named.names[0]).toBe('group0');
  });
});
