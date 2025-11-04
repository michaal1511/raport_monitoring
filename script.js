// Application state
let klienciData = [];
let wykonawcaName = '';
let contentItemCounter = 0;
let autosaveInterval;
let filesLoaded = { wykonawca: false, klienci: false };

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    checkConfigurationData();
    setupConfigListeners();
});

// Check if configuration data exists
function checkConfigurationData() {
    const savedWykonawca = localStorage.getItem('wykonawca_data');
    const savedKlienci = localStorage.getItem('klienci_data');

    if (savedWykonawca && savedKlienci) {
        // Data exists, load and start app
        loadDataFromStorage();
        hideConfigModal();
        initializeApp();
    } else {
        // Show configuration modal
        showConfigModal();
    }
}

// Show/hide configuration modal
function showConfigModal() {
    document.getElementById('config-modal').style.display = 'flex';
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('cancel-config-btn').style.display =
        localStorage.getItem('wykonawca_data') ? 'block' : 'none';
}

function hideConfigModal() {
    document.getElementById('config-modal').style.display = 'none';
    document.getElementById('main-container').style.display = 'block';
}

// Setup configuration listeners
function setupConfigListeners() {
    // File input listeners
    document.getElementById('wykonawca-file').addEventListener('change', handleWykonawcaFile);
    document.getElementById('klienci-file').addEventListener('change', handleKlienciFile);

    // Save configuration
    document.getElementById('save-config-btn').addEventListener('click', saveConfiguration);

    // Cancel configuration (only if data already exists)
    document.getElementById('cancel-config-btn').addEventListener('click', () => {
        filesLoaded = { wykonawca: false, klienci: false };
        hideConfigModal();
    });

    // Update data button
    document.getElementById('update-data-btn').addEventListener('click', () => {
        filesLoaded = { wykonawca: false, klienci: false };
        document.getElementById('wykonawca-file').value = '';
        document.getElementById('klienci-file').value = '';
        document.getElementById('wykonawca-status').textContent = '';
        document.getElementById('klienci-status').textContent = '';
        document.getElementById('save-config-btn').disabled = true;
        showConfigModal();
    });
}

// Handle wykonawca file upload
function handleWykonawcaFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        wykonawcaName = e.target.result.trim();
        filesLoaded.wykonawca = true;

        const statusDiv = document.getElementById('wykonawca-status');
        statusDiv.textContent = `✓ Wczytano: ${wykonawcaName}`;
        statusDiv.className = 'file-status success';

        checkFilesLoaded();
    };

    reader.onerror = () => {
        const statusDiv = document.getElementById('wykonawca-status');
        statusDiv.textContent = '✗ Błąd wczytywania pliku';
        statusDiv.className = 'file-status error';
        filesLoaded.wykonawca = false;
        checkFilesLoaded();
    };

    reader.readAsText(file);
}

// Handle klienci file upload
function handleKlienciFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const klienciText = e.target.result;
        const lines = klienciText.split('\n').filter(line => line.trim());

        klienciData = lines.map(line => {
            const [klient, umowa] = line.split('|').map(s => s.trim());
            return { klient, umowa };
        });

        filesLoaded.klienci = true;

        const statusDiv = document.getElementById('klienci-status');
        statusDiv.textContent = `✓ Wczytano ${klienciData.length} klientów`;
        statusDiv.className = 'file-status success';

        checkFilesLoaded();
    };

    reader.onerror = () => {
        const statusDiv = document.getElementById('klienci-status');
        statusDiv.textContent = '✗ Błąd wczytywania pliku';
        statusDiv.className = 'file-status error';
        filesLoaded.klienci = false;
        checkFilesLoaded();
    };

    reader.readAsText(file);
}

// Check if both files are loaded
function checkFilesLoaded() {
    const saveBtn = document.getElementById('save-config-btn');
    saveBtn.disabled = !(filesLoaded.wykonawca && filesLoaded.klienci);
}

// Save configuration to localStorage
function saveConfiguration() {
    localStorage.setItem('wykonawca_data', wykonawcaName);
    localStorage.setItem('klienci_data', JSON.stringify(klienciData));

    hideConfigModal();
    loadDataFromStorage();
    initializeApp();
}

// Load data from localStorage
function loadDataFromStorage() {
    wykonawcaName = localStorage.getItem('wykonawca_data') || '';
    const savedKlienci = localStorage.getItem('klienci_data');

    if (savedKlienci) {
        try {
            klienciData = JSON.parse(savedKlienci);
        } catch (error) {
            console.error('Error parsing klienci data:', error);
            klienciData = [];
        }
    }
}

// Initialize main application
function initializeApp() {
    setCurrentDate();
    populateWykonawca();
    populateKlienci();
    setupEventListeners();
    loadFromLocalStorage();
    startAutosave();
}

// Populate wykonawca field
function populateWykonawca() {
    document.getElementById('wykonawca').value = wykonawcaName;
}

// Populate klienci dropdown
function populateKlienci() {
    const klientSelect = document.getElementById('klient');

    // Clear existing options except the first one
    while (klientSelect.options.length > 1) {
        klientSelect.remove(1);
    }

    // Add klienci options
    klienciData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.klient;
        option.textContent = item.klient;
        option.dataset.umowa = item.umowa;
        klientSelect.appendChild(option);
    });
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

        // Handle screenshots (multiple)
        if (data.screenshots && data.screenshots.length > 0) {
            const screenshotsContainer = container.querySelector('.screenshots-container');
            data.screenshots.forEach(screenshot => {
                addScreenshotToContainer(screenshotsContainer, screenshot.image, screenshot.description);
            });
        }
    }

    // Setup remove button
    const removeBtn = container.querySelector('.btn-remove');
    removeBtn.addEventListener('click', () => {
        container.remove();
        updateItemNumbers();
    });

    // Setup add screenshot button
    const addScreenshotBtn = container.querySelector('.btn-add-screenshot');
    addScreenshotBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const screenshotsContainer = container.querySelector('.screenshots-container');
                    addScreenshotToContainer(screenshotsContainer, event.target.result, '');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    document.getElementById('content-list').appendChild(clone);
}

// Add screenshot to container
function addScreenshotToContainer(container, imageSrc, description = '') {
    const template = document.getElementById('screenshot-item-template');
    const clone = template.content.cloneNode(true);

    const screenshotItem = clone.querySelector('.screenshot-item');
    const img = clone.querySelector('.screenshot-preview img');
    const descriptionTextarea = clone.querySelector('.screenshot-description');
    const removeBtn = clone.querySelector('.btn-remove-screenshot-item');

    img.src = imageSrc;
    descriptionTextarea.value = description;

    removeBtn.addEventListener('click', () => {
        screenshotItem.remove();
    });

    container.appendChild(clone);
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
        // Collect all screenshots with descriptions
        const screenshots = [];
        const screenshotItems = item.querySelectorAll('.screenshot-item');
        screenshotItems.forEach(screenshotItem => {
            const img = screenshotItem.querySelector('.screenshot-preview img');
            const description = screenshotItem.querySelector('.screenshot-description').value;

            if (img.src) {
                screenshots.push({
                    image: img.src,
                    description: description
                });
            }
        });

        data.contentItems.push({
            type: item.querySelector('.content-type').value,
            url: item.querySelector('.content-url').value,
            problems: item.querySelector('.content-problems').value,
            fixes: item.querySelector('.content-fixes').value,
            screenshots: screenshots
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
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        const title = `Monitoring strony - ${document.getElementById('current-date').textContent}`;
        const titleLines = pdf.splitTextToSize(title, contentWidth);
        titleLines.forEach(line => {
            pdf.text(line, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += lineHeight * 1.2;
        });
        yPosition += lineHeight;

        // Form data
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');

        const formData = collectFormData();

        // Data monitoringu
        checkNewPage();
        pdf.setFont(undefined, 'bold');
        pdf.text('Data monitoringu:', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        const dateLines = pdf.splitTextToSize(formData.monitoringDate, contentWidth - 50);
        pdf.text(dateLines, margin + 50, yPosition);
        yPosition += Math.max(lineHeight, dateLines.length * lineHeight);

        // Wykonawca
        checkNewPage(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Wykonawca:', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        const wykonawcaLines = pdf.splitTextToSize(formData.wykonawca, contentWidth - 50);
        pdf.text(wykonawcaLines, margin + 50, yPosition);
        yPosition += Math.max(lineHeight, wykonawcaLines.length * lineHeight);

        // Klient
        checkNewPage(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Klient:', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        const klientLines = pdf.splitTextToSize(formData.klient, contentWidth - 50);
        pdf.text(klientLines, margin + 50, yPosition);
        yPosition += Math.max(lineHeight, klientLines.length * lineHeight);

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
        checkNewPage(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Okres monitoringu:', margin, yPosition);
        pdf.setFont(undefined, 'normal');
        const okresText = `${formData.okresOd} do ${formData.okresDo}`;
        const okresLines = pdf.splitTextToSize(okresText, contentWidth - 50);
        pdf.text(okresLines, margin + 50, yPosition);
        yPosition += Math.max(lineHeight, okresLines.length * lineHeight) + lineHeight;

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
            const typeLines = pdf.splitTextToSize(item.type, contentWidth - 40);
            pdf.text(typeLines, margin + 35, yPosition);
            yPosition += Math.max(lineHeight, typeLines.length * lineHeight);

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

            // Screenshots (multiple with descriptions)
            if (item.screenshots && item.screenshots.length > 0) {
                checkNewPage(15);
                pdf.setFont(undefined, 'bold');
                pdf.text('Zdjęcia:', margin + 5, yPosition);
                yPosition += lineHeight;

                for (let j = 0; j < item.screenshots.length; j++) {
                    const screenshot = item.screenshots[j];

                    if (screenshot.image && screenshot.image.startsWith('data:image')) {
                        // Add screenshot number if there are multiple
                        if (item.screenshots.length > 1) {
                            checkNewPage(10);
                            pdf.setFont(undefined, 'bold');
                            pdf.setFontSize(9);
                            pdf.text(`Zdjęcie ${j + 1}:`, margin + 10, yPosition);
                            yPosition += lineHeight * 0.8;
                            pdf.setFontSize(10);
                        }

                        // Add description if exists
                        if (screenshot.description && screenshot.description.trim()) {
                            checkNewPage(10);
                            pdf.setFont(undefined, 'italic');
                            const descLines = pdf.splitTextToSize(screenshot.description, contentWidth - 15);
                            pdf.text(descLines, margin + 10, yPosition);
                            yPosition += descLines.length * lineHeight;
                        }

                        // Calculate image dimensions
                        try {
                            const maxImgWidth = contentWidth - 15;
                            const maxImgHeight = 80;

                            // Check if we need a new page for the image
                            checkNewPage(maxImgHeight + 10);

                            pdf.addImage(screenshot.image, 'JPEG', margin + 10, yPosition, maxImgWidth, maxImgHeight);
                            yPosition += maxImgHeight + 5;
                        } catch (error) {
                            console.error('Error adding image:', error);
                            pdf.setFont(undefined, 'italic');
                            pdf.text('[Błąd wczytywania obrazu]', margin + 10, yPosition);
                            yPosition += lineHeight;
                        }
                    }
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
