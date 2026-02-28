import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('leaflet', () => {
    const mapMock = {
        setView: vi.fn(),
        fitBounds: vi.fn(),
        getZoom: vi.fn().mockReturnValue(10),
        setMaxBounds: vi.fn(),
        setMinZoom: vi.fn(),
        setMaxZoom: vi.fn(),
    };

    const layerMock = {
        addTo: vi.fn().mockReturnThis(),
        getBounds: vi.fn().mockReturnValue({}),
        resetStyle: vi.fn(),
        bindTooltip: vi.fn(),
        on: vi.fn(),
        setStyle: vi.fn(),
        bringToFront: vi.fn(),
    };

    return {
        default: {
            map: vi.fn().mockReturnValue(mapMock),
            geoJSON: vi.fn().mockReturnValue(layerMock),
        }
    };
});

describe('initMap', () => {
    const mapId = 'service-map';
    const dataId = 'service-map-data';

    // Import is done dynamically per-test so vi.resetModules() clears cachedGeoJson
    // between tests, preventing the cache from leaking across test cases.
    let initMap: (mapContainerId: string, dataContainerId: string) => Promise<void>;
    let L: typeof import('leaflet');

    beforeEach(async () => {
        vi.resetModules();

        // Re-import after resetModules so cachedGeoJson starts as null each test.
        const mapModule = await import('../../src/lib/mapInit.ts');
        initMap = mapModule.initMap;
        L = (await import('leaflet')).default as unknown as typeof import('leaflet');

        // Clear mock call counts AFTER re-importing so counts start at 0 per test.
        vi.clearAllMocks();

        document.body.innerHTML = `
            <div id="${mapId}"></div>
            <div id="${dataId}" data-cities='["Budapest"]'></div>
        `;

        vi.stubGlobal('fetch', vi.fn());

        // Stub DEV = true so DEV-only console.error branches are reachable in tests.
        vi.stubEnv('DEV', true);

        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    it('should initialize map and load geojson successfully', async () => {
        const mockGeoJSON = { type: 'FeatureCollection', features: [] };

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => mockGeoJSON,
        } as any);

        await initMap(mapId, dataId);

        expect((L as any).map).toHaveBeenCalledWith(mapId, expect.any(Object));
        expect(fetch).toHaveBeenCalledWith('/pest_borders.geojson');
        expect((L as any).geoJSON).toHaveBeenCalledWith(mockGeoJSON, expect.any(Object));

        const mapInstance = ((L as any).map as any).mock.results[0].value;
        expect(mapInstance.fitBounds).toHaveBeenCalled();
        expect(mapInstance.setMaxBounds).toHaveBeenCalled();
    });

    it('should handle fetch error (network error)', async () => {
        vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

        await initMap(mapId, dataId);

        expect(console.error).toHaveBeenCalledWith('Map error:', expect.any(Error));

        const mapInstance = ((L as any).map as any).mock.results[0].value;
        expect(mapInstance.setView).toHaveBeenCalledWith([47.45, 19.53], 10);
    });

    it('should handle fetch error (non-ok response)', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 404,
        } as any);

        await initMap(mapId, dataId);

        expect(console.error).toHaveBeenCalledWith('Error during loding the GeoJSON: 404');

        const mapInstance = ((L as any).map as any).mock.results[0].value;
        expect(mapInstance.setView).toHaveBeenCalledWith([47.45, 19.53], 10);
    });

    it('should not initialize if elements are missing', async () => {
        document.body.innerHTML = '';
        await initMap(mapId, dataId);
        expect((L as any).map).not.toHaveBeenCalled();
    });

    it('should reset leaflet_id if present', async () => {
        const mapEl = document.getElementById(mapId);
        (mapEl as any)._leaflet_id = '123';

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as any);

        await initMap(mapId, dataId);

        expect((mapEl as any)._leaflet_id).toBeNull();
        expect((L as any).map).toHaveBeenCalled();
    });
});