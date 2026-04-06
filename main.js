const canvas = document.getElementById('canvas-dibujo');
const ctx = canvas.getContext('2d');
let drawing = false;

// Ajustar resolución del canvas
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.addEventListener('load', resizeCanvas);

// Funciones de dibujo (Soporta mouse y touch)
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => { drawing = true; ctx.beginPath(); });
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
});
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('touchstart', (e) => { drawing = true; ctx.beginPath(); e.preventDefault(); });
canvas.addEventListener('touchmove', (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
});

document.getElementById('clear-btn').onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

// Navegación
function goToStep(step) {
    document.getElementById('step-1').classList.toggle('hidden', step === 2);
    document.getElementById('step-2').classList.toggle('hidden', step === 1);
    document.getElementById('progress').style.width = step === 1 ? '50%' : '100%';
}

// Envío de Datos
const form = document.getElementById('jungle-form');
form.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.innerText = "PROCESANDO...";
    submitBtn.disabled = true;

    const drawingData = canvas.toDataURL('image/png'); // Convierte dibujo a texto (Base64)
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.dibujo = drawingData;

    try {
        await fetch('TU_URL_DE_APPS_SCRIPT', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        alert('¡Bienvenido a la Tribu Jungle!');
        location.reload();
    } catch (err) {
        alert('Error en la conexión. Revisa los datos.');
        submitBtn.disabled = false;
        submitBtn.innerText = "REINTENTAR";
    }
};
