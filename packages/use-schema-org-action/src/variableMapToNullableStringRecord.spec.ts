import { type VariableMap } from './VariableMap.ts';
import variableMapToNullableStringRecord from './variableMapToNullableStringRecord.ts';

describe('when converting a variable map', () => {
  let record: Record<string, null | string>;
  let variableMap: VariableMap;

  beforeEach(() => {
    variableMap = new Map<string, boolean | Date | number | string | undefined>([
      ['boolean', true],
      ['Date', new Date(0)],
      ['number', 1],
      ['string', 'Hello, World!'],
      ['undefined', undefined]
    ]);

    record = variableMapToNullableStringRecord(variableMap);
  });

  test('should have 5 fields', () => expect(Object.entries(record)).toHaveLength(5));
  test('should convert boolean', () => expect(record).toHaveProperty('boolean', 'true'));
  test('should convert Date to ISO formatted string', () =>
    expect(record).toHaveProperty('Date', '1970-01-01T00:00:00.000Z'));
  test('should convert number', () => expect(record).toHaveProperty('number', '1'));
  test('should convert string', () => expect(record).toHaveProperty('string', 'Hello, World!'));
  test('should convert undefined to null', () => expect(record).toHaveProperty('undefined', null));
});
