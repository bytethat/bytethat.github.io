import {IControl} from "./IControl";

type Constructor<T> = abstract new (...args: any[]) => T;

export abstract class Controls {
    public static as<T>(control: IControl, constructor: Constructor<T>): T | null {
        return control instanceof constructor ? control : null;
    }

    public static from<T extends IControl>(source: HTMLElement | EventTarget, constructor: Constructor<T>): T | null {
        if (source === null || source === undefined) {
            return null;
        }

        if (!(source instanceof HTMLElement)) {
            return null;
        }

        let control = (source as any).control;

        if (!!!control) {
            return Controls.from(source.closest('*[x-control="' + constructor.name + '"]'), constructor); // search parents
        }

        if (!(control instanceof constructor)) {
            return null;
        }

        return control as T;
    }

}