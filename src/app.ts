// Get DOM elements
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
const colorSwatchers = document.querySelectorAll('.color-swatch');
const brushSize = document.getElementById('brushSize') as HTMLInputElement;
const brushSizeValue = document.getElementById('brushSizeValue') as HTMLSpanElement;
const newBtn = document.getElementById('newBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const gallery = document.getElementById('gallery') as HTMLDivElement;


const deleteAllBtn = document.getElementById('deleteAllBtn') as HTMLButtonElement;



// Set initial values
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000000';

// Function to clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to draw
function draw(e: MouseEvent) {
    if (!isDrawing) return; // If not in drawing mode, exit
    ctx.lineWidth = parseInt(brushSize.value, 10);
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor; // Set line color
    ctx.beginPath();
    ctx.moveTo(lastX, lastY); // Start from the last position
    ctx.lineTo(e.offsetX, e.offsetY); // Draw line to the current position
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY]; // Update the last position
}

// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

// Handler for the "New" button
newBtn.addEventListener('click', clearCanvas);

// Handlers for the color palette
colorSwatchers.forEach(swatch => {
    swatch.addEventListener('click', () => {
        currentColor = (swatch as HTMLElement).dataset.color!;
        document.querySelector('.color-swatch.active')?.classList.remove('active');
        swatch.classList.add('active');
    });
});

colorPicker.addEventListener('input', (e) => {
    currentColor = (e.target as HTMLInputElement).value;
});

// Handler for brush size
brushSize.addEventListener('input', (e) => {
    brushSizeValue.textContent = (e.target as HTMLInputElement).value;
});

// Function to save the drawing
async function saveDrawing() {
    const image = canvas.toDataURL('image/png');
    const response = await fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({image})
    });
    const data = await response.json();
    console.log(data.message);
    loadGallery(); // Reload the gallery
}

saveBtn.addEventListener('click', saveDrawing);

// Function to delete the drawing
async function deleteDrawing(filename: string) {
    const  response = await fetch(`/image/${filename}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    console.log(data.message);
    loadGallery(); // Reload the gallery
}

// Function to load the gallery
async function loadGallery() {
    const response = await fetch('/images');
    const images = await response.json();
    gallery.innerHTML = ''; // Clear the gallery
    images.forEach((image: string) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'gallery-item';

        const imgElement = document.createElement('img');
        imgElement.src = `img/${image}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteDrawing(image));

        imgContainer.appendChild(imgElement);
        imgContainer.appendChild(deleteBtn);
        gallery.appendChild(imgContainer);
    });
}




async function deleteAllDrawings() {
    const response = await fetch('/images', {
        method: 'DELETE'
    });

    const data = await response.json();
    console.log(data.message);
    loadGallery(); 
}

deleteAllBtn.addEventListener('click', deleteAllDrawings);



// Load the gallery on page load
loadGallery();
