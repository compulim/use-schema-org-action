import toURLTemplateData from './toURLTemplateData';

let urlTemplateData: Record<string, string[]>;

beforeEach(() => {
  urlTemplateData = toURLTemplateData(
    new Map<string, any>([
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

test('boolean of false should work', () => expect(urlTemplateData).toHaveProperty('booleanFalse', ['false']));
test('boolean of true should work', () => expect(urlTemplateData).toHaveProperty('booleanTrue', ['true']));
test('date should work', () => expect(urlTemplateData).toHaveProperty('date', ['1970-01-01T00:00:00.000Z']));
test('number of zero should work', () => expect(urlTemplateData).toHaveProperty('numberZero', ['0']));
test('number of negative one should work', () => expect(urlTemplateData).toHaveProperty('numberNegativeOne', ['-1']));
test('number of positive one should work', () => expect(urlTemplateData).toHaveProperty('numberPositiveOne', ['1']));
test('number of infinity should work', () => expect(urlTemplateData).toHaveProperty('numberInfinity', ['Infinity']));
test('number of negative infinity should work', () =>
  expect(urlTemplateData).toHaveProperty('numberNegativeInfinity', ['-Infinity']));
test('number of not-a-number should work', () => expect(urlTemplateData).toHaveProperty('numberNotANumber', ['NaN']));
test('null should work', () => expect(urlTemplateData).toHaveProperty('null', ['']));
test('string should work', () => expect(urlTemplateData).toHaveProperty('string', ['Hello, World!']));
test('string of empty should work', () => expect(urlTemplateData).toHaveProperty('stringEmpty', ['']));
test('undefined should work', () => expect(urlTemplateData).toHaveProperty('undefined', ['']));

test('should match', () =>
  expect(urlTemplateData).toEqual({
    booleanFalse: ['false'],
    booleanTrue: ['true'],
    date: ['1970-01-01T00:00:00.000Z'],
    numberZero: ['0'],
    numberNegativeOne: ['-1'],
    numberPositiveOne: ['1'],
    numberInfinity: ['Infinity'],
    numberNegativeInfinity: ['-Infinity'],
    numberNotANumber: ['NaN'],
    null: [''],
    string: ['Hello, World!'],
    stringEmpty: [''],
    undefined: ['']
  }));
