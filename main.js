// --- Lógica de Navegación ---
function goToStep(step) {
    document.querySelectorAll('.step').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`step-${step}`).classList.remove('hidden');
    document.getElementById(`step-${step}`).classList.add('active');
    
    // Barra de progreso
    const fill = document.getElementById('progress-fill');
    if (step === 1) fill.style.width = '33%';
    if (step === 2) fill.style.width = '66%';
    if (step === 3) fill.style.width = '100%';

    // Al llegar a la página de dibujo, ajustar resolución
    if (step === 2) {
        setTimeout(resizeDrawingCanvas, 100);
    }
}

// --- Lógica del Canvas de Dibujo (Trazos Negros) ---
const drawingCanvas = document.getElementById('drawing-canvas');
const dCtx = drawingCanvas.getContext('2d');
const clearBtn = document.getElementById('clear-btn');
let drawing = false;

// Guardaremos los puntos para animarlos luego
let strokes = []; 
let currentStroke = [];

function resizeDrawingCanvas() {
    // Ajustar resolución interna al tamaño de CSS
    drawingCanvas.width = drawingCanvas.offsetWidth;
    drawingCanvas.height = drawingCanvas.offsetHeight;
}

function getPointerPos(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Configuración del trazo
function setDrawingContext() {
    dCtx.lineWidth = 3;
    dCtx.lineCap = 'round';
    dCtx.lineJoin = 'round';
    dCtx.strokeStyle = '#000000'; // Negro absoluto
}

function startDrawing(e) {
    drawing = true;
    currentStroke = [];
    const pos = getPointerPos(e);
    dCtx.beginPath();
    dCtx.moveTo(pos.x, pos.y);
    currentStroke.push(pos);
    setDrawingContext(); // Asegurar que sea negro cada vez
    if (e.type === 'touchstart') e.preventDefault();
}

function draw(e) {
    if (!drawing) return;
    const pos = getPointerPos(e);
    dCtx.lineTo(pos.x, pos.y);
    dCtx.stroke();
    currentStroke.push(pos);
    if (e.type === 'touchmove') e.preventDefault();
}

function stopDrawing() {
    if (drawing) {
        strokes.push(currentStroke);
    }
    drawing = false;
}

// Eventos Mouse
drawingCanvas.addEventListener('mousedown', startDrawing);
drawingCanvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);

// Eventos Touch (Móvil)
drawingCanvas.addEventListener('touchstart', startDrawing);
drawingCanvas.addEventListener('touchmove', draw);
window.addEventListener('touchend', stopDrawing);

// Botón borrar
clearBtn.addEventListener('click', () => {
    dCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    strokes = [];
});


// --- Lógica de Envío y Animación Final (Estilo gradient.horse) ---
const form = document.getElementById('jungle-form');
const animationCanvas = document.getElementById('animation-canvas');
const aCtx = animationCanvas.getContext('2d');

form.onsubmit = async (e) => {
    e.preventDefault();
    document.getElementById('submit-btn').innerText = "ENVIANDO...";
    
    // 1. Navegar a la pantalla de animación
    goToStep(3);
    resizeAnimationCanvas();

    // 2. Iniciar Animación de Rastro de Degradado
    animateStrokes();

    // 3. Capturar dibujo final y enviar (simulado)
    const finalDrawingData = drawingCanvas.toDataURL('image/png');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.dibujo = finalDrawingData;

    // Aquí iría tu fetch a Google Sheets
    // await fetch('TU_URL', { method: 'POST', body: JSON.stringify(data)});

    setTimeout(() => {
        document.querySelector('#step-3 .status-text').innerText = "¡Dibujo analizado! Ya eres parte de la tribu.";
        document.getElementById('finish-btn').classList.remove('hidden');
    }, strokes.flat().length * 15 + 1000); // Dar tiempo a que termine la animación
};

function resizeAnimationCanvas() {
    animationCanvas.width = animationCanvas.offsetWidth;
    animationCanvas.height = animationCanvas.offsetHeight;
}

function animateStrokes() {
    if (strokes.length === 0) return;

    // Limpiar el canvas de animación
    aCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);

    let allPoints = strokes.flat(); // Aplanar todos los trazos en una lista de puntos
    let pointIndex = 0;

    function drawNextPoint() {
        if (pointIndex >= allPoints.length - 1) return;

        const p1 = allPoints[pointIndex];
        const p2 = allPoints[pointIndex + 1];

        aCtx.beginPath();
        aCtx.moveTo(p1.x, p1.y);
        aCtx.lineTo(p2.x, p2.y);
        
        // ESTILO GRADIENT.HORSE: 
        // Crear un rastro suave con transparencia
        aCtx.lineWidth = 6;
        aCtx.lineCap = 'round';
        aCtx.strokeStyle = `rgba(255, 224, 0, ${1 - pointIndex/allPoints.length * 0.5})`; // Amarillo desvaneciéndose

        // Efecto "Rastro de Luz": No limpiar el canvas, sino dibujar encima suavemente
        aCtx.stroke();
        
        // Dibujar el punto actual con más intensidad
        aCtx.beginPath();
        aCtx.arc(p2.x, p2.y, 4, 0, Math.PI*2);
        aCtx.fillStyle = '#fff'; // Punto blanco brillante
        aCtx.fill();

        pointIndex++;
        // Velocidad de animación basada en la cantidad de puntos
        setTimeout(drawNextPoint, 15); 
    }

    drawNextPoint();
}
