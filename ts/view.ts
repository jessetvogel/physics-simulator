type Point = { x: number, y: number };

class View {
    center: Point; // (world) coordinates of the center of the view
    zoom: number; // in pixels / meter
    centerSpeed: Point;

    constructor() {
        this.center = { x: 0.0, y: 0.0 };
        this.zoom = 128.0;
        this.centerSpeed = { x: 0.0, y: 0.0 };
    }

    world2view(p: Point): Point;
    world2view(p: number): number;
    world2view(p: Point | number): Point | number {
        if (typeof (p) === 'number')
            return p * this.zoom;
        else
            return {
                x: ctx.canvas.offsetWidth * 0.5 + (p.x - this.center.x) * this.zoom,
                y: ctx.canvas.offsetHeight * 0.5 - (p.y - this.center.y) * this.zoom
            }
    }

    view2world(p: Point): Point;
    view2world(p: number): number;
    view2world(p: Point | number): Point | number {
        if (typeof (p) === 'number')
            return p / this.zoom;
        else
            return {
                x: this.center.x + (p.x - ctx.canvas.offsetWidth * 0.5) / this.zoom,
                y: this.center.y - (p.y - ctx.canvas.offsetHeight * 0.5) / this.zoom
            }
    }
};


var ctx: CanvasRenderingContext2D = null;

function initView() {
    // Setup canvas, taking DPR into account
    const canvas = $('canvas') as HTMLCanvasElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    setScale();

    window.onresize = initView;
}
