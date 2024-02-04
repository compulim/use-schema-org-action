export default function isPlainObject(object: unknown): object is Record<string, unknown> {
  return Object.prototype.toString.call(object) === '[object Object]';
}
