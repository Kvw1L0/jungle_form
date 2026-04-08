// --- Lógica de Navegación ---
function goToStep(step) {
    document.querySelectorAll('.step').forEach(el => el.classList.add('hidden'));
    
    document.getElementById(`step-${step}`).classList.remove('hidden');
    
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

// --- Lógica del Canvas de Dibujo (Trazos Negros sobre Blanco) ---
const drawingCanvas = document.getElementById('drawing-canvas');
const dCtx = drawingCanvas.getContext('2d');
const clearBtn = document.getElementById('clear-btn');
const partSelector = document.getElementById('part-selector');
let drawing = false;

// COLORES DE REFERENCIA PARA EL DIBUJO (Se dibujan negros, pero se guardan por zona)
let currentPart = 'head'; 
const partConfigs = {
    head: { color: '#FFE000' }, // Amarillo Jungle
    body: { color: '#00E676' }, // Verde Jungle
    limbs: { color: '#FF3D00' } // Rojo Acento
};

// Objeto para guardar los trazos por zona
let strokes = {
    head: [],
    body: [],
    limbs: []
};
let currentStroke = [];

// Selector de Partes
partSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('part-btn')) {
        // Desactivar botones antiguos
        partSelector.querySelectorAll('.part-btn').forEach(btn => btn.classList.remove('active'));
        // Activar el nuevo
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
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function setDrawingContext() {
    dCtx.lineWidth = 3;
    dCtx.lineCap = 'round';
    dCtx.lineJoin = 'round';
    // Se dibuja negro para el usuario, pero se asigna color al guardar
    dCtx.strokeStyle = '#000000'; 
}

function startDrawing(e) {
    drawing = true;
    currentStroke = [];
    const pos = getPointerPos(e);
    dCtx.beginPath();
    dCtx.moveTo(pos.x, pos.y);
    currentStroke.push(pos);
    setDrawingContext();
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
        // Guardamos el trazo en la zona correcta
        strokes[currentPart].push(currentStroke);
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
    strokes = { head: [], body: [], limbs: [] };
});


// --- Lógica de Envío y ANIMACIÓN DE ZONAS (Estilo Palito Movimiento) ---
const form = document.getElementById('jungle-form');
const animationCanvas = document.getElementById('animation-canvas');
const aCtx = animationCanvas.getContext('2d');
let animationFrameId;

form.onsubmit = (e) => {
    e.preventDefault();
    document.getElementById('submit-btn').innerText = "PROCESANDO TRIBU...";
    
    // 1. Navegar a la pantalla de animación
    goToStep(3);
    resizeAnimationCanvas();

    // 2. Iniciar Animación de Trazos
    startJungleAnimation();

    // 3. Capturar dibujo base para enviar (opcional, para registro)
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    // Aquí iría tu fetch a Google Sheets
};

function resizeAnimationCanvas() {
    animationCanvas.width = animationCanvas.offsetWidth;
    animationCanvas.height = animationCanvas.offsetHeight;
}

function startJungleAnimation() {
    if (!strokes.head.length && !strokes.body.length && !strokes.limbs.length) {
        document.querySelector('#step-3 .status-text').innerText = "¡No dibujaste nada! Pero igual ya eres de la Tribu.";
        return;
    }

    let startTime = performance.now();

    function animLoop(currentTime) {
        let elapsed = currentTime - startTime;
        aCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
        
        // Configuraciones base de trazo para animación (Colores Jungle sobre Negro)
        aCtx.lineWidth = 4;
        aCtx.lineCap = 'round';
        aCtx.lineJoin = 'round';

        // --- ANIMACIÓN CADEZA (data: Izquierda/Derecha suaves) ---
        aCtx.strokeStyle = partConfigs.head.color;
        // Movimiento senoidal en X: sin(tiempo) * amplitud
        const headOffsetX = Math.sin(elapsed / 300) * 8; 
        drawPartStrokes(strokes.head, headOffsetX, 0);

        // --- ANIMACIÓN TRONCO (data: Respiración/Subida leve) ---
        aCtx.strokeStyle = partConfigs.body.color;
        // Movimiento senoidal en Y (leve): sin(tiempo) * 2px
        const bodyOffsetY = Math.sin(elapsed / 200) * 3;
        drawPartStrokes(strokes.body, 0, bodyOffsetY);

        // --- ANIMACIÓN EXTREMIDADES (data: Subir y bajar pies/manos) ---
        aCtx.strokeStyle = partConfigs.limbs.color;
        // Movimiento senoidal en Y (más rápido): sin(tiempo) * 15px
        const limbsOffsetY = Math.sin(elapsed / 150) * 12;
        drawPartStrokes(strokes.limbs, 0, limbsOffsetY);

        animationFrameId = requestAnimationFrame(animLoop);
    }

    animationFrameId = requestAnimationFrame(animLoop);
}

// Helper para dibujar todos los trazos de una parte con su offset
function drawPartStrokes(partStrokes, offsetX, offsetY) {
    partStrokes.forEach(stroke => {
        if (stroke.length < 2) return;
        aCtx.beginPath();
        // Aplicamos offset al primer punto
        aCtx.moveTo(stroke[0].x + offsetX, stroke[0].y + offsetY);
        for (let i = 1; i < stroke.length; i++) {
            // Aplicamos offset a todos los puntos del trazo
            aCtx.lineTo(stroke[i].x + offsetX, stroke[i].y + offsetY);
        }
        aCtx.stroke();
    });
}
