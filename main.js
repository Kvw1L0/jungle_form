// --- NAVEGACIÓN ENTRE PASOS ---
function goToStep(step) {
    // Ocultar todos los pasos quitando la clase 'active'
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Mostrar solo el paso deseado
    document.getElementById(`step-${step}`).classList.add('active');
    
    // Actualizar barra de progreso
    const fill = document.getElementById('progress-fill');
    if (step === 1) fill.style.width = '33%';
    if (step === 2) fill.style.width = '66%';
    if (step === 3) fill.style.width = '100%';

    // Ajustar resolución del canvas si entramos al paso 2
    if (step === 2) {
        setTimeout(resizeDrawingCanvas, 100);
    }
}

// --- TEXTO DINÁMICO DEL SLIDER ---
const slider = document.getElementById('extro-slider');
const caption = document.getElementById('slider-caption');

const labels = {
    1: "Introvertido", 2: "Introvertido",
    3: "Un poco extrovertido", 4: "Un poco extrovertido", 5: "Un poco extrovertido",
    6: "Extrovertido", 7: "Extrovertido", 8: "Extrovertido",
    9: "Muy extrovertido", 10: "Muy extrovertido"
};

if (slider && caption) {
    slider.oninput = function() {
        caption.innerText = labels[this.value];
        caption.style.textShadow = `0 0 10px #FFE000`;
        setTimeout(() => caption.style.textShadow = "none", 150);
    };
}

// --- LÓGICA DE DIBUJO ---
const drawingCanvas = document.getElementById('drawing-canvas');
const dCtx = drawingCanvas.getContext('2d');
let drawing = false;
let currentPart = 'head'; 
const partConfigs = { head: { color: '#FFE000' }, body: { color: '#00E676' }, limbs: { color: '#FF3D00' } };
let strokes = { head: [], body: [], limbs: [] };
let currentStroke = [];

// Selector de partes
document.getElementById('part-selector').addEventListener('click', (e) => {
    if (e.target.classList.contains('part-btn')) {
        document.querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentPart = e.target.dataset.part;
    }
});

function resizeDrawingCanvas() {
    drawingCanvas.width = drawingCanvas.offsetWidth;
    drawingCanvas.height = drawingCanvas.offsetHeight;
}

function getPointerPos(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function startDrawing(e) {
    drawing = true; currentStroke = [];
    const pos = getPointerPos(e);
    dCtx.beginPath(); dCtx.moveTo(pos.x, pos.y);
    currentStroke.push(pos);
    dCtx.lineWidth = 3; dCtx.lineCap = 'round'; dCtx.lineJoin = 'round'; dCtx.strokeStyle = '#000000'; 
    if (e.type === 'touchstart') e.preventDefault();
}

function draw(e) {
    if (!drawing) return;
    const pos = getPointerPos(e);
    dCtx.lineTo(pos.x, pos.y); dCtx.stroke();
    currentStroke.push(pos);
    if (e.type === 'touchmove') e.preventDefault();
}

function stopDrawing() {
    if (drawing) strokes[currentPart].push(currentStroke);
    drawing = false;
}

drawingCanvas.addEventListener('mousedown', startDrawing);
drawingCanvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);
drawingCanvas.addEventListener('touchstart', startDrawing);
drawingCanvas.addEventListener('touchmove', draw);
window.addEventListener('touchend', stopDrawing);

document.getElementById('clear-btn').addEventListener('click', () => {
    dCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    strokes = { head: [], body: [], limbs: [] };
});

// --- LÓGICA DE ANIMACIÓN FINAL ---
const form = document.getElementById('jungle-form');
const animationCanvas = document.getElementById('animation-canvas');
const aCtx = animationCanvas.getContext('2d');
let animationFrameId;

form.onsubmit = (e) => {
    e.preventDefault();
    goToStep(3);
    setTimeout(() => {
        animationCanvas.width = animationCanvas.offsetWidth;
        animationCanvas.height = animationCanvas.offsetHeight;
        startJungleAnimation();
    }, 100);
};

function startJungleAnimation() {
    if (!strokes.head.length && !strokes.body.length && !strokes.limbs.length) return;
    let startTime = performance.now();

    function animLoop(currentTime) {
        let elapsed = currentTime - startTime;
        aCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
        aCtx.lineWidth = 4; aCtx.lineCap = 'round'; aCtx.lineJoin = 'round';

        aCtx.strokeStyle = partConfigs.head.color;
        drawPartStrokes(strokes.head, Math.sin(elapsed / 300) * 8, 0);

        aCtx.strokeStyle = partConfigs.body.color;
        drawPartStrokes(strokes.body, 0, Math.sin(elapsed / 200) * 3);

        aCtx.strokeStyle = partConfigs.limbs.color;
        drawPartStrokes(strokes.limbs, 0, Math.sin(elapsed / 150) * 12);

        animationFrameId = requestAnimationFrame(animLoop);
    }
    animationFrameId = requestAnimationFrame(animLoop);
}

function drawPartStrokes(partStrokes, offsetX, offsetY) {
    partStrokes.forEach(stroke => {
        if (stroke.length < 2) return;
        aCtx.beginPath();
        aCtx.moveTo(stroke[0].x + offsetX, stroke[0].y + offsetY);
        for (let i = 1; i < stroke.length; i++) {
            aCtx.lineTo(stroke[i].x + offsetX, stroke[i].y + offsetY);
        }
        aCtx.stroke();
    });
}
