import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseCities } from './mapUtils';

describe('parseCities', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should parse valid JSON array of cities', () => {
    const input = '["Budapest", "Debrecen"]';
    const result = parseCities(input);
    expect(result).toEqual(["Budapest", "Debrecen"]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should handle empty JSON array', () => {
    const input = '[]';
    const result = parseCities(input);
    expect(result).toEqual([]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should return empty array for undefined input', () => {
    const result = parseCities(undefined);
    expect(result).toEqual([]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return empty array for null input', () => {
    const result = parseCities(null);
    expect(result).toEqual([]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return empty array for empty string input', () => {
    const result = parseCities('');
    expect(result).toEqual([]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return empty array and log error for invalid JSON', () => {
    const input = 'invalid json';
    const result = parseCities(input);
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should return empty array and log warning for valid JSON that is not an array', () => {
    const input = '{"key": "value"}';
    const result = parseCities(input);
    expect(result).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});
