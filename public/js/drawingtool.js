const canvas = document.getElementById("f-canvas");
const canvasBound = canvas.getBoundingClientRect()
const ctx = canvas.getContext("2d");

const penSizeInput = document.getElementById("f-size-range");
penSizeInput.value = 1;
let penSize = 4;
ctx.fillStyle = '#000000';

let availablePalettes = [];
let lastPalette = 0;

let isDrawing = false;
let lastPos = { x: 0, y: 0 };

/**
 * x & y are screen coords given by e.clientX & e.clientY. They are adjusted
 * for the canvas.
*/
function penDrawRect(x, y) {
    ctx.fillRect(
        x - canvasBound.left - penSize / 2, 
        y - canvasBound.top - penSize / 2,
        penSize,
        penSize
    );
}

function updatePen() {
    penSize = penSizeInput.value ** 2;
}

function populateColorTray() {
    let colorTray = document.getElementById("f-color-tray");
    let colors = availablePalettes[lastPalette];
    colorTray.innerHTML = '';
    // background
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    colors.forEach(color => {
        let button = document.createElement('button');
        button.setAttribute('class', "color-button");
        button.setAttribute('colorval', color)
        button.style.backgroundColor = color;
        button.addEventListener("click", () => {
            ctx.fillStyle = button.getAttribute("colorval");
        });
        colorTray.appendChild(button);
    });
    if (lastPalette >= availablePalettes.length - 1) {
        lastPalette = 0;
    }
    else {
        lastPalette++;
    }
}

function warningPopup() {
    console.log("Warning")
    let overlay = document.createElement("div");
    overlay.setAttribute("class", "f-popup-overlay");
    document.body.appendChild(overlay);
    let popup = document.createElement("div");
    popup.setAttribute("class", "f-warning-popup");
    popup.innerHTML = "<h3>WARNING</h3><p>This action will reset your canvas, " +
        "erasing all current progress. Are you sure you want to proceed?</p><br>" +
        "<button class=\"f-popup-button\" id=\"f-popup-confirm\">Proceed</button>" +
        "<button class=\"f-popup-button\" id=\"f-popup-cancel\">Cancel</button>";
    document.body.appendChild(popup);
    let confButton = document.getElementById("f-popup-confirm");
    let cancelButton = document.getElementById("f-popup-cancel");
    return new Promise((resolve, reject) => {
        let confirm = event => {
            confButton.removeEventListener('click', confirm);
            cancelButton.removeEventListener('click', cancel);
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
            resolve(event);
        }
        let cancel = event => {
            confButton.removeEventListener('click', confirm);
            cancelButton.removeEventListener('click', cancel);
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
            reject(event);
        }
        confButton.addEventListener('click', confirm);
        cancelButton.addEventListener('click', cancel);
    });
}

async function changePalette() {
    if (await warningPopup()) {
        populateColorTray();
    }
}
async function clearDrawing() {
    if (await warningPopup()) {
        let fillColor = document.getElementById("f-color-tray").children[0]
            .getAttribute("colorval");
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}
function saveDrawing() {
    let canvas = document.getElementById("f-canvas")
    let image = canvas.toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    let now = new Date();
    let formattedDate = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', image);
    downloadLink.setAttribute('download', `formwhile_${formattedDate}.png`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    lastPos.x = e.clientX;
    lastPos.y = e.clientY;
    penDrawRect(e.clientX, e.clientY);
});
canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        let dx = e.clientX - lastPos.x;
        let dy = e.clientY - lastPos.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            let len = Math.sqrt(dx**2 + dy**2);
            let res = Math.floor(len) * (10 / penSizeInput.value);
            for (let i = 0; i < res; i++) {
                penDrawRect(lastPos.x + i * (dx / res), lastPos.y + i * (dy / res));
            }
        }
        else {
            penDrawRect(e.clientX, e.clientY);
        }
        lastPos.x = e.clientX;
        lastPos.y = e.clientY;
    }
});
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});
canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
});

penSizeInput.addEventListener("change", updatePen);

fetch(`${window.location.origin}/data/api/palettes`)
    .then(res => res.json())
    .then(data => {
        data.forEach(r => {
            availablePalettes.push(r['colors']);
        });
        populateColorTray();
    });