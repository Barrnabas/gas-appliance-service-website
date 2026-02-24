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