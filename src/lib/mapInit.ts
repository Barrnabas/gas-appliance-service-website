import L from 'leaflet';

export async function initMap(mapContainerId: string, dataContainerId: string) {
    const mapContainer = document.getElementById(mapContainerId);
    const dataContainer = document.getElementById(dataContainerId);

    if (!mapContainer || !dataContainer) return;

    const servicedCities = JSON.parse(dataContainer.dataset.cities || '[]');

    if ((mapContainer as any)._leaflet_id) {
        (mapContainer as any)._leaflet_id = null;
    }

    const map = L.map(mapContainerId, {
        zoomControl: true,
        attributionControl: false
    });

    try {
        const response = await fetch('/pest_borders.geojson');

        if (!response.ok) {
            console.error(`Error during loding the GeoJSON: ${response.status}`);
            map.setView([47.45, 19.53], 10);
            return;
        }

        const geojsonData = await response.json();

        const geojsonLayer = L.geoJSON(geojsonData, {
            filter: (feature: any) =>
                feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon',

            style: (feature: any) => {
                const cityName = feature?.properties?.name;
                const isServiced = cityName && servicedCities.includes(cityName);
                return {
                    color: "#ffffff",
                    weight: isServiced ? 2 : 1,
                    fillColor: isServiced ? "#dd6b20" : "#e2e8f0",
                    fillOpacity: isServiced ? 0.8 : 0.6
                };
            },
            onEachFeature: (feature: any, layer: L.Layer) => {
                const cityName = feature?.properties?.name;
                if (cityName) {
                    const isServiced = servicedCities.includes(cityName);

                    layer.bindTooltip(cityName, {
                        direction: "top",
                        className: isServiced ? "tooltip-serviced" : "tooltip-unserviced"
                    });

                    layer.on({
                        mouseover: (e) => {
                            const l = e.target;
                            l.setStyle({
                                weight: 3,
                                color: isServiced ? '#c05621' : '#94a3b8'
                            });
                            l.bringToFront();
                        },
                        mouseout: (e) => geojsonLayer.resetStyle(e.target)
                    });
                }
            }
        }).addTo(map);

        map.fitBounds(geojsonLayer.getBounds());
        const currentZoom = map.getZoom();
        map.setMaxBounds(geojsonLayer.getBounds());
        map.setMinZoom(currentZoom);
        map.setMaxZoom(currentZoom + 3);

    } catch (error) {
        console.error("Map error:", error);
        map.setView([47.45, 19.53], 10);
    }
}
