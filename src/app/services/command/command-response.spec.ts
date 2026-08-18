import { RegExpNamed } from './command-response';

describe('CommandResponse', () => {
  it('should create a regex with named groups extracted', async () => {
    const named = new RegExpNamed('(?<namedGroup>.*)');
    await expect(named.pattern.source).toBe('(.*)');
    await expect(named.names.length).toBe(1);
    await expect(named.names[0]).toBe('namedGroup');
  });

  it('should ignore non-capturing groups', async () => {
    const named = new RegExpNamed('(?:.*)');
    await expect(named.pattern.source).toBe('(?:.*)');
    await expect(named.names.length).toBe(0);
  });

  it('should give a default name to unnamed groups', async () => {
    const named = new RegExpNamed('(.*)');
    await expect(named.names.length).toBe(1);
    await expect(named.names[0]).toBe('group0');
  });
});
