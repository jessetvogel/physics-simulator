function $(id) {
    return document.getElementById(id);
}
function create(tag, content = '', attr = {}) {
    let elem = document.createElement(tag);
    elem.innerHTML = content;
    for (let a in attr)
        elem.setAttribute(a, attr[a]);
    return elem;
}
function clear(elem) {
    elem.innerHTML = '';
}
function onClick(elem, f) {
    elem.addEventListener('click', f);
}
function onContextMenu(elem, f) {
    elem.addEventListener('contextmenu', f);
}
function onChange(elem, f) {
    elem.addEventListener('change', f);
}
function onInput(elem, f) {
    elem.addEventListener('input', f);
}
function onRightClick(elem, f) {
    elem.addEventListener('contextmenu', f);
}
function onKeyPress(elem, f) {
    elem.addEventListener('keypress', f);
}
function onKeyDown(elem, f) {
    elem.addEventListener('keydown', f);
}
function onKeyUp(elem, f) {
    elem.addEventListener('keyup', f);
}
function onWheel(elem, f) {
    elem.addEventListener('wheel', f);
}
function addClass(elem, c) {
    elem.classList.add(c);
}
function removeClass(elem, c) {
    elem.classList.remove(c);
}
function hasClass(elem, c) {
    return elem.classList.contains(c);
}
function setHTML(elem, html) {
    elem.innerHTML = html;
}
function setText(elem, text) {
    elem.innerText = text;
}
function utf8_to_b64(str) {
    return window.btoa(encodeURIComponent(str));
}
function b64_to_utf8(str) {
    return decodeURIComponent(window.atob(str));
}
//# sourceMappingURL=util.js.map