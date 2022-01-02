class View {
    constructor() {
        this.center = { x: 0.0, y: 0.0 };
        this.zoom = 128.0;
        this.centerSpeed = { x: 0.0, y: 0.0 };
    }
    world2view(p) {
        if (typeof (p) === 'number')
            return p * this.zoom;
        else
            return {
                x: ctx.canvas.offsetWidth * 0.5 + (p.x - this.center.x) * this.zoom,
                y: ctx.canvas.offsetHeight * 0.5 - (p.y - this.center.y) * this.zoom
            };
    }
    view2world(p) {
        if (typeof (p) === 'number')
            return p / this.zoom;
        else
            return {
                x: this.center.x + (p.x - ctx.canvas.offsetWidth * 0.5) / this.zoom,
                y: this.center.y - (p.y - ctx.canvas.offsetHeight * 0.5) / this.zoom
            };
    }
}
;
var ctx = null;
function initView() {
    const canvas = $('canvas');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    simulation.render();
    setScale();
    window.onresize = initView;
}
//# sourceMappingURL=view.js.map