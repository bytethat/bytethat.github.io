import { IModule, IServiceCollection, IServiceProvider, ScriptService } from '@bytethat/core';

import formScript from './form';

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;

    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }
};

const menuScript = ScriptService.create(() => {
    const menus = document.querySelectorAll('.menu.menu-expand');

    Array.from(menus).forEach(menu => {
        const menuButton = menu.querySelector('.menu-toggle');

        if (!menuButton) {
            return;
        }

        menuButton.addEventListener('click', () => {
            menu.classList.toggle('expanded');
        });
        
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth < 768) {
                return;
            }
            
            menu.classList.remove('expanded');
        }, 100));
    });
})

const sliderScript = ScriptService.create(() => {
    const sliders = document.querySelectorAll('.swiper');

    Array.from(sliders).forEach((slider :HTMLElement) => {
        const swiper = new Swiper(slider, {
            modules: [Navigation, Pagination],
            
            // Optional parameters
            loop: true,
            autoplay: {
                delay: 5000,
            },

            // If we need pagination
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },

            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },

            // And if we need scrollbar
            scrollbar: {
                el: '.swiper-scrollbar',
            },
        });
    });
});

const footercontactFormScript = ScriptService.create(() => {
    const toggleLabel = (control: HTMLInputElement | HTMLTextAreaElement) => {
        const currentValue = control.value;

        const label : HTMLLabelElement | null = control.closest('.form-group')?.querySelector('.form-label');

        if(!label) {
            return;
        }

        if(currentValue === '') {
            label.style.top = '';
            label.style.fontSize = '';

            return;
        }

        label.style.top = '0';
        label.style.fontSize = '0.7em';
    };

    const contactForm = document.querySelector('.contact-form');

    if(!contactForm) {
        return;
    }

    const controls = contactForm.querySelectorAll('.form-control');

    Array.from(controls).forEach((control: HTMLInputElement | HTMLTextAreaElement) => {
        toggleLabel(control);
        
        control.addEventListener('input', () => toggleLabel(control));

        if(control instanceof HTMLTextAreaElement) {
            const calculateHeight = () => {
                control.style.height = 'auto';
                
                const lineHeight = parseFloat(window.getComputedStyle(control).lineHeight);
                const paddingTop = parseFloat(window.getComputedStyle(control).paddingTop);
                const paddingBottom = parseFloat(window.getComputedStyle(control).paddingBottom);

                const minHeight = lineHeight + paddingTop + paddingBottom;

                let height = control.scrollHeight;

                control.style.height = height + 'px';
            };

            control.rows = 1;
            control.style.overflowY = 'hidden';
            control.style.resize = 'none';

            calculateHeight();

            control.addEventListener('input', () => {
                calculateHeight();
            });
        }
    });
});

const mapScript = ScriptService.create(() => {
    
    const storesContainers = document.querySelectorAll('.stores-container');

    Array.from(storesContainers).forEach((storesContainer :HTMLElement) => {

        const mapElement = storesContainer.querySelector('.map');
        const stores = Array.from(storesContainer.querySelectorAll('.store'))
            .map(x => {
                const title = x.getAttribute('data-title') || '';
                const address = x.getAttribute('data-address') || '';
                const area = x.getAttribute('data-area') || '';
                const city = x.getAttribute('data-city') || '';
                const zip = x.getAttribute('data-zip') || '';
                const phone = x.getAttribute('data-phone') || '';
                const email = x.getAttribute('data-email') || '';
                const latitude = parseFloat(x.getAttribute('data-lat') || '0');
                const longitude = parseFloat(x.getAttribute('data-lng') || '0');

                return { title, address, area, city, zip, phone, email, latitude, longitude };
            });

        const defaultStore = stores[0];

        const fitBounds = (map: google.maps.Map, positions: google.maps.LatLngLiteral[], defaultZoom = 16) => {
            const bounds = new google.maps.LatLngBounds();
            positions.forEach(position => bounds.extend(position));

            if(bounds.isEmpty()) {
                return;
            }

            if(positions.length === 1) {
                map.setZoom(defaultZoom);
                map.setCenter(positions[0]);
                
                return;
            }

            map.fitBounds(bounds);
        };

        // Initialize and add the map
        const buildMap = async function(): Promise<void> {
            const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

            const initialPosition = { lat: defaultStore.latitude, lng: defaultStore.longitude };

            const map = new Map(
                mapElement as HTMLElement,
                {
                zoom: 16,
                center: initialPosition,
                mapId: 'DEMO_MAP_ID',
                }
            );

            stores.forEach(store => {
                const position = { lat: store.latitude, lng: store.longitude };
                
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
            });

            const positions = stores
                .filter(store => !isNaN(store.latitude) && !isNaN(store.longitude) && (store.latitude !== 0 || store.longitude !== 0))
                .map(store => ({ lat: store.latitude, lng: store.longitude } as google.maps.LatLngLiteral));

            fitBounds(map, positions);

        }

        buildMap();
    });
});

class ThemeModule implements IModule {
    configureServices(services: IServiceCollection): void {
        services.add(ScriptService, () => menuScript);
        services.add(ScriptService, () => formScript);
        services.add(ScriptService, () => sliderScript);
        services.add(ScriptService, () => footercontactFormScript);
        services.add(ScriptService, () => mapScript);
    }

    configure(services: IServiceProvider): void {
    }
}

const themeModule : IModule = new ThemeModule();

export default themeModule;