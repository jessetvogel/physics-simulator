function $(id: string): HTMLElement {
    return document.getElementById(id);
}

function create(tag: string, content = '', attr: { [k: string]: string } = {}) {
    let elem = document.createElement(tag);
    elem.innerHTML = content;
    for (let a in attr)
        elem.setAttribute(a, attr[a]);
    return elem;
}

function clear(elem: HTMLElement): void {
    elem.innerHTML = '';
}

function onClick(elem: HTMLElement, f: (this: HTMLElement, ev: MouseEvent) => any) {
    elem.addEventListener('click', f);
}

function onContextMenu(elem: HTMLElement, f: (this: HTMLElement, ev: MouseEvent) => any): void {
    elem.addEventListener('contextmenu', f);
}

function onChange(elem: HTMLElement, f: (this: HTMLElement, ev: Event) => any): void {
    elem.addEventListener('change', f);
}

function onInput(elem: HTMLElement, f: (this: HTMLElement, ev: Event) => any): void {
    elem.addEventListener('input', f);
}

function onRightClick(elem: HTMLElement, f: (this: HTMLElement, ev: MouseEvent) => any): void {
    elem.addEventListener('contextmenu', f);
}

function onKeyPress(elem: HTMLElement, f: (this: HTMLElement, ev: KeyboardEvent) => any): void {
    elem.addEventListener('keypress', f);
}

function onKeyDown(elem: HTMLElement, f: (this: HTMLElement, ev: KeyboardEvent) => any): void {
    elem.addEventListener('keydown', f);
}

function onKeyUp(elem: HTMLElement, f: (this: HTMLElement, ev: KeyboardEvent) => any): void {
    elem.addEventListener('keyup', f);
}

function onWheel(elem: HTMLElement, f: (this: HTMLElement, ev: WheelEvent) => any): void {
    elem.addEventListener('wheel', f);
}

function addClass(elem: HTMLElement, c: string): void {
    elem.classList.add(c);
}

function removeClass(elem: HTMLElement, c: string): void {
    elem.classList.remove(c);
}

function hasClass(elem: HTMLElement, c: string): boolean {
    return elem.classList.contains(c);
}

function setHTML(elem: HTMLElement, html: string): void {
    elem.innerHTML = html;
}

function setText(elem: HTMLElement, text: string): void {
    elem.innerText = text;
}

function utf8_to_b64(str: string): string {
    return window.btoa(encodeURIComponent(str));
}

function b64_to_utf8(str: string): string {
    return decodeURIComponent(window.atob(str));
}
