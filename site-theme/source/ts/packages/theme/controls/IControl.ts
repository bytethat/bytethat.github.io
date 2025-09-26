import {IDisposable} from "@bytethat/core";

export interface IControl extends IDisposable{
    build(): void;

    render(): void;

    bind(): void;
}