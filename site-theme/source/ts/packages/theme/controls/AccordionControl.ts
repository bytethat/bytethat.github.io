import {BaseControl} from "./BaseControl";
import {Controls} from "./Controls";

const onClick = (e: Event) => {
    const control = Controls.from(e.target, AccordionControl);

    control.toggleItem((e.target as HTMLElement).closest('.accordion-item'));
}

export class AccordionControl extends BaseControl<HTMLElement> {
    private items: HTMLElement[];
    private readonly allowMultiple: boolean;

    constructor(element: HTMLElement) {
        super(element);

        this.items = Array.from(this.element.querySelectorAll('.accordion-item'));
        this.allowMultiple = this.element.classList.contains('allow-multiple');
    }

    override bind() {
        super.bind();

        this.items.forEach(item => {
            const trigger = item.querySelector('.collapse-toggle');
            if (trigger) {
                trigger.addEventListener('click', onClick);
            }
        });
    }

    override dispose() {
        super.dispose();

        this.items.forEach(item => {
            const trigger = item.querySelector('.collapse-toggle');
            if (trigger) {
                trigger.removeEventListener('click', onClick);
            }
        });
    }

    public toggleItem(item: HTMLElement) {
        const isOpen = item.classList.contains('show');

        if (isOpen) {
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