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

class ThemeModule implements IModule {
    configureServices(services: IServiceCollection): void {
        services.add(ScriptService, () => menuScript);
        services.add(ScriptService, () => formScript);
        services.add(ScriptService, () => sliderScript);
        services.add(ScriptService, () => footercontactFormScript);
    }

    configure(services: IServiceProvider): void {
    }
}

const themeModule : IModule = new ThemeModule();

export default themeModule;