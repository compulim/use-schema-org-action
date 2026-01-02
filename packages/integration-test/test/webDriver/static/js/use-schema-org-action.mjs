// src/ActionStatusType.ts
import { picklist } from "valibot";
var actionStatusTypeSchema = picklist([
  "ActiveActionStatus",
  "CompletedActionStatus",
  "FailedActionStatus",
  "PotentialActionStatus"
]);

// src/PropertyValueSpecificationSchema.ts
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
  picklist as picklist2,
  pipe,
  regex,
  safeParse,
  string,
  transform,
  union
} from "valibot";
var propertyValueSpecificationObjectSchema = object({
  "@type": optional(pipe(string(), literal("PropertyValueSpecification", 'Must be "PropertyValueSpecification"'))),
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
var propertyValueSpecificationStringSchema = pipe(
  string(),
  transform((value) => {
    const spec = {};
    const specMap = new Map(
      parse(string(), value).split(/\s+/g).map((token) => {
        const name2 = token.split("=", 1)[0];
        return [name2, token.slice(name2.length + 1)];
      })
    );
    const name = specMap.get("name");
    if (typeof name !== "undefined") {
      spec.valueName = name;
    }
    const maxValue2 = specMap.get("max");
    if (typeof maxValue2 !== "undefined") {
      spec.maxValue = maxValue2;
    }
    const maxLength2 = specMap.get("maxlength");
    if (typeof maxLength2 !== "undefined") {
      spec.valueMaxLength = maxLength2;
    }
    const minValue2 = specMap.get("min");
    if (typeof minValue2 !== "undefined") {
      spec.minValue = minValue2;
    }
    const minLength2 = specMap.get("minlength");
    if (typeof minLength2 !== "undefined") {
      spec.valueMinLength = minLength2;
    }
    if (specMap.has("multiple")) {
      spec.multipleValues = true;
    }
    if (specMap.has("pattern")) {
      spec.valuePattern = parse(
        pipe(
          string(),
          transform((input) => new RegExp(input))
        ),
        specMap.get("pattern")
      );
    }
    if (specMap.has("required")) {
      spec.valueRequired = true;
    }
    const stepValue = specMap.get("step");
    if (typeof stepValue !== "undefined") {
      spec.stepValue = stepValue;
    }
    const defaultValue = specMap.get("value");
    if (typeof defaultValue !== "undefined") {
      spec.defaultValue = `${specMap.get("value")}`;
    }
    return parse(propertyValueSpecificationObjectSchema, spec);
  })
);
var propertyValueSpecificationSchema = union([
  propertyValueSpecificationObjectSchema,
  propertyValueSpecificationStringSchema
]);
function toValibotSchema(propertyValueSpecification, choices = []) {
  if (typeof propertyValueSpecification === "string") {
    propertyValueSpecification = parse(propertyValueSpecificationStringSchema, propertyValueSpecification);
  }
  let dateSchema = date();
  let numberSchema = number();
  let stringSchema = string();
  const { defaultValue } = propertyValueSpecification;
  if (defaultValue instanceof Date) {
    dateSchema = optional(dateSchema, defaultValue);
  } else if (typeof defaultValue === "number") {
    numberSchema = optional(numberSchema, defaultValue);
  } else if (typeof defaultValue === "string") {
    stringSchema = optional(stringSchema, defaultValue);
  } else if (!propertyValueSpecification.valueRequired) {
    dateSchema = optional(dateSchema);
    numberSchema = optional(numberSchema);
    stringSchema = optional(stringSchema);
  }
  if (propertyValueSpecification.maxValue instanceof Date) {
    dateSchema = pipe(dateSchema, maxValue(propertyValueSpecification.maxValue));
  } else if (typeof propertyValueSpecification.maxValue === "number") {
    dateSchema = pipe(dateSchema, maxValue(new Date(propertyValueSpecification.maxValue)));
    numberSchema = pipe(numberSchema, maxValue(propertyValueSpecification.maxValue));
  } else if (typeof propertyValueSpecification.maxValue === "string") {
    const parseDateResult = safeParse(htmlStringDate, propertyValueSpecification.maxValue);
    if (parseDateResult.success) {
      dateSchema = pipe(dateSchema, maxValue(parseDateResult.output));
    }
    const parseNumberResult = safeParse(htmlStringNumber, propertyValueSpecification.maxValue);
    if (parseNumberResult.success) {
      numberSchema = pipe(numberSchema, maxValue(parseNumberResult.output));
    }
  }
  if (propertyValueSpecification.minValue instanceof Date) {
    dateSchema = pipe(dateSchema, minValue(propertyValueSpecification.minValue));
  } else if (typeof propertyValueSpecification.minValue === "number") {
    dateSchema = pipe(dateSchema, minValue(new Date(propertyValueSpecification.minValue)));
    numberSchema = pipe(numberSchema, minValue(propertyValueSpecification.minValue));
  } else if (typeof propertyValueSpecification.minValue === "string") {
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
  if (typeof stepValue === "number") {
    numberSchema = pipe(
      numberSchema,
      custom((value) => typeof value === "number" && value % stepValue === 0)
    );
    dateSchema = pipe(
      dateSchema,
      custom((value) => value instanceof Date && +value % stepValue === 0)
    );
  } else if (typeof stepValue === "string") {
    const stepValueAsNumber = parse(htmlStringNumber, stepValue);
    numberSchema = pipe(
      numberSchema,
      custom((value) => typeof value === "number" && value % stepValueAsNumber === 0)
    );
    dateSchema = pipe(
      dateSchema,
      custom((value) => value instanceof Date && +value % stepValueAsNumber === 0)
    );
  }
  if (typeof propertyValueSpecification.valuePattern !== "undefined") {
    stringSchema = pipe(stringSchema, regex(propertyValueSpecification.valuePattern));
  }
  if (typeof propertyValueSpecification.valueMaxLength === "number") {
    stringSchema = pipe(stringSchema, maxLength(propertyValueSpecification.valueMaxLength));
  } else if (typeof propertyValueSpecification.valueMaxLength === "string") {
    stringSchema = pipe(stringSchema, maxLength(parse(htmlStringNumber, propertyValueSpecification.valueMaxLength)));
  }
  if (typeof propertyValueSpecification.valueMinLength === "number") {
    stringSchema = pipe(stringSchema, minLength(propertyValueSpecification.valueMinLength));
  } else if (typeof propertyValueSpecification.valueMinLength === "string") {
    stringSchema = pipe(stringSchema, minLength(parse(htmlStringNumber, propertyValueSpecification.valueMinLength)));
  }
  if (choices.length) {
    dateSchema = pipe(dateSchema, picklist2(choices));
    numberSchema = pipe(numberSchema, picklist2(choices));
    stringSchema = pipe(stringSchema, picklist2(choices));
  }
  if (propertyValueSpecification.multipleValues) {
    dateSchema = array(dateSchema);
    numberSchema = array(numberSchema);
    stringSchema = array(stringSchema);
  }
  return union([dateSchema, numberSchema, stringSchema]);
}
var htmlStringDate = pipe(
  string(),
  // TODO: Currently, we require a date component.
  //       We should follow HTML date parsing algorithm, https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#dates-and-times.
  regex(/^\d{1,}-(0?1|0?2|0?3|0?4|0?5|0?6|0?7|0?8|0?9|10|11|12)-{0,3}\d/),
  transform((input) => new Date(input)),
  custom((input) => !isNaN(+input))
);
var htmlStringNumber = pipe(
  string(),
  // TODO: parseInt() does not strictly follow HTML number parsing algorithm.
  //       We should follow HTML number parsing algorithm, https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#numbers.
  regex(/^-?\d+(\.\d*)?$/),
  transform((input) => parseInt(input, 10))
);
var PropertyValueSpecificationSchema_default = propertyValueSpecificationSchema;

// src/toURLSearchParams.ts
function toURLSearchParams(variableMap) {
  return new URLSearchParams(
    Array.from(
      variableMap.entries().map(([key, value]) => [
        key,
        typeof value === "undefined" || value === null ? "" : typeof value === "object" && "toLocaleString" in value ? `${value.toISOString()}` : `${value}`
      ])
    )
  );
}

// src/toURLTemplateData.ts
function toURLTemplateData(variableMap) {
  const expandables = {};
  toURLSearchParams(variableMap).forEach((value, key) => (expandables[key] = expandables[key] || []).push(value));
  return expandables;
}

// src/useSchemaOrgAction.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRefFrom } from "use-ref-from";
import {
  fallback,
  object as object3,
  optional as optional2,
  parse as parse3
} from "valibot";

// src/private/buildSchemaFromConstraintsRecursive.ts
import { object as object2 } from "valibot";

// src/private/isPlainObject.ts
import _isPlainObject from "lodash/isPlainObject";
function isPlainObject(object4) {
  return _isPlainObject(object4);
}

// src/private/buildSchemaFromConstraintsRecursive.ts
function buildSchemaFromConstraintsRecursiveInternal(action, mode) {
  const objectEntriesSchema = {};
  for (const [key, value] of Object.entries(action)) {
    if (mode === "input" && key.endsWith("-input")) {
      const unprefixedKey = key.slice(0, -6);
      const unprefixedValue = isPlainObject(action) && action[unprefixedKey];
      objectEntriesSchema[unprefixedKey] = toValibotSchema(
        value,
        Array.isArray(unprefixedValue) ? unprefixedValue : void 0
      );
    } else if (mode === "output" && key.endsWith("-output")) {
      const unprefixedKey = key.slice(0, -7);
      const unprefixedValue = isPlainObject(action) && action[unprefixedKey];
      objectEntriesSchema[unprefixedKey] = toValibotSchema(
        value,
        Array.isArray(unprefixedValue) ? unprefixedValue : void 0
      );
    } else if (isPlainObject(value)) {
      const schema = buildSchemaFromConstraintsRecursiveInternal(value, mode);
      if (schema) {
        objectEntriesSchema[key] = schema;
      }
    }
  }
  return Object.entries(objectEntriesSchema).length ? object2(objectEntriesSchema) : void 0;
}
function buildSchemaFromConstraintsRecursive(action, mode) {
  return buildSchemaFromConstraintsRecursiveInternal(action, mode) || object2({});
}

// src/private/mergeActionStateRecursive.ts
function mergeActionStateRecursiveInternal(action, base, update, mode) {
  const nextActionState = base ? { ...base } : {};
  for (const [key, value] of Object.entries(action)) {
    if (mode === "input" && key.endsWith("-input")) {
      const unprefixedKey = key.slice(0, -6);
      nextActionState[unprefixedKey] = update?.[unprefixedKey] ?? base?.[unprefixedKey];
    } else if (mode === "output" && key.endsWith("-output")) {
      const unprefixedKey = key.slice(0, -7);
      nextActionState[unprefixedKey] = update?.[unprefixedKey] ?? base?.[unprefixedKey];
    } else if (isPlainObject(value)) {
      const subValue = mergeActionStateRecursiveInternal(value, base?.[key], update?.[key], mode);
      if (typeof subValue !== "undefined") {
        nextActionState[key] = subValue;
      }
    }
  }
  return Object.entries(nextActionState).length ? nextActionState : void 0;
}
function mergeActionStateRecursive(action, base, update, mode) {
  return mergeActionStateRecursiveInternal(action, base, update, mode) || {};
}

// src/private/extractActionStateFromAction.ts
function extractActionStateFromAction(action) {
  return mergeActionStateRecursive(action, mergeActionStateRecursive(action, {}, action, "input"), action, "output");
}

// src/private/extractVariablesFromActionStateRecursive.ts
import { parse as parse2 } from "valibot";
function extractVariablesFromActionStateRecursive(action, actionState, mode) {
  const variables = /* @__PURE__ */ new Map();
  for (const [key, value] of Object.entries(action)) {
    if (mode === "input" && key.endsWith("-input")) {
      const unprefixedKey = key.slice(0, -6);
      const { valueName } = parse2(PropertyValueSpecificationSchema_default, value);
      if (typeof valueName !== "undefined") {
        variables.set(valueName, actionState?.[unprefixedKey]);
      }
    } else if (mode === "output" && key.endsWith("-output")) {
      const unprefixedKey = key.slice(0, -7);
      const { valueName } = parse2(PropertyValueSpecificationSchema_default, value);
      if (typeof valueName !== "undefined") {
        variables.set(valueName, actionState?.[unprefixedKey]);
      }
    } else if (isPlainObject(value)) {
      for (const entry of extractVariablesFromActionStateRecursive(action[key], actionState?.[key], mode)) {
        variables.set(entry[0], entry[1]);
      }
    }
  }
  return variables;
}

// src/private/validateConstraints.ts
import { safeParse as safeParse2 } from "valibot";
function validateConstraints(schema, actionState) {
  const { success } = safeParse2(schema, actionState);
  return Object.freeze({
    badInput: false,
    customError: !success,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valid: success,
    valueMissing: false
  });
}

// src/useSchemaOrgAction.ts
function useSchemaOrgAction(initialAction, onPerform) {
  const [actionState, setActionState] = useState(() => ({
    ...extractActionStateFromAction(initialAction),
    actionStatus: parse3(
      fallback(actionStatusTypeSchema, "PotentialActionStatus"),
      "actionStatus" in initialAction && initialAction.actionStatus
    )
  }));
  const abortController = useMemo(() => new AbortController(), []);
  const initialActionRef = useRef(initialAction);
  const onPerformRef = useRefFrom(onPerform);
  const actionStateRef = useRefFrom(actionState);
  const inputSchema = useMemo(
    () => buildSchemaFromConstraintsRecursive(initialActionRef.current, "input"),
    [initialActionRef]
  );
  const outputSchema = useMemo(
    () => buildSchemaFromConstraintsRecursive(initialActionRef.current, "output"),
    [initialActionRef]
  );
  const inputSchemaRef = useRefFrom(inputSchema);
  const inputValidity = useMemo(() => validateConstraints(inputSchema, actionState), [actionState, inputSchema]);
  const outputSchemaRef = useRefFrom(outputSchema);
  const perform = useCallback(async () => {
    if (!validateConstraints(inputSchemaRef.current, actionStateRef.current).valid) {
      setActionState((actionState2) => ({ ...actionState2, actionStatus: "FailedActionStatus" }));
      return Promise.reject(Error("Input is invalid, cannot submit."));
    }
    setActionState((actionState2) => ({ ...actionState2, actionStatus: "ActiveActionStatus" }));
    let response;
    try {
      const inputVariables2 = extractVariablesFromActionStateRecursive(
        initialActionRef.current,
        actionStateRef.current,
        "input"
      );
      const request = mergeActionStateRecursive(initialActionRef.current, {}, actionStateRef.current, "input");
      response = await onPerformRef.current(request, inputVariables2, { signal: abortController.signal });
      try {
        parse3(outputSchema, response);
        if ("actionStatus-output" in initialActionRef.current) {
          parse3(object3({ actionStatus: optional2(actionStatusTypeSchema) }), response);
        }
      } catch (cause) {
        const error = new Error("Output is invalid.");
        error.cause = cause;
        throw error;
      }
      if (abortController.signal.aborted) {
        return;
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        setActionState((actionState2) => ({ ...actionState2, actionStatus: "FailedActionStatus" }));
      }
      throw error;
    }
    setActionState(
      (actionState2) => mergeActionStateRecursive(
        initialActionRef.current,
        { ...actionState2, actionStatus: "CompletedActionStatus" },
        response,
        "output"
      )
    );
  }, [
    abortController,
    actionStateRef,
    initialActionRef,
    inputSchemaRef,
    onPerformRef,
    outputSchemaRef,
    setActionState
  ]);
  const inputVariables = useMemo(
    () => extractVariablesFromActionStateRecursive(initialActionRef.current, actionState, "input"),
    [actionState, initialActionRef]
  );
  const options = useMemo(
    () => Object.freeze({
      inputSchema,
      inputValidity,
      inputVariables,
      outputSchema,
      perform
    }),
    [inputSchema, inputValidity, inputVariables, outputSchema, perform]
  );
  useEffect(() => () => abortController.abort(), [abortController]);
  return useMemo(
    () => Object.freeze([actionState, setActionState, options]),
    [actionState, options, setActionState]
  );
}
export {
  actionStatusTypeSchema,
  PropertyValueSpecificationSchema_default as propertyValueSpecificationSchema,
  toURLSearchParams,
  toURLTemplateData,
  useSchemaOrgAction
};
//# sourceMappingURL=use-schema-org-action.mjs.map