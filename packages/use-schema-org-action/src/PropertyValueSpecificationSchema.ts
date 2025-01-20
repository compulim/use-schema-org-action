import {
  array,
  boolean,
  custom,
  date,
  instance,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  parse,
  pipe,
  regex,
  safeParse,
  string,
  transform,
  union,
  type ArraySchema,
  type BaseIssue,
  type BaseSchema,
  type InferOutput,
  type PipeItem,
  type SchemaWithPipe
} from 'valibot';

const propertyValueSpecificationObjectSchema = object({
  '@type': optional(pipe(string(), literal('PropertyValueSpecification', 'Must be "PropertyValueSpecification"'))),
  defaultValue: optional(union([date(), number(), string()])),
  maxValue: optional(union([date(), number(), string()])),
  minValue: optional(union([date(), number(), string()])),
  multipleValues: optional(boolean()),
  stepValue: optional(union([number(), string()])),
  valueMaxLength: optional(union([number(), string()])),
  valueMinLength: optional(union([number(), string()])),
  valueName: optional(string()),
  valuePattern: optional(instance(RegExp)),
  valueRequired: optional(boolean())
});

const propertyValueSpecificationStringSchema = pipe(
  string(),
  transform<string, InferOutput<typeof propertyValueSpecificationObjectSchema>>(value => {
    const spec: Partial<InferOutput<typeof propertyValueSpecificationObjectSchema>> = {};

    const specMap = new Map(
      parse(string(), value)
        .split(/\s+/g)
        .map((token): [string, string] => {
          // Split must have at least 1 token.
          const name = token.split('=', 1)[0] as string;

          return [name, token.slice(name.length + 1)];
        })
    );

    const name = specMap.get('name');

    if (typeof name !== 'undefined') {
      spec.valueName = name;
    }

    const maxValue = specMap.get('max');

    if (typeof maxValue !== 'undefined') {
      spec.maxValue = maxValue;
    }

    const maxLength = specMap.get('maxlength');

    if (typeof maxLength !== 'undefined') {
      spec.valueMaxLength = maxLength;
    }

    const minValue = specMap.get('min');

    if (typeof minValue !== 'undefined') {
      spec.minValue = minValue;
    }

    const minLength = specMap.get('minlength');

    if (typeof minLength !== 'undefined') {
      spec.valueMinLength = minLength;
    }

    if (specMap.has('multiple')) {
      spec.multipleValues = true;
    }

    if (specMap.has('pattern')) {
      spec.valuePattern = parse(
        pipe(
          string(),
          transform(input => new RegExp(input))
        ),
        specMap.get('pattern')
      );
    }

    if (specMap.has('required')) {
      spec.valueRequired = true;
    }

    const stepValue = specMap.get('step');

    if (typeof stepValue !== 'undefined') {
      spec.stepValue = stepValue;
    }

    const defaultValue = specMap.get('value');

    if (typeof defaultValue !== 'undefined') {
      spec.defaultValue = `${specMap.get('value')}`;
    }

    return parse(propertyValueSpecificationObjectSchema, spec);
  })
);

const propertyValueSpecificationSchema = union([
  propertyValueSpecificationObjectSchema,
  propertyValueSpecificationStringSchema
]);

type MySchema<T> =
  | BaseSchema<T | undefined, T | undefined, BaseIssue<unknown>>
  | SchemaWithPipe<[BaseSchema<T | undefined, T | undefined, any>, PipeItem<any, T, any>]>
  | ArraySchema<
      | BaseSchema<T | undefined, T | undefined, BaseIssue<unknown>>
      | SchemaWithPipe<[BaseSchema<T | undefined, T | undefined, any>, PipeItem<any, T, any>]>,
      any
    >;

function toValibotSchema(propertyValueSpecification: PropertyValueSpecification) {
  if (typeof propertyValueSpecification === 'string') {
    propertyValueSpecification = parse(propertyValueSpecificationStringSchema, propertyValueSpecification);
  }

  let dateSchema: MySchema<Date> = date();
  let numberSchema: MySchema<number> = number();
  let stringSchema: MySchema<string> = string();

  const { defaultValue } = propertyValueSpecification;

  if (defaultValue instanceof Date) {
    dateSchema = optional(dateSchema, defaultValue);
  } else if (typeof defaultValue === 'number') {
    numberSchema = optional(numberSchema, defaultValue);
  } else if (typeof defaultValue === 'string') {
    stringSchema = optional(stringSchema, defaultValue);
  } else if (!propertyValueSpecification.valueRequired) {
    dateSchema = optional(dateSchema);
    numberSchema = optional(numberSchema);
    stringSchema = optional(stringSchema);
  }

  if (propertyValueSpecification.maxValue instanceof Date) {
    dateSchema = pipe(dateSchema, maxValue(propertyValueSpecification.maxValue));
  } else if (typeof propertyValueSpecification.maxValue === 'number') {
    dateSchema = pipe(dateSchema, maxValue(new Date(propertyValueSpecification.maxValue)));
    numberSchema = pipe(numberSchema, maxValue(propertyValueSpecification.maxValue));
  } else if (typeof propertyValueSpecification.maxValue === 'string') {
    const parseDateResult = safeParse(htmlStringDate, propertyValueSpecification.maxValue);

    if (parseDateResult.success) {
      dateSchema = pipe(dateSchema, maxValue(parseDateResult.output));
    }

    const parseNumberResult = safeParse(htmlStringNumber, propertyValueSpecification.maxValue);

    if (parseNumberResult.success) {
      numberSchema = pipe(numberSchema, maxValue(parseNumberResult.output));
    }
  }

  // TODO: Dedupe with maxValue.
  if (propertyValueSpecification.minValue instanceof Date) {
    dateSchema = pipe(dateSchema, minValue(propertyValueSpecification.minValue));
  } else if (typeof propertyValueSpecification.minValue === 'number') {
    dateSchema = pipe(dateSchema, minValue(new Date(propertyValueSpecification.minValue)));
    numberSchema = pipe(numberSchema, minValue(propertyValueSpecification.minValue));
  } else if (typeof propertyValueSpecification.minValue === 'string') {
    const parseDateResult = safeParse(htmlStringDate, propertyValueSpecification.minValue);

    if (parseDateResult.success) {
      dateSchema = pipe(dateSchema, minValue(parseDateResult.output));
    }

    const parseNumberResult = safeParse(htmlStringNumber, propertyValueSpecification.minValue);

    if (parseNumberResult.success) {
      numberSchema = pipe(numberSchema, minValue(parseNumberResult.output));
    }
  }

  const { stepValue } = propertyValueSpecification;

  if (typeof stepValue === 'number') {
    numberSchema = pipe(
      numberSchema,
      custom(value => typeof value === 'number' && value % stepValue === 0)
    );

    dateSchema = pipe(
      dateSchema,
      custom(value => value instanceof Date && +value % stepValue === 0)
    );
  } else if (typeof stepValue === 'string') {
    const stepValueAsNumber = parse(htmlStringNumber, stepValue);

    numberSchema = pipe(
      numberSchema,
      custom(value => typeof value === 'number' && value % stepValueAsNumber === 0)
    );

    dateSchema = pipe(
      dateSchema,
      custom(value => value instanceof Date && +value % stepValueAsNumber === 0)
    );
  }

  if (typeof propertyValueSpecification.valuePattern !== 'undefined') {
    stringSchema = pipe(stringSchema, regex(propertyValueSpecification.valuePattern));
  }

  if (typeof propertyValueSpecification.valueMaxLength === 'number') {
    stringSchema = pipe(stringSchema, maxLength(propertyValueSpecification.valueMaxLength));
  } else if (typeof propertyValueSpecification.valueMaxLength === 'string') {
    stringSchema = pipe(stringSchema, maxLength(parse(htmlStringNumber, propertyValueSpecification.valueMaxLength)));
  }

  if (typeof propertyValueSpecification.valueMinLength === 'number') {
    stringSchema = pipe(stringSchema, minLength(propertyValueSpecification.valueMinLength));
  } else if (typeof propertyValueSpecification.valueMinLength === 'string') {
    stringSchema = pipe(stringSchema, minLength(parse(htmlStringNumber, propertyValueSpecification.valueMinLength)));
  }

  if (propertyValueSpecification.multipleValues) {
    dateSchema = array(dateSchema);
    numberSchema = array(numberSchema);
    stringSchema = array(stringSchema);
  }

  return union([dateSchema, numberSchema, stringSchema]);
}

const htmlStringDate = pipe(
  string(),
  // TODO: Currently, we require a date component.
  //       We should follow HTML date parsing algorithm, https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#dates-and-times.
  regex(/^\d{1,}-(0?1|0?2|0?3|0?4|0?5|0?6|0?7|0?8|0?9|10|11|12)-{0,3}\d/),
  transform<string, Date>(input => new Date(input)),
  custom<Date>(input => !isNaN(+(input as Date)))
);

const htmlStringNumber = pipe(
  string(),
  // TODO: parseInt() does not strictly follow HTML number parsing algorithm.
  //       We should follow HTML number parsing algorithm, https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#numbers.
  regex(/^-?\d+(\.\d*)?$/),
  transform<string, number>(input => parseInt(input, 10))
);

export default propertyValueSpecificationSchema;

export type PropertyValueSpecification = InferOutput<typeof propertyValueSpecificationObjectSchema> | string;

export { toValibotSchema };
