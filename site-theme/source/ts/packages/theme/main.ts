import { IModule, IServiceCollection, IServiceProvider, ScriptService } from '@bytethat/core';

import formScript from './form';

import $ from 'jquery';
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
    const $menus = $('.menu.menu-expand');

    $menus.each((index, menu) => {
        const $menu = $(menu);

        const $menuButton = $menu.find('.menu-toggle');

        $menuButton.on('click', () => {
            $menu.toggleClass('expanded');
        });

        $(window).on('resize', debounce(() => {
            if ($(window).width() < 768) {
                return;
            }

            $menu.removeClass('expanded');

        }, 100));
    });
})

const sliderScript = ScriptService.create(() => {
    const $sliders = $('.swiper');

    $sliders.each((index, slider) => {
        const $slider = $(slider);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const swiper = new Swiper($slider[0], {
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

class ThemeModule implements IModule {
    configureServices(services: IServiceCollection): void {
        services.add(ScriptService, () => menuScript);
        services.add(ScriptService, () => formScript);
        services.add(ScriptService, () => sliderScript);
    }

    configure(services: IServiceProvider): void {
    }
}

export default new ThemeModule();