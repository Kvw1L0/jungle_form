function goToStep(step) {
    // 1. Quitamos 'active' de todos los pasos
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
    });
    
    // 2. Mostramos solo el paso actual
    const currentStepEl = document.getElementById(`step-${step}`);
    currentStepEl.classList.add('active');
    
    // 3. Actualizamos la barra de progreso
    const fill = document.getElementById('progress-fill');
    const widths = { 1: '33%', 2: '66%', 3: '100%' };
    fill.style.width = widths[step];

    if (step === 2) setTimeout(resizeDrawingCanvas, 100);
}

// Lógica de los textos del slider
const slider = document.getElementById('extro-slider');
const caption = document.getElementById('slider-caption');

const labels = {
    1: "Introvertido", 2: "Introvertido",
    3: "Un poco extrovertido", 4: "Un poco extrovertido", 5: "Un poco extrovertido",
    6: "Extrovertido", 7: "Extrovertido", 8: "Extrovertido",
    9: "Muy extrovertido", 10: "Muy extrovertido"
};

if(slider) {
    slider.oninput = function() {
        caption.innerText = labels[this.value];
    };
}
