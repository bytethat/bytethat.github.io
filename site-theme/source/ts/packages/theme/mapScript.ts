import {ScriptService} from "@bytethat/core";

export const mapScript = ScriptService.create(() => {
    const storesContainers = document.querySelectorAll('.stores-container');

    Array.from(storesContainers).forEach((storesContainer: HTMLElement) => {
        const mapElement: HTMLElement | null = storesContainer.querySelector('.map');

        if (!mapElement) {
            return;
        }

        const stores = Array.from(storesContainer.querySelectorAll('.store'))
            .map(x => {
                const id = x.getAttribute('data-id') || '';
                const title = x.getAttribute('data-title') || '';
                const address = x.getAttribute('data-address') || '';
                const area = x.getAttribute('data-area') || '';
                const city = x.getAttribute('data-city') || '';
                const zip = x.getAttribute('data-zip') || '';
                const phone = x.getAttribute('data-phone') || '';
                const email = x.getAttribute('data-email') || '';
                const latitude = parseFloat(x.getAttribute('data-lat') || '0');
                const longitude = parseFloat(x.getAttribute('data-lng') || '0');

                return {id, title, address, area, city, zip, phone, email, latitude, longitude};
            });

        const defaultStore = stores[0];

        type Marker = {
            store: typeof stores[number];
            marker: InstanceType<typeof google.maps.marker.AdvancedMarkerElement>;
            infoWindow: google.maps.InfoWindow
        };

        const fitBounds = (map: google.maps.Map, positions: google.maps.LatLngLiteral[], defaultZoom = 16) => {
            const bounds = new google.maps.LatLngBounds();
            positions.forEach(position => bounds.extend(position));

            if (bounds.isEmpty()) {
                return;
            }

            if (positions.length === 1) {
                map.setZoom(defaultZoom);
                map.setCenter(positions[0]);

                return;
            }

            map.fitBounds(bounds);
        };

        // Initialize and add the map
        const buildMap = async function (): Promise<void> {
            const {Map} = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            const {AdvancedMarkerElement} = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

            const initialPosition = {lat: defaultStore.latitude, lng: defaultStore.longitude};

            const map = new Map(mapElement, {
                zoom: 16,
                center: initialPosition,
                mapId: 'DEMO_MAP_ID',
            });

            const markerData: Marker[] = stores
                .map((store) => {
                    const position = {lat: store.latitude, lng: store.longitude};

                    // Create an info window
                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div>
                        <strong>${store.title}</strong>
                        <p>${store.address}</p>
                        <p>${store.area}, ${store.city}, ${store.zip}</p>
                        <p>Phone: ${store.phone}</p>
                        <p>Email: ${store.email}</p>
                        </div>`,
                    });
                    // The marker, positioned at Uluru
                    const marker = new AdvancedMarkerElement({
                        map: map,
                        position: position,
                        title: store.title
                    });

                    marker.addListener('click', () => {
                        infoWindow.open({
                            anchor: marker,
                            map,
                        });
                    });

                    return {store, marker, infoWindow};
                });

            const positions = stores
                .filter(store => !isNaN(store.latitude) && !isNaN(store.longitude) && (store.latitude !== 0 || store.longitude !== 0))
                .map(store => ({lat: store.latitude, lng: store.longitude} as google.maps.LatLngLiteral));

            fitBounds(map, positions);

            // Wire up "Show in map" anchors
            const showLinks = storesContainer.querySelectorAll('.show-in-map');
            Array.from(showLinks).forEach((link: HTMLElement) => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const id = link.closest('.store')?.getAttribute('data-id') || '';

                    if (!!!id) {
                        return;
                    }

                    const {store, marker, infoWindow} = markerData.find(x => x.store.id === id);
                    const center = {lat: store.latitude, lng: store.longitude};

                    map.setCenter(center);
                    map.setZoom(16);

                    infoWindow.open({anchor: marker, map});

                    // Optional UX: scroll map into view
                    mapElement?.scrollIntoView({behavior: 'smooth', block: 'center'});
                });
            });

        }

        buildMap();
    });
});
