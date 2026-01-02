"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  actionStatusTypeSchema: () => actionStatusTypeSchema,
  propertyValueSpecificationSchema: () => PropertyValueSpecificationSchema_default,
  toURLSearchParams: () => toURLSearchParams,
  toURLTemplateData: () => toURLTemplateData,
  useSchemaOrgAction: () => useSchemaOrgAction
});
module.exports = __toCommonJS(src_exports);

// src/ActionStatusType.ts
var import_valibot = require("valibot");
var actionStatusTypeSchema = (0, import_valibot.picklist)([
  "ActiveActionStatus",
  "CompletedActionStatus",
  "FailedActionStatus",
  "PotentialActionStatus"
]);

// src/PropertyValueSpecificationSchema.ts
var import_valibot2 = require("valibot");
var propertyValueSpecificationObjectSchema = (0, import_valibot2.object)({
  "@type": (0, import_valibot2.optional)((0, import_valibot2.pipe)((0, import_valibot2.string)(), (0, import_valibot2.literal)("PropertyValueSpecification", 'Must be "PropertyValueSpecification"'))),
  defaultValue: (0, import_valibot2.optional)((0, import_valibot2.union)([(0, import_valibot2.date)(), (0, import_valibot2.number)(), (0, import_valibot2.string)()])),
  maxValue: (0, import_valibot2.optional)((0, import_valibot2.union)([(0, import_valibot2.date)(), (0, import_valibot2.number)(), (0, import_valibot2.string)()])),
  minValue: (0, import_valibot2.optional)((0, import_valibot2.union)([(0, import_valibot2.date)(), (0, import_valibot2.number)(), (0, import_valibot2.string)()])),
  multipleValues: (0, import_valibot2.optional)((0, import_valibot2.boolean)()),
  stepValue: (0, import_valibot2.optional)((0, import_valibot2.union)([(0, import_valibot2.number)(), (0, import_valibot2.string)()])),
  valueMaxLength: (0, import_valibot2.optional)((0, import_valibot2.union)([(0, import_valibot2.number)(), (0, import_valibot2.string)()])),
  valueMinLength: (0, import_valibot2.optional)((0, import_valibot2.union)([(0, import_valibot2.number)(), (0, import_valibot2.string)()])),
  valueName: (0, import_valibot2.optional)((0, import_valibot2.string)()),
  valuePattern: (0, import_valibot2.optional)((0, import_valibot2.instance)(RegExp)),
  valueRequired: (0, import_valibot2.optional)((0, import_valibot2.boolean)())
});
var propertyValueSpecificationStringSchema = (0, import_valibot2.pipe)(
  (0, import_valibot2.string)(),
  (0, import_valibot2.transform)((value) => {
    const spec = {};
    const specMap = new Map(
      (0, import_valibot2.parse)((0, import_valibot2.string)(), value).split(/\s+/g).map((token) => {
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
      spec.valuePattern = (0, import_valibot2.parse)(
        (0, import_valibot2.pipe)(
          (0, import_valibot2.string)(),
          (0, import_valibot2.transform)((input) => new RegExp(input))
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
    return (0, import_valibot2.parse)(propertyValueSpecificationObjectSchema, spec);
  })
);
var propertyValueSpecificationSchema = (0, import_valibot2.union)([
  propertyValueSpecificationObjectSchema,
  propertyValueSpecificationStringSchema
]);
function toValibotSchema(propertyValueSpecification, choices = []) {
  if (typeof propertyValueSpecification === "string") {
    propertyValueSpecification = (0, import_valibot2.parse)(propertyValueSpecificationStringSchema, propertyValueSpecification);
  }
  let dateSchema = (0, import_valibot2.date)();
  let numberSchema = (0, import_valibot2.number)();
  let stringSchema = (0, import_valibot2.string)();
  const { defaultValue } = propertyValueSpecification;
  if (defaultValue instanceof Date) {
    dateSchema = (0, import_valibot2.optional)(dateSchema, defaultValue);
  } else if (typeof defaultValue === "number") {
    numberSchema = (0, import_valibot2.optional)(numberSchema, defaultValue);
  } else if (typeof defaultValue === "string") {
    stringSchema = (0, import_valibot2.optional)(stringSchema, defaultValue);
  } else if (!propertyValueSpecification.valueRequired) {
    dateSchema = (0, import_valibot2.optional)(dateSchema);
    numberSchema = (0, import_valibot2.optional)(numberSchema);
    stringSchema = (0, import_valibot2.optional)(stringSchema);
  }
  if (propertyValueSpecification.maxValue instanceof Date) {
    dateSchema = (0, import_valibot2.pipe)(dateSchema, (0, import_valibot2.maxValue)(propertyValueSpecification.maxValue));
  } else if (typeof propertyValueSpecification.maxValue === "number") {
    dateSchema = (0, import_valibot2.pipe)(dateSchema, (0, import_valibot2.maxValue)(new Date(propertyValueSpecification.maxValue)));
    numberSchema = (0, import_valibot2.pipe)(numberSchema, (0, import_valibot2.maxValue)(propertyValueSpecification.maxValue));
  } else if (typeof propertyValueSpecification.maxValue === "string") {
    const parseDateResult = (0, import_valibot2.safeParse)(htmlStringDate, propertyValueSpecification.maxValue);
    if (parseDateResult.success) {
      dateSchema = (0, import_valibot2.pipe)(dateSchema, (0, import_valibot2.maxValue)(parseDateResult.output));
    }
    const parseNumberResult = (0, import_valibot2.safeParse)(htmlStringNumber, propertyValueSpecification.maxValue);
    if (parseNumberResult.success) {
      numberSchema = (0, import_valibot2.pipe)(numberSchema, (0, import_valibot2.maxValue)(parseNumberResult.output));
    }
  }
  if (propertyValueSpecification.minValue instanceof Date) {
    dateSchema = (0, import_valibot2.pipe)(dateSchema, (0, import_valibot2.minValue)(propertyValueSpecification.minValue));
  } else if (typeof propertyValueSpecification.minValue === "number") {
    dateSchema = (0, import_valibot2.pipe)(dateSchema, (0, import_valibot2.minValue)(new Date(propertyValueSpecification.minValue)));
    numberSchema = (0, import_valibot2.pipe)(numberSchema, (0, import_valibot2.minValue)(propertyValueSpecification.minValue));
  } else if (typeof propertyValueSpecification.minValue === "string") {
    const parseDateResult = (0, import_valibot2.safeParse)(htmlStringDate, propertyValueSpecification.minValue);
    if (parseDateResult.success) {
      dateSchema = (0, import_valibot2.pipe)(dateSchema, (0, import_valibot2.minValue)(parseDateResult.output));
    }
    const parseNumberResult = (0, import_valibot2.safeParse)(htmlStringNumber, propertyValueSpecification.minValue);
    if (parseNumberResult.success) {
      numberSchema = (0, import_valibot2.pipe)(numberSchema, (0, import_valibot2.minValue)(parseNumberResult.output));
    }
  }
  const { stepValue } = propertyValueSpecification;
  if (typeof stepValue === "number") {
    numberSchema = (0, import_valibot2.pipe)(
      numberSchema,
      (0, import_valibot2.custom)((value) => typeof value === "number" && value % stepValue === 0)
    );
    dateSchema = (0, import_valibot2.pipe)(
      dateSchema,
      (0, import_valibot2.custom)((value) => value instanceof Date && +value % stepValue === 0)
    );
  } else if (typeof stepValue === "string") {
    const stepValueAsNumber = (0, import_valibot2.parse)(htmlStringNumber, stepValue);
    numberSchema = (0, import_valibot2.pipe)(
      numberSchema,
      (0, import_valibot2.custom)((value) => typeof value === "number" && value % stepValueAsNumber === 0)
    );
    dateSchema = (0, import_valibot2.pipe)(
      dateSchema,
      (0, import_valibot2.custom)((value) => value instanceof Date && +value % stepValueAsNumber === 0)
    );
  }
  if (typeof propertyValueSpecification.valuePattern !== "undefined") {
    stringSchema = (0, import_valibot2.pipe)(stringSchema, (0, import_valibot2.regex)(propertyValueSpecification.valuePattern));
  }
  if (typeof propertyValueSpecification.valueMaxLength === "number") {
    stringSchema = (0, import_valibot2.pipe)(stringSchema, (0, import_valibot2.maxLength)(propertyValueSpecification.valueMaxLength));
  } else if (typeof propertyValueSpecification.valueMaxLength === "string") {
    stringSchema = (0, import_valibot2.pipe)(stringSchema, (0, import_valibot2.maxLength)((0, import_valibot2.parse)(htmlStringNumber, propertyValueSpecification.valueMaxLength)));
  }
  if (typeof propertyValueSpecification.valueMinLength === "number") {
    stringSchema = (0, import_valibot2.pipe)(stringSchema, (0, import_valibot2.minLength)(propertyValueSpecification.valueMinLength));
  } else if (typeof propertyValueSpecification.valueMinLength === "string") {
    stringSchema = (0, import_valibot2.pipe)(stringSchema, (0, import_valibot2.minLength)((0, import_valibot2.parse)(htmlStringNumber, propertyValueSpecification.valueMinLength)));
  }
  if (choices.length) {
    dateSchema = (0, import_valibot2.pipe)(dateSchema, (0, import_valibot2.picklist)(choices));
    numberSchema = (0, import_valibot2.pipe)(numberSchema, (0, import_valibot2.picklist)(choices));
    stringSchema = (0, import_valibot2.pipe)(stringSchema, (0, import_valibot2.picklist)(choices));
  }
  if (propertyValueSpecification.multipleValues) {
    dateSchema = (0, import_valibot2.array)(dateSchema);
    numberSchema = (0, import_valibot2.array)(numberSchema);
    stringSchema = (0, import_valibot2.array)(stringSchema);
  }
  return (0, import_valibot2.union)([dateSchema, numberSchema, stringSchema]);
}
var htmlStringDate = (0, import_valibot2.pipe)(
  (0, import_valibot2.string)(),
  // TODO: Currently, we require a date component.
  //       We should follow HTML date parsing algorithm, https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#dates-and-times.
  (0, import_valibot2.regex)(/^\d{1,}-(0?1|0?2|0?3|0?4|0?5|0?6|0?7|0?8|0?9|10|11|12)-{0,3}\d/),
  (0, import_valibot2.transform)((input) => new Date(input)),
  (0, import_valibot2.custom)((input) => !isNaN(+input))
);
var htmlStringNumber = (0, import_valibot2.pipe)(
  (0, import_valibot2.string)(),
  // TODO: parseInt() does not strictly follow HTML number parsing algorithm.
  //       We should follow HTML number parsing algorithm, https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#numbers.
  (0, import_valibot2.regex)(/^-?\d+(\.\d*)?$/),
  (0, import_valibot2.transform)((input) => parseInt(input, 10))
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
var import_react = require("react");
var import_use_ref_from = require("use-ref-from");
var import_valibot6 = require("valibot");

// src/private/buildSchemaFromConstraintsRecursive.ts
var import_valibot3 = require("valibot");

// src/private/isPlainObject.ts
var import_isPlainObject = __toESM(require("lodash/isPlainObject"));
function isPlainObject(object4) {
  return (0, import_isPlainObject.default)(object4);
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
  return Object.entries(objectEntriesSchema).length ? (0, import_valibot3.object)(objectEntriesSchema) : void 0;
}
function buildSchemaFromConstraintsRecursive(action, mode) {
  return buildSchemaFromConstraintsRecursiveInternal(action, mode) || (0, import_valibot3.object)({});
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
var import_valibot4 = require("valibot");
function extractVariablesFromActionStateRecursive(action, actionState, mode) {
  const variables = /* @__PURE__ */ new Map();
  for (const [key, value] of Object.entries(action)) {
    if (mode === "input" && key.endsWith("-input")) {
      const unprefixedKey = key.slice(0, -6);
      const { valueName } = (0, import_valibot4.parse)(PropertyValueSpecificationSchema_default, value);
      if (typeof valueName !== "undefined") {
        variables.set(valueName, actionState?.[unprefixedKey]);
      }
    } else if (mode === "output" && key.endsWith("-output")) {
      const unprefixedKey = key.slice(0, -7);
      const { valueName } = (0, import_valibot4.parse)(PropertyValueSpecificationSchema_default, value);
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
var import_valibot5 = require("valibot");
function validateConstraints(schema, actionState) {
  const { success } = (0, import_valibot5.safeParse)(schema, actionState);
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
  const [actionState, setActionState] = (0, import_react.useState)(() => ({
    ...extractActionStateFromAction(initialAction),
    actionStatus: (0, import_valibot6.parse)(
      (0, import_valibot6.fallback)(actionStatusTypeSchema, "PotentialActionStatus"),
      "actionStatus" in initialAction && initialAction.actionStatus
    )
  }));
  const abortController = (0, import_react.useMemo)(() => new AbortController(), []);
  const initialActionRef = (0, import_react.useRef)(initialAction);
  const onPerformRef = (0, import_use_ref_from.useRefFrom)(onPerform);
  const actionStateRef = (0, import_use_ref_from.useRefFrom)(actionState);
  const inputSchema = (0, import_react.useMemo)(
    () => buildSchemaFromConstraintsRecursive(initialActionRef.current, "input"),
    [initialActionRef]
  );
  const outputSchema = (0, import_react.useMemo)(
    () => buildSchemaFromConstraintsRecursive(initialActionRef.current, "output"),
    [initialActionRef]
  );
  const inputSchemaRef = (0, import_use_ref_from.useRefFrom)(inputSchema);
  const inputValidity = (0, import_react.useMemo)(() => validateConstraints(inputSchema, actionState), [actionState, inputSchema]);
  const outputSchemaRef = (0, import_use_ref_from.useRefFrom)(outputSchema);
  const perform = (0, import_react.useCallback)(async () => {
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
        (0, import_valibot6.parse)(outputSchema, response);
        if ("actionStatus-output" in initialActionRef.current) {
          (0, import_valibot6.parse)((0, import_valibot6.object)({ actionStatus: (0, import_valibot6.optional)(actionStatusTypeSchema) }), response);
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
  const inputVariables = (0, import_react.useMemo)(
    () => extractVariablesFromActionStateRecursive(initialActionRef.current, actionState, "input"),
    [actionState, initialActionRef]
  );
  const options = (0, import_react.useMemo)(
    () => Object.freeze({
      inputSchema,
      inputValidity,
      inputVariables,
      outputSchema,
      perform
    }),
    [inputSchema, inputValidity, inputVariables, outputSchema, perform]
  );
  (0, import_react.useEffect)(() => () => abortController.abort(), [abortController]);
  return (0, import_react.useMemo)(
    () => Object.freeze([actionState, setActionState, options]),
    [actionState, options, setActionState]
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  actionStatusTypeSchema,
  propertyValueSpecificationSchema,
  toURLSearchParams,
  toURLTemplateData,
  useSchemaOrgAction
});
//# sourceMappingURL=use-schema-org-action.js.map