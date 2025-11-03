// Application state
let klienciData = [];
let wykonawcaName = '';
let contentItemCounter = 0;
let autosaveInterval;

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await loadDataFiles();
    setCurrentDate();
    setupEventListeners();
    loadFromLocalStorage();
    startAutosave();
});

// Load data from text files
async function loadDataFiles() {
    try {
        // Load wykonawca
        const wykonawcaResponse = await fetch('wykonawca.txt');
        wykonawcaName = await wykonawcaResponse.text();
        document.getElementById('wykonawca').value = wykonawcaName.trim();

        // Load klienci
        const klienciResponse = await fetch('klienci.txt');
        const klienciText = await klienciResponse.text();
        const lines = klienciText.split('\n').filter(line => line.trim());

        klienciData = lines.map(line => {
            const [klient, umowa] = line.split('|').map(s => s.trim());
            return { klient, umowa };
        });

        // Populate klient dropdown
        const klientSelect = document.getElementById('klient');
        klienciData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.klient;
            option.textContent = item.klient;
            option.dataset.umowa = item.umowa;
            klientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading data files:', error);
        alert('Błąd wczytywania plików danych. Upewnij się, że pliki wykonawca.txt i klienci.txt istnieją.');
    }
}

// Set current date in title
function setCurrentDate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-date').textContent = formattedDate;

    // Set default monitoring date to today
    const today = now.toISOString().split('T')[0];
    document.getElementById('monitoring-date').value = today;
}

// Setup event listeners
function setupEventListeners() {
    // Client selection - update zakres
    document.getElementById('klient').addEventListener('change', (e) => {
        const selectedOption = e.target.selectedOptions[0];
        const umowa = selectedOption ? selectedOption.dataset.umowa : '';

        if (umowa) {
            const zakres = `Monitoring nowych treści i wprowadzenie poprawek zgodnych z WCAG 2.1, zgodnie z umową ${umowa}`;
            document.getElementById('zakres').value = zakres;
        } else {
            document.getElementById('zakres').value = '';
        }
    });

    // Add content item
    document.getElementById('add-content-btn').addEventListener('click', addContentItem);

    // Save to JSON
    document.getElementById('save-json-btn').addEventListener('click', saveToJSON);

    // Load from JSON
    document.getElementById('load-json-input').addEventListener('change', loadFromJSON);

    // Export to PDF
    document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);

    // Form change listener for autosave
    document.getElementById('report-form').addEventListener('change', () => {
        // Trigger autosave on next interval
    });
}

// Add new content item
function addContentItem(data = null) {
    const template = document.getElementById('content-item-template');
    const clone = template.content.cloneNode(true);

    contentItemCounter++;

    // Set item number
    clone.querySelector('.item-number').textContent = contentItemCounter;

    // Get the container
    const container = clone.querySelector('.content-item');
    container.dataset.itemId = contentItemCounter;

    // If data is provided, populate fields
    if (data) {
        container.querySelector('.content-type').value = data.type || '';
        container.querySelector('.content-url').value = data.url || '';
        container.querySelector('.content-problems').value = data.problems || '';
        container.querySelector('.content-fixes').value = data.fixes || '';

        // Handle screenshot
        if (data.screenshot) {
            const preview = container.querySelector('.screenshot-preview');
            const img = preview.querySelector('img');
            img.src = data.screenshot;
            preview.style.display = 'block';
            container.querySelector('.screenshot-input').style.display = 'none';
        }
    }

    // Setup remove button
    const removeBtn = container.querySelector('.btn-remove');
    removeBtn.addEventListener('click', () => {
        container.remove();
        updateItemNumbers();
    });

    // Setup screenshot upload
    const screenshotInput = container.querySelector('.screenshot-input');
    screenshotInput.addEventListener('change', (e) => handleScreenshotUpload(e, container));

    // Setup screenshot remove
    const removeScreenshotBtn = container.querySelector('.btn-remove-screenshot');
    removeScreenshotBtn.addEventListener('click', () => {
        const preview = container.querySelector('.screenshot-preview');
        preview.style.display = 'none';
        preview.querySelector('img').src = '';
        screenshotInput.value = '';
        screenshotInput.style.display = 'block';
    });

    document.getElementById('content-list').appendChild(clone);
}

// Handle screenshot upload
function handleScreenshotUpload(event, container) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = container.querySelector('.screenshot-preview');
        const img = preview.querySelector('img');
        img.src = e.target.result;
        preview.style.display = 'block';
        event.target.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Update item numbers after deletion
function updateItemNumbers() {
    const items = document.querySelectorAll('.content-item');
    items.forEach((item, index) => {
        item.querySelector('.item-number').textContent = index + 1;
    });
    contentItemCounter = items.length;
}

// Collect form data
function collectFormData() {
    const data = {
        monitoringDate: document.getElementById('monitoring-date').value,
        wykonawca: document.getElementById('wykonawca').value,
        klient: document.getElementById('klient').value,
        zakres: document.getElementById('zakres').value,
        okresOd: document.getElementById('okres-od').value,
        okresDo: document.getElementById('okres-do').value,
        contentItems: []
    };

    const items = document.querySelectorAll('.content-item');
    items.forEach(item => {
        const screenshotImg = item.querySelector('.screenshot-preview img');
        const screenshotSrc = screenshotImg.src || '';

        data.contentItems.push({
            type: item.querySelector('.content-type').value,
            url: item.querySelector('.content-url').value,
            problems: item.querySelector('.content-problems').value,
            fixes: item.querySelector('.content-fixes').value,
            screenshot: screenshotSrc
        });
    });

    return data;
}

// Load form data
function loadFormData(data) {
    document.getElementById('monitoring-date').value = data.monitoringDate || '';
    document.getElementById('klient').value = data.klient || '';

    // Trigger change event to update zakres
    const changeEvent = new Event('change');
    document.getElementById('klient').dispatchEvent(changeEvent);

    document.getElementById('okres-od').value = data.okresOd || '';
    document.getElementById('okres-do').value = data.okresDo || '';

    // Clear existing content items
    document.getElementById('content-list').innerHTML = '';
    contentItemCounter = 0;

    // Add content items
    if (data.contentItems && data.contentItems.length > 0) {
        data.contentItems.forEach(item => addContentItem(item));
    }
}

// Autosave to localStorage
function startAutosave() {
    autosaveInterval = setInterval(() => {
        const data = collectFormData();
        localStorage.setItem('raport_autosave', JSON.stringify(data));

        const now = new Date();
        const timeString = now.toLocaleTimeString('pl-PL');
        document.getElementById('autosave-time').textContent = timeString;
    }, 60000); // Every 1 minute
}

// Load from localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('raport_autosave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const loadAutosave = confirm('Znaleziono automatycznie zapisane dane. Czy chcesz je wczytać?');
            if (loadAutosave) {
                loadFormData(data);
            }
        } catch (error) {
            console.error('Error loading autosave:', error);
        }
    }
}

// Save to JSON file
function saveToJSON() {
    const data = collectFormData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `raport_${timestamp}.json`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
}

// Load from JSON file
function loadFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            loadFormData(data);
            alert('Dane zostały wczytane pomyślnie!');
        } catch (error) {
            console.error('Error loading JSON:', error);
            alert('Błąd wczytywania pliku JSON!');
        }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}

// Export to PDF
async function exportToPDF() {
    const { jsPDF } = window.jspdf;

    if (!jsPDF) {
        alert('Biblioteka jsPDF nie została załadowana!');
        return;
    }

    // Show loading message
    const originalText = document.getElementById('export-pdf-btn').textContent;
    document.getElementById('export-pdf-btn').textContent = '⏳ Generowanie PDF...';
    document.getElementById('export-pdf-btn').disabled = true;

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;

        let yPosition = margin;
        const lineHeight = 7;

        // Get current timestamp
        const now = new Date();
        const timestamp = now.toLocaleString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Helper function to add watermark and timestamp to each page
        function addPageElements(pageNum) {
            // Watermark (vertical text on left)
            pdf.setFontSize(10);
            pdf.setTextColor(200, 200, 200);
            pdf.text(wykonawcaName, 8, pageHeight / 2, { angle: 90 });

            // Timestamp (bottom right)
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(timestamp, pageWidth - margin, pageHeight - 10, { align: 'right' });

            // Reset text color
            pdf.setTextColor(0, 0, 0);
        }

        // Helper function to check if we need a new page
        function checkNewPage(requiredSpace = 10) {
            if (yPosition + requiredSpace > pageHeight - margin - 15) {
                pdf.addPage();
                addPageElements();
                yPosition = margin;
                return true;
            }
            return false;
        }

        // Add watermark and timestamp to first page
        addPageElements();

        // Title
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        const title = `Monitoring strony - ${document.getElementById('current-date').textContent}`;
        pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += lineHeight * 2;

        // Form data
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');

        const formData = collectFormData();

        // Data monitoringu
        checkNewPage();
        pdf.setFont(undefined, 'bold');
        pdf.text('Data monitoringu:', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.text(formData.monitoringDate, margin + 50, yPosition);
        yPosition += lineHeight;

        // Wykonawca
        checkNewPage();
        pdf.setFont(undefined, 'bold');
        pdf.text('Wykonawca:', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.text(formData.wykonawca, margin + 50, yPosition);
        yPosition += lineHeight;

        // Klient
        checkNewPage();
        pdf.setFont(undefined, 'bold');
        pdf.text('Klient:', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.text(formData.klient, margin + 50, yPosition);
        yPosition += lineHeight;

        // Zakres raportu
        checkNewPage(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('Zakres raportu:', margin, yPosition);
        yPosition += lineHeight;
        pdf.setFont(undefined, 'normal');
        const zakresLines = pdf.splitTextToSize(formData.zakres, contentWidth);
        pdf.text(zakresLines, margin, yPosition);
        yPosition += zakresLines.length * lineHeight;

        // Okres monitoringu
        checkNewPage();
        pdf.setFont(undefined, 'bold');
        pdf.text('Okres monitoringu:', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${formData.okresOd} do ${formData.okresDo}`, margin + 50, yPosition);
        yPosition += lineHeight * 2;

        // Lista zweryfikowanych treści
        checkNewPage();
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Lista zweryfikowanych treści', margin, yPosition);
        yPosition += lineHeight * 1.5;

        // Content items
        for (let i = 0; i < formData.contentItems.length; i++) {
            const item = formData.contentItems[i];

            checkNewPage(30);

            // Item header
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text(`Element ${i + 1}`, margin, yPosition);
            yPosition += lineHeight;

            pdf.setFontSize(10);

            // Typ treści
            pdf.setFont(undefined, 'bold');
            pdf.text('Typ treści:', margin + 5, yPosition);
            pdf.setFont(undefined, 'normal');
            pdf.text(item.type, margin + 35, yPosition);
            yPosition += lineHeight;

            // URL
            checkNewPage();
            pdf.setFont(undefined, 'bold');
            pdf.text('Adres URL:', margin + 5, yPosition);
            yPosition += lineHeight;
            pdf.setFont(undefined, 'normal');
            const urlLines = pdf.splitTextToSize(item.url, contentWidth - 10);
            pdf.text(urlLines, margin + 10, yPosition);
            yPosition += urlLines.length * lineHeight;

            // Zidentyfikowane problemy
            checkNewPage(15);
            pdf.setFont(undefined, 'bold');
            pdf.text('Zidentyfikowane problemy:', margin + 5, yPosition);
            yPosition += lineHeight;
            pdf.setFont(undefined, 'normal');
            const problemLines = pdf.splitTextToSize(item.problems, contentWidth - 10);
            pdf.text(problemLines, margin + 10, yPosition);
            yPosition += problemLines.length * lineHeight;

            // Wprowadzone poprawki
            checkNewPage(15);
            pdf.setFont(undefined, 'bold');
            pdf.text('Wprowadzone poprawki:', margin + 5, yPosition);
            yPosition += lineHeight;
            pdf.setFont(undefined, 'normal');
            const fixesLines = pdf.splitTextToSize(item.fixes, contentWidth - 10);
            pdf.text(fixesLines, margin + 10, yPosition);
            yPosition += fixesLines.length * lineHeight;

            // Screenshot
            if (item.screenshot && item.screenshot.startsWith('data:image')) {
                checkNewPage(80);
                pdf.setFont(undefined, 'bold');
                pdf.text('Zrzut ekranu:', margin + 5, yPosition);
                yPosition += lineHeight;

                try {
                    const imgWidth = contentWidth - 10;
                    const imgHeight = 100; // Max height

                    pdf.addImage(item.screenshot, 'JPEG', margin + 10, yPosition, imgWidth, imgHeight);
                    yPosition += imgHeight + 5;
                } catch (error) {
                    console.error('Error adding image:', error);
                    pdf.setFont(undefined, 'italic');
                    pdf.text('[Błąd wczytywania obrazu]', margin + 10, yPosition);
                    yPosition += lineHeight;
                }
            }

            yPosition += lineHeight;
        }

        // Save PDF
        const pdfTimestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        pdf.save(`raport_${pdfTimestamp}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Wystąpił błąd podczas generowania PDF!');
    } finally {
        // Restore button
        document.getElementById('export-pdf-btn').textContent = originalText;
        document.getElementById('export-pdf-btn').disabled = false;
    }
}
