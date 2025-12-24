import { beforeEach, describe, expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { toValibotSchema } from './PropertyValueSpecificationSchema.ts';

describe('toValibotSchema', () => {
  describe('for string', () => {
    describe('when valueMaxLength is set', () => {
      describe.each([
        ['by string', 'maxlength=5'],
        ['by object as number', { '@type': 'PropertyValueSpecification' as const, valueMaxLength: 5 }],
        ['by object as string', { '@type': 'PropertyValueSpecification' as const, valueMaxLength: '5' }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => expect(parse(schema, 'Hello')).toBe('Hello'));
        test('should honor failure', () => expect(() => parse(schema, 'Hello, World!')).toThrow());
      });
    });

    describe('when valueMaxLength is not set', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, 'Hello')).toBe('Hello'));
      });
    });

    describe('when valueMinLength is set', () => {
      describe.each([
        ['by string', 'minlength=5'],
        ['by object as number', { '@type': 'PropertyValueSpecification' as const, valueMinLength: 5 }],
        ['by object as string', { '@type': 'PropertyValueSpecification' as const, valueMinLength: '5' }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => expect(parse(schema, 'Hello, World!')).toBe('Hello, World!'));
        test('should honor failure', () => expect(() => parse(schema, 'ABC')).toThrow());
      });
    });

    describe('when valueMinLength is unset', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, 'Hello, World!')).toBe('Hello, World!'));
      });
    });

    describe('when valuePattern is set', () => {
      describe.each([
        ['by string', 'pattern=^\\d$'],
        ['by object', { '@type': 'PropertyValueSpecification' as const, valuePattern: /^\d$/u }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => expect(parse(schema, '1')).toBe('1'));
        test('should honor failure', () => expect(() => parse(schema, 'ABC')).toThrow());
      });
    });

    describe('when valuePattern is unset', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, 'ABC')).toBe('ABC'));
      });
    });

    describe('when multipleValues is set', () => {
      describe.each([
        ['by string', 'multiple'],
        ['by object', { '@type': 'PropertyValueSpecification' as const, multipleValues: true }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('when passing an array should success', () =>
          expect(parse(schema, ['Hello, World!'])).toEqual(['Hello, World!']));

        test('when passing a literal should fail', () => expect(() => parse(schema, 'Hello, World!')).toThrow());
      });
    });

    describe('when multipleValues is not set', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor failure', () => expect(() => parse(schema, ['Hello, World!'])).toThrow());
      });
    });

    describe('when defaultValue is set', () => {
      describe.each([
        // ['by quoted string', 'value="Hello, World!"', 'Hello, World!'],
        ['by unquoted string', 'value=Aloha!', 'Aloha!'],
        [
          'by object',
          { '@type': 'PropertyValueSpecification' as const, defaultValue: 'Hello, World!' },
          'Hello, World!'
        ]
      ])('%s', (_, propertyValueSpecification, expectedValue) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should return default value', () => expect(parse(schema, undefined)).toBe(expectedValue));
      });
    });

    describe('when valueRequired is set to true', () => {
      describe.each([
        ['by string', 'required'],
        ['by object', { '@type': 'PropertyValueSpecification' as const, valueRequired: true }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => expect(parse(schema, 'Hello, World!')).toBe('Hello, World!'));
        test('should honor failure', () => expect(() => parse(schema, undefined)).toThrow());
      });
    });

    describe('when valueRequired is set to false', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const, valueRequired: false }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, undefined)).toBeUndefined());
      });
    });

    describe('when defaultValue does not meet other constraints', () => {
      describe.each([
        ['by string', 'maxlength=5 value=Aloha!'],
        [
          'by object',
          { '@type': 'PropertyValueSpecification' as const, defaultValue: 'Hello, World!', valueMaxLength: 5 }
        ]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should fail on undefined', () => expect(() => parse(schema, undefined)).toThrow());
        test('should honor success', () => expect(parse(schema, 'Hello')).toBe('Hello'));
      });
    });
  });

  describe('for number', () => {
    describe('when maxValue is set', () => {
      describe.each([
        ['by string', 'max=5'],
        ['by object', { '@type': 'PropertyValueSpecification' as const, maxValue: 5 }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => expect(parse(schema, 5)).toBe(5));
        test('should honor failure', () => expect(() => parse(schema, 100)).toThrow());
      });
    });

    describe('when maxValue is not set', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, 100)).toBe(100));
      });
    });

    describe('when minValue is set', () => {
      describe.each([
        ['by string', 'min=5'],
        ['by object as number', { '@type': 'PropertyValueSpecification' as const, minValue: 5 }],
        ['by object as string', { '@type': 'PropertyValueSpecification' as const, minValue: '5' }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => expect(parse(schema, 5)).toBe(5));
        test('should honor failure', () => expect(() => parse(schema, 0)).toThrow());
      });
    });

    describe('when minValue is unset', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, 0)).toBe(0));
      });
    });

    describe('when stepValue is set', () => {
      describe.each([
        ['by string', 'step=5'],
        ['by object as number', { '@type': 'PropertyValueSpecification' as const, stepValue: 5 }],
        ['by object as string', { '@type': 'PropertyValueSpecification' as const, stepValue: '5' }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => expect(parse(schema, 10)).toBe(10));
        test('should honor failure', () => expect(() => parse(schema, 1)).toThrow());
      });
    });

    describe('when stepValue is unset', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, 1)).toBe(1));
      });
    });

    describe('when multipleValues is set', () => {
      describe.each([
        ['by string', 'multiple'],
        ['by object', { '@type': 'PropertyValueSpecification' as const, multipleValues: true }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('when passing an array should success', () => expect(parse(schema, [1, 2, 3])).toEqual([1, 2, 3]));
        test('when passing a literal should fail', () => expect(() => parse(schema, 0)).toThrow());
      });
    });

    describe('when multipleValues is not set', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor failure', () => expect(() => parse(schema, [0])).toThrow());
      });
    });

    describe('when defaultValue is set', () => {
      // Cannot set "defaultValue" of type number by string.
      describe.each([['by object', { '@type': 'PropertyValueSpecification' as const, defaultValue: 123 }]])(
        '%s',
        (_, propertyValueSpecification) => {
          let schema: ReturnType<typeof toValibotSchema>;

          beforeEach(() => {
            schema = toValibotSchema(propertyValueSpecification);
          });

          test('should return default value', () => expect(parse(schema, undefined)).toBe(123));
        }
      );
    });

    describe('when valueRequired is set to true', () => {
      describe.each([
        ['by string', 'required'],
        ['by object', { '@type': 'PropertyValueSpecification' as const, valueRequired: true }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => expect(parse(schema, 1)).toBe(1));
        test('should honor failure', () => expect(() => parse(schema, undefined)).toThrow());
      });
    });

    describe('when valueRequired is set to false', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const, valueRequired: false }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, undefined)).toBeUndefined());
      });
    });

    describe('when defaultValue does not meet other constraints', () => {
      // Cannot set "defaultValue" of type number by string.
      describe.each([['by object', { '@type': 'PropertyValueSpecification' as const, defaultValue: 1, minValue: 5 }]])(
        '%s',
        (_, propertyValueSpecification) => {
          let schema: ReturnType<typeof toValibotSchema>;

          beforeEach(() => {
            schema = toValibotSchema(propertyValueSpecification);
          });

          test('should fail on undefined', () => expect(() => parse(schema, undefined)).toThrow());
          test('should honor success', () => expect(parse(schema, 5)).toBe(5));
        }
      );
    });
  });

  describe('for Date', () => {
    describe('when maxValue is set', () => {
      describe.each([
        ['by string', 'max=1970-01-01T00:00:00.005Z'],
        ['by object as date', { '@type': 'PropertyValueSpecification' as const, maxValue: new Date(5) }],
        ['by object as number', { '@type': 'PropertyValueSpecification' as const, maxValue: 5 }],
        [
          'by object as string',
          { '@type': 'PropertyValueSpecification' as const, maxValue: '1970-01-01T00:00:00.005Z' }
        ]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => {
          const result = parse(schema, new Date(5));

          expect(result).toEqual(expect.any(Date));
          expect(+result).toBe(5);
        });

        test('should honor failure', () => expect(() => parse(schema, new Date(100))).toThrow());
      });
    });

    describe('when maxValue is not set', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => {
          const result = parse(schema, new Date(100));

          expect(result).toEqual(expect.any(Date));
          expect(+result).toBe(100);
        });
      });
    });

    describe('when minValue is set', () => {
      describe.each([
        ['by string', 'min=1970-01-01T00:00:00.005Z'],
        ['by object as date', { '@type': 'PropertyValueSpecification' as const, minValue: new Date(5) }],
        ['by object as number', { '@type': 'PropertyValueSpecification' as const, minValue: 5 }],
        [
          'by object as string',
          { '@type': 'PropertyValueSpecification' as const, minValue: '1970-01-01T00:00:00.005Z' }
        ]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => {
          const result = parse(schema, new Date(5));

          expect(result).toEqual(expect.any(Date));
          expect(+result).toBe(5);
        });

        test('should honor failure', () => expect(() => parse(schema, new Date(0))).toThrow());
      });
    });

    describe('when minValue is unset', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => {
          const result = parse(schema, new Date(1));

          expect(result).toEqual(expect.any(Date));
          expect(+result).toBe(1);
        });
      });
    });

    describe('when stepValue is set', () => {
      describe.each([
        ['by string', 'step=5'],
        ['by object as number', { '@type': 'PropertyValueSpecification' as const, stepValue: 5 }],
        ['by object as string', { '@type': 'PropertyValueSpecification' as const, stepValue: '5' }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => {
          const result = parse(schema, new Date(10));

          expect(result).toEqual(expect.any(Date));
          expect(+result).toBe(10);
        });

        test('should honor failure', () => expect(() => parse(schema, new Date(1))).toThrow());
      });
    });

    describe('when stepValue is unset', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => {
          const result = parse(schema, new Date(1));

          expect(result).toEqual(expect.any(Date));
          expect(+result).toBe(1);
        });
      });
    });

    describe('when multipleValues is set', () => {
      describe.each([
        ['by string', 'multiple'],
        ['by object', { '@type': 'PropertyValueSpecification' as const, multipleValues: true }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('when passing an array should success', () => {
          const result = parse(schema, [new Date(1), new Date(2), new Date(3)]);

          expect(result).toEqual([expect.any(Date), expect.any(Date), expect.any(Date)]);
          expect(+result[0]).toBe(1);
          expect(+result[1]).toBe(2);
          expect(+result[2]).toBe(3);
        });

        test('when passing a literal should fail', () => expect(() => parse(schema, new Date(0))).toThrow());
      });
    });

    describe('when multipleValues is not set', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor failure', () => expect(() => parse(schema, [new Date(0)])).toThrow());
      });
    });

    describe('when defaultValue is set', () => {
      // Cannot set "defaultValue" of type number by string.
      describe.each([['by object', { '@type': 'PropertyValueSpecification' as const, defaultValue: new Date(123) }]])(
        '%s',
        (_, propertyValueSpecification) => {
          let schema: ReturnType<typeof toValibotSchema>;

          beforeEach(() => {
            schema = toValibotSchema(propertyValueSpecification);
          });

          test('should return default value', () => {
            const result = parse(schema, undefined);

            expect(result).toEqual(expect.any(Date));
            expect(+result).toBe(123);
          });
        }
      );
    });

    describe('when valueRequired is set to true', () => {
      describe.each([
        ['by string', 'required'],
        ['by object', { '@type': 'PropertyValueSpecification' as const, valueRequired: true }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should honor success', () => {
          const result = parse(schema, new Date(1));

          expect(result).toEqual(expect.any(Date));
          expect(+result).toBe(1);
        });

        test('should honor failure', () => expect(() => parse(schema, undefined)).toThrow());
      });
    });

    describe('when valueRequired is set to false', () => {
      describe.each([
        ['by string', ''],
        ['by object', { '@type': 'PropertyValueSpecification' as const, valueRequired: false }]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should always success', () => expect(parse(schema, undefined)).toBeUndefined());
      });
    });

    describe('when defaultValue does not meet other constraints', () => {
      // Cannot set "defaultValue" of type number by string.
      describe.each([
        [
          'by object as Date',
          { '@type': 'PropertyValueSpecification' as const, defaultValue: new Date(1), minValue: new Date(5) }
        ],
        [
          'by object as string',
          {
            '@type': 'PropertyValueSpecification' as const,
            defaultValue: new Date(1),
            minValue: '1970-01-01T00:00:00.005Z'
          }
        ]
      ])('%s', (_, propertyValueSpecification) => {
        let schema: ReturnType<typeof toValibotSchema>;

        beforeEach(() => {
          schema = toValibotSchema(propertyValueSpecification);
        });

        test('should fail on undefined', () => expect(() => parse(schema, undefined)).toThrow());
        test('should honor success', () => {
          const result = parse(schema, new Date(5));

          expect(result).toEqual(expect.any(Date));
          expect(+result).toBe(5);
        });
      });
    });
  });
});
