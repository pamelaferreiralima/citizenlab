import { parsePopulationValue } from './utils';

describe('parsePopulationValue', () => {
  it('returns empty string if value is emtpy string', () => {
    expect(parsePopulationValue('')).toBe('');
  });

  it('returns null if value contains anything other than numbers or commas', () => {
    expect(parsePopulationValue('a')).toBeNull();
    expect(parsePopulationValue('1a')).toBeNull();
    expect(parsePopulationValue('1,a')).toBeNull();
    expect(parsePopulationValue('-1,000')).toBeNull();
    expect(parsePopulationValue('%,000')).toBeNull();
  });

  it('returns null if value starts with comma', () => {
    expect(parsePopulationValue(',1')).toBeNull();
    expect(parsePopulationValue(',111')).toBeNull();
  });

  it('returns null if value contains only commas', () => {
    expect(parsePopulationValue(',')).toBeNull();
    expect(parsePopulationValue(',,,')).toBeNull();
  });

  it('returns correct string if value contains only numbers', () => {
    expect(parsePopulationValue('1')).toBe('1');
    expect(parsePopulationValue('1000')).toBe('1,000');
    expect(parsePopulationValue('1000000')).toBe('1,000,000');
  });

  it('returns correct string if value contains only numbers and commas', () => {
    expect(parsePopulationValue('1,')).toBe('1');
    expect(parsePopulationValue('1000,')).toBe('1,000');
    expect(parsePopulationValue('1000,000,')).toBe('1,000,000');
    expect(parsePopulationValue('1000,000,,,')).toBe('1,000,000');
  });

  it('returns correct string if value has multiple commas', () => {
    expect(parsePopulationValue('1,000,0000')).toBe('10,000,000');
  });

  it('returns null if value is longer than 11 characters (e.g. 100,000,0000', () => {
    expect(parsePopulationValue('100,000,0000')).toBeNull();
  });
});
