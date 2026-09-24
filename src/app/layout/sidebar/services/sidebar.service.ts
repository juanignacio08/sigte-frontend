import { Service, signal } from '@angular/core';

@Service()
export class SidebarService {
    private _isOpen = signal<boolean>(true);
    public isOpen = this._isOpen.asReadonly();

    constructor() {
        this.loadState();
    }

    toggle(): void {
        this._isOpen.update(value => !value);
        this.saveState();
    }

    open(): void {
        this._isOpen.set(true);
        this.saveState();
    }

    close(): void {
        this._isOpen.set(false);
        this.saveState();
    }

    private saveState(): void {
        localStorage.setItem('sidebarOpen', JSON.stringify(this._isOpen()));
    }

    private loadState(): void {
        const saved = localStorage.getItem('sidebarOpen');
        if (saved !== null) {
            this._isOpen.set(JSON.parse(saved));
        } else {
            // Por defecto, en móvil cerrado, en desktop abierto
            this._isOpen.set(window.innerWidth >= 1024);
        }
    }

}
