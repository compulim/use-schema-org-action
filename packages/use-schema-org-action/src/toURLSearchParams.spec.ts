import toURLSearchParams from './toURLSearchParams.ts';

let urlSearchParams: URLSearchParams;

beforeEach(() => {
  urlSearchParams = toURLSearchParams(
    new Map<string, unknown>([
      ['booleanFalse', false],
      ['booleanTrue', true],
      ['date', new Date(0)],
      ['numberZero', 0],
      ['numberNegativeOne', -1],
      ['numberPositiveOne', 1],
      ['numberInfinity', Infinity],
      ['numberNegativeInfinity', -Infinity],
      ['numberNotANumber', NaN],
      ['null', null],
      ['string', 'Hello, World!'],
      ['stringEmpty', ''],
      ['undefined', undefined]
    ])
  );
});

test('boolean of false should work', () => expect(urlSearchParams.get('booleanFalse')).toBe('false'));
test('boolean of true should work', () => expect(urlSearchParams.get('booleanTrue')).toBe('true'));
test('date should work', () => expect(urlSearchParams.get('date')).toBe('1970-01-01T00:00:00.000Z'));
test('number of zero should work', () => expect(urlSearchParams.get('numberZero')).toBe('0'));
test('number of negative one should work', () => expect(urlSearchParams.get('numberNegativeOne')).toBe('-1'));
test('number of positive one should work', () => expect(urlSearchParams.get('numberPositiveOne')).toBe('1'));
test('number of infinity should work', () => expect(urlSearchParams.get('numberInfinity')).toBe('Infinity'));
test('number of negative infinity should work', () =>
  expect(urlSearchParams.get('numberNegativeInfinity')).toBe('-Infinity'));
test('number of not-a-number should work', () => expect(urlSearchParams.get('numberNotANumber')).toBe('NaN'));
test('null should work', () => expect(urlSearchParams.get('null')).toBe(''));
test('string should work', () => expect(urlSearchParams.get('string')).toBe('Hello, World!'));
test('string of empty should work', () => expect(urlSearchParams.get('stringEmpty')).toBe(''));
test('undefined should work', () => expect(urlSearchParams.get('undefined')).toBe(''));

test('toString should work', () =>
  expect(urlSearchParams.toString()).toBe(
    'booleanFalse=false&booleanTrue=true&date=1970-01-01T00%3A00%3A00.000Z&numberZero=0&numberNegativeOne=-1&numberPositiveOne=1&numberInfinity=Infinity&numberNegativeInfinity=-Infinity&numberNotANumber=NaN&null=&string=Hello%2C+World%21&stringEmpty=&undefined='
  ));
