pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const PDF_URL = 'Portfolio - MMX.pdf';
let pdfDoc = null;
let currentPage = 1;

async function loadPDF() {
    try {
        const pdf = await pdfjsLib.getDocument(PDF_URL).promise;
        pdfDoc = pdf;
        console.log('PDF loaded:', pdfDoc.numPages, 'pages');
        
        // Create containers for all pages
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            $('#flipbook').append(`
                <div class="page">
                    <canvas id="page-${i}"></canvas>
                </div>
            `);
        }
        
        // Render first page immediately
        await renderPage(1);
        
        // Initialize flipbook AFTER first render
        setTimeout(() => {
            initFlipbook();
            $('#loader').hide();
            $('#flipbook-container').show();
            $('#controls').show();
            
            // Pre-render next pages in background
            renderPage(2);
            renderPage(3);
        }, 500);
        
    } catch (error) {
        console.error('PDF Error:', error);
        $('#loader').text('Error: ' + error.message);
    }
}

async function renderPage(pageNum) {
    if (!pdfDoc || pageNum < 1 || pageNum > pdfDoc.numPages) return;
    
    try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = document.getElementById(`page-${pageNum}`);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.8 });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
        
        console.log('Rendered page', pageNum);
    } catch (e) {
        console.error('Render error page', pageNum, e);
    }
}

function initFlipbook() {
    $('#flipbook').turn({
        width: 1200,          // Changed back to wider
        height: 800,          // Changed back to normal height
        display: 'double',    // Changed from 'single' to 'double'
        autoCenter: true,
        acceleration: true,
        elevation: 50,
        gradients: true,
        when: {
            turned: function(event, page) {
                $('#page-info').text(`Page ${page} of ${pdfDoc.numPages}`);
                // Render upcoming pages
                if (page + 1 <= pdfDoc.numPages) renderPage(page + 1);
                if (page + 2 <= pdfDoc.numPages) renderPage(page + 2);
                if (page + 3 <= pdfDoc.numPages) renderPage(page + 3);
            }
        }
    });
    
    $('#page-info').text(`Page 1 of ${pdfDoc.numPages}`);
}

$(document).keydown(function(e) {
    if (e.keyCode === 37 && pdfDoc) $('#flipbook').turn('previous');
    else if (e.keyCode === 39 && pdfDoc) $('#flipbook').turn('next');
});

// Start loading on page ready
$(document).ready(() => loadPDF());
