/**
 * Safely parses a JSON string representing a list of cities.
 * Returns an empty array if parsing fails or input is invalid.
 *
 * @param jsonString - The JSON string to parse
 * @returns An array of strings
 */
export function parseCities(jsonString: string | undefined | null): string[] {
  if (!jsonString) {
    return [];
  }

  try {
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      console.warn('parseCities: Parsed data is not an array');
      return [];
    }

    return parsed;
  } catch (error) {
    console.error('parseCities: Failed to parse JSON', error);
    return [];
  }
}
