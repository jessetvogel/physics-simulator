function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
    const cookies = decodeURIComponent(document.cookie).split(';');
    const needle = `${name}=`;
    for (let c of cookies) {
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(needle) == 0)
            return c.substring(needle.length, c.length);
    }
    return null;
}
let savedSimulations = {};
function loadSimulation(name) {
    savedSimulations = JSON.parse(getCookie('savedSimulations'));
    return (name in savedSimulations) ? savedSimulations[name] : null;
}
function storeSimulation(name, description) {
    savedSimulations[name] = simulation.description;
    setCookie('savedSimulations', JSON.stringify(savedSimulations), 365);
}
//# sourceMappingURL=cookies.js.map