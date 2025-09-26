import {ScriptService} from "@bytethat/core";

class Accordion {
    private accordion: HTMLElement;
    private items: HTMLElement[];
    private readonly allowMultiple: boolean;

    constructor(accordion: HTMLElement) {
        this.accordion = accordion;
        this.items = Array.from(this.accordion.querySelectorAll('.accordion-item'));
        this.allowMultiple = this.accordion.classList.contains('allow-multiple');

        this.items.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if (header) {
                header.addEventListener('click', () => this.toggleItem(item));
            }
        });
    }

    private toggleItem(item: HTMLElement) {
        const isOpen = item.classList.contains('show');

        if(isOpen) {
            item.classList.remove('show');
            return;
        }

        if (!this.allowMultiple) {
            this.items
                .filter(x => x !== item)
                .forEach(x => {
                    x.classList.remove('show');
                });
        }

        item.classList.add('show');
    }
}

export const accordionScript = ScriptService.create(() => {
    const accordions = document.querySelectorAll('.accordion');

    Array.from(accordions).forEach((accordion: HTMLElement) => {
        const instance = new Accordion(accordion);
    });
});
