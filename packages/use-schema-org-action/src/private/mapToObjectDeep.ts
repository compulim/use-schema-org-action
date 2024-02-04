export default function mapToObjectDeep(map: Map<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Array.from(map.entries()).map(([key, value]) => [key, value instanceof Map ? mapToObjectDeep(value) : value])
  );
}
