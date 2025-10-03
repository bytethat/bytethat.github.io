import {Cookies, IModule, IServiceCollection, IServiceProvider, MessageBus, ScriptService} from '@bytethat/core';

import Swiper from 'swiper';
import {Navigation, Pagination} from 'swiper/modules';

import {mapScript} from "./mapScript";
import {AccordionControl, Controls, FormControl, IControl, OverlayControl} from "./controls";
import {OverlayMessage, CookiePolicyMessage} from "@bytethat/theme/messages";
import {CookiePolicyHandler} from "@bytethat/theme/cookiePolicyHandler";

const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;

    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }
};

const OverlayScript = ScriptService.builder((services) => {
    const overlayElement = document.querySelector('.overlay');
    const messages = services.get(MessageBus);

    if (!messages) {
        return;
    }

    if (!overlayElement) {
        return;
    }

    const control = new OverlayControl(messages, overlayElement as HTMLElement);

    control.build();
    control.render();
    control.bind();
});

const menuScript = ScriptService.builder(() => {
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
});

const sliderScript = ScriptService.builder(() => {
    const sliders = document.querySelectorAll('.swiper');

    Array.from(sliders).forEach((slider: HTMLElement) => {
        new Swiper(slider, {
            modules: [Navigation, Pagination],

            // Optional parameters
            loop: true,
            autoplay: {
                delay: 5000,
            },

            keyboard: {
                enabled: true,
            },

            // If we need pagination
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },

            // Navigation arrows
            navigation: {
                addIcons: false,
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

const controlBootstrapScript = ScriptService.builder(() => {
    const controls: Array<IControl> = [];

    Array.from(document.querySelectorAll('.form'))
        .filter(x => x instanceof HTMLFormElement)
        .filter(x => x.classList.contains('validate'))
        .map((x: HTMLFormElement) => new FormControl(x))
        .forEach(x => controls.push(x));

    Array.from(document.querySelectorAll('.accordion'))
        .map((accordion: HTMLElement) => new AccordionControl(accordion))
        .forEach(x => controls.push(x));

    controls.forEach(c => {
        c.build();
        c.render();
        c.bind();
    });
});

const footerContactFormScript = ScriptService.builder(() => {
    const toggleLabel = (control: HTMLInputElement | HTMLTextAreaElement) => {
        const currentValue = control.value;

        const label: HTMLLabelElement | null = control.closest('.form-group')?.querySelector('.form-label');

        if (!label) {
            return;
        }

        if (currentValue === '') {
            label.style.top = '';
            label.style.fontSize = '';

            return;
        }

        label.style.top = '0';
        label.style.fontSize = '0.7em';
    };

    const contactForm = document.querySelector('.footer-container .contact-form');

    if (!contactForm) {
        return;
    }

    const controls = contactForm.querySelectorAll('.form-control');

    Array.from(controls).forEach((control: HTMLInputElement | HTMLTextAreaElement) => {
        toggleLabel(control);

        control.addEventListener('input', () => toggleLabel(control));

        if (control instanceof HTMLTextAreaElement) {
            const calculateHeight = () => {
                control.style.height = 'auto';

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

const AnchorScrollToScript = ScriptService.builder(() => {
    const links = document.querySelectorAll('a[js-scroll-to]');

    Array.from(links).forEach((link: HTMLElement) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const selector = link.getAttribute('js-scroll-to') || '';
            if (!!!selector) {
                return;
            }

            const target = document.querySelector(selector);
            if (!target) {
                return;
            }

            target.scrollIntoView({behavior: 'smooth', block: 'start'});
        });
    });
});

const cookiesPolicyScript = ScriptService.builder(() => {
    const cookiesPolicyForms = document.querySelectorAll('form.cookies-policy-form');

    Array.from(cookiesPolicyForms).forEach((form: HTMLFormElement) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formControl = Controls.from(e.target, FormControl);

            let result: any = {};
            formControl.controls.forEach(x => result[x.name()] = x.value());

            Cookies.set('cconsent', JSON.stringify(result), 365);
        });

        const rawConsents = Cookies.get('cconsent');

        if (!rawConsents) {
            return;
        }

        const formControl = Controls.from(form, FormControl);

        if (!formControl) {
            return;
        }

        const consents = JSON.parse(rawConsents);

        formControl.controls.forEach(x => {
            if (x.element.name in consents) {
                if (x.element.type === 'checkbox') {
                    (x.element as HTMLInputElement).checked = consents[x.element.name] === true || consents[x.element.name] === 'true';
                } else {
                    x.value = consents[x.element.name];
                }
            }
        });
    });
});

const cookiesModalScript = ScriptService.builder((services) => {
    const messages = services.get(MessageBus);

    const hasCookie = !!Cookies.get('cconsent');

    if (hasCookie) {
        return;
    }

    const cookiesModals = document.querySelectorAll('.cookie-consent-modal');
    if (!cookiesModals) {
        return;
    }

    Array.from(cookiesModals).forEach((cookiesModal: HTMLElement) => {
        const setingsJSON = cookiesModal.getAttribute('data-settings');
        if (!setingsJSON) {
            return;
        }

        const settings: Array<{ id: string, required: boolean }> = JSON.parse(setingsJSON);
        if (!settings || !settings.length) {
            return;
        }

        const acceptButtons = cookiesModal.querySelectorAll('.button.accept');
        const rejectButtons = cookiesModal.querySelectorAll('.button.reject');

        const show = () => {
            messages.publishAsync(OverlayMessage.topic, new OverlayMessage(cookiesModal, {
                show: true
            })).then(() => cookiesModal.classList.add('visible'));
        }

        const hide = () => {
            messages.publishAsync(OverlayMessage.topic, new OverlayMessage(cookiesModal, {
                show: false
            })).then(() => cookiesModal.classList.remove('visible'));
        }

        Array.from(acceptButtons).forEach((acceptButton) => {
            acceptButton.addEventListener('click', () => {
                const cookieValue = {};
                settings.forEach(x => cookieValue[x.id] = true);

                messages.publishAsync(CookiePolicyMessage.topic, new CookiePolicyMessage(cookiesModal, {
                    accepted: settings.map(x => x.id)
                }));

                Cookies.set('cconsent', JSON.stringify(cookieValue), 365);

                hide();
            });
        });

        Array.from(rejectButtons).forEach((rejectButton) => {
            rejectButton.addEventListener('click', () => {
                const cookieValue = {};
                settings.forEach(x => cookieValue[x.id] = x.required);

                messages.publishAsync(CookiePolicyMessage.topic, new CookiePolicyMessage(cookiesModal, {
                    accepted: settings.filter(x => x.required).map(x => x.id)
                }));

                Cookies.set('cconsent', JSON.stringify(cookieValue), 365);

                hide();
            });
        });

        show();
    });

});


declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}

const googleAnalyticsScript = ScriptService.builder((services) => {
    const cookiePolicies = services.get(CookiePolicyHandler);

    cookiePolicies.require('statistics', () => {
        const trackingId: string = (window as any).analytics.google.trackingId;

        if (!!!trackingId) {
            return;
        }

        const script = document.createElement('script');
        script.async = true;

        script.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${trackingId}`);
        // script.onload = () => {
        //     window.dataLayer = window.dataLayer || [];
        //     window.gtag = (...args: unknown[]) => { window.dataLayer.push(args); };
        //
        //     window.gtag('js', new Date());
        //     window.gtag('config', trackingId);
        // }

        const inlineScript = document.createElement('script');

        inlineScript.innerHTML = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${trackingId}');`;

        document.body.appendChild(script);
        document.body.appendChild(inlineScript);
    });

});

class ThemeModule implements IModule {
    configureServices(services: IServiceCollection): void {
        let cached: CookiePolicyHandler;
        services.add(CookiePolicyHandler, (services) => {
            if (!!!cached) {
                cached = new CookiePolicyHandler(services.get(MessageBus));
            }

            return cached;
        });

        services.add(ScriptService, OverlayScript);
        services.add(ScriptService, menuScript);
        services.add(ScriptService, controlBootstrapScript);
        services.add(ScriptService, sliderScript);
        services.add(ScriptService, footerContactFormScript);
        services.add(ScriptService, mapScript);
        services.add(ScriptService, AnchorScrollToScript);
        services.add(ScriptService, cookiesPolicyScript);
        services.add(ScriptService, cookiesModalScript);
        services.add(ScriptService, googleAnalyticsScript);
    }

    configure(services: IServiceProvider): void {
    }
}

const themeModule: IModule = new ThemeModule();

export default themeModule;