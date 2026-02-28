import L from 'leaflet';
import { parseCities } from "../components/utils/mapUtils.ts";
import { escapeHtml } from "./utils.ts"
import type { LeafletMapElement } from "../components/interface/leaflet.map.element.ts";

let cachedGeoJson: any = null;

export async function initMap(mapContainerId: string, dataContainerId: string) {
    const mapContainer = document.getElementById(mapContainerId);
    const dataContainer = document.getElementById(dataContainerId);

    if (!mapContainer || !dataContainer) return;

    const servicedCities = parseCities(dataContainer.dataset.cities || '[]');

    if ((mapContainer as LeafletMapElement)._leaflet_id) {
        (mapContainer as LeafletMapElement)._leaflet_id = null;
    }

    const map = L.map(mapContainerId, {
        zoomControl: true,
        attributionControl: false
    });

    try {
        if (!cachedGeoJson) {
            const response = await fetch('/pest_borders.geojson');

            if (!response.ok) {
                console.error(`Error during loding the GeoJSON: ${response.status}`);
                map.setView([47.45, 19.53], 10);
                return;
            }
            cachedGeoJson = await response.json();
        }

        const geojsonData = cachedGeoJson;

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
                    fillOpacity: isServiced ? 0.8 : 0.6,
                    className: 'map-polygon-non-interactive'
                };
            },
            onEachFeature: (feature: any, layer: L.Layer) => {
                const cityName = feature?.properties?.name;
                if (cityName) {
                    const isServiced = servicedCities.includes(cityName);

                    layer.bindTooltip(escapeHtml(cityName), {
                        direction: "top",
                        sticky: true,
                        className: isServiced ? "tooltip-serviced" : "tooltip-unserviced"
                    });

                    layer.on({
                        mouseover: (e) => {
                            const l = e.target;
                            l.setStyle({
                                weight: 3,
                                fillOpacity: isServiced ? 1.0 : 0.8,
                                color: isServiced ? '#c05621' : '#94a3b8'
                            });

                            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                                l.bringToFront();
                            }
                        },
                        mouseout: (e) => {
                            geojsonLayer.resetStyle(e.target);
                            e.target.closeTooltip();
                        },
                        click: (e) => {
                            e.target.closeTooltip();
                            L.DomEvent.stopPropagation(e as any);
                        }
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
        if (import.meta.env.DEV) {
            console.error("Map error:", error);
        }
        map.setView([47.45, 19.53], 10);
    }
}