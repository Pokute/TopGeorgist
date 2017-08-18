const drawLine = () => {
    const c = document.getElementById("canvas");
    const ctx = c.getContext("2d");
    ctx.moveTo(0,0);
    ctx.lineTo(200,100);
    ctx.stroke();
};

window.onload = drawLine;