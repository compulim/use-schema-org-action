// import { type OmitDeep } from 'type-fest';

// import isPlainObject from './isPlainObject.ts';

// export default function omitConstraintsDeep<
//   T extends object
// >(thing: T): OmitDeep<T, `${string}-${'input' | 'output'}`> {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const result: any = {};

//   for (const [key, value] of Object.entries(thing)) {
//     if (!key.endsWith('-input') && !key.endsWith('-output')) {
//       result[key] = isPlainObject(value) ? omitConstraintsDeep(value) : value;
//     }
//   }

//   return Object.freeze(result);
// }
