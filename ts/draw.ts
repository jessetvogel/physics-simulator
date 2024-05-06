function circle(x: number, y: number, radius: number): void {
    const center = camera.world2view({ x: x, y: y });
    const r = camera.world2view(radius);
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, 2.0 * Math.PI);
    ctx.stroke();
}

function line(xFrom: number, yFrom: number, xTo: number, yTo: number): void {
    const from = camera.world2view({ x: xFrom, y: yFrom });
    const to = camera.world2view({ x: xTo, y: yTo });
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}
