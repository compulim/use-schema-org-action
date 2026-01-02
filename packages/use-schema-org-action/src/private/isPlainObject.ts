import _isPlainObject from 'lodash/isPlainObject.js';

export default function isPlainObject(object: unknown): object is Record<string, unknown> {
  return _isPlainObject(object);
}
