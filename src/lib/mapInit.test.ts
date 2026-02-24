import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initMap } from './mapInit';
import L from 'leaflet';

// Mock Leaflet
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

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="${mapId}"></div>
            <div id="${dataId}" data-cities='["Budapest"]'></div>
        `;
        // Reset mocks
        vi.clearAllMocks();

        // Mock global fetch
        global.fetch = vi.fn();

        // Mock console.error
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize map and load geojson successfully', async () => {
        const mockGeoJSON = { type: 'FeatureCollection', features: [] };
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockGeoJSON,
        });

        await initMap(mapId, dataId);

        expect(L.map).toHaveBeenCalledWith(mapId, expect.any(Object));
        expect(fetch).toHaveBeenCalledWith('/pest_borders.geojson');
        expect(L.geoJSON).toHaveBeenCalledWith(mockGeoJSON, expect.any(Object));

        // Get the map instance returned by the mock
        const mapInstance = (L.map as any).mock.results[0].value;
        expect(mapInstance.fitBounds).toHaveBeenCalled();
        expect(mapInstance.setMaxBounds).toHaveBeenCalled();
    });

    it('should handle fetch error (network error)', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        await initMap(mapId, dataId);

        expect(console.error).toHaveBeenCalledWith('Map error:', expect.any(Error));

        const mapInstance = (L.map as any).mock.results[0].value;
        expect(mapInstance.setView).toHaveBeenCalledWith([47.45, 19.53], 10);
    });

    it('should handle fetch error (non-ok response)', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 404,
        });

        await initMap(mapId, dataId);

        expect(console.error).toHaveBeenCalledWith('Error during loding the GeoJSON: 404');

        const mapInstance = (L.map as any).mock.results[0].value;
        expect(mapInstance.setView).toHaveBeenCalledWith([47.45, 19.53], 10);
    });

    it('should not initialize if elements are missing', async () => {
        document.body.innerHTML = '';
        await initMap(mapId, dataId);
        expect(L.map).not.toHaveBeenCalled();
    });

    it('should reset leaflet_id if present', async () => {
        // Simulate re-initialization (e.g. view transition)
        const mapEl = document.getElementById(mapId);
        (mapEl as any)._leaflet_id = '123';

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        await initMap(mapId, dataId);

        expect((mapEl as any)._leaflet_id).toBeNull();
        expect(L.map).toHaveBeenCalled();
    });
});
