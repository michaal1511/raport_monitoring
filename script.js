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

    // Setup fetch title button
    const fetchTitleBtn = container.querySelector('.btn-fetch-title');
    const urlInput = container.querySelector('.content-url');
    const titleInput = container.querySelector('.content-title');

    fetchTitleBtn.addEventListener('click', () => {
        fetchPageTitle(urlInput.value, titleInput, fetchTitleBtn);
    });

    // Auto-fetch title when URL is pasted
    urlInput.addEventListener('paste', (e) => {
        // Small delay to get the pasted value
        setTimeout(() => {
            const url = urlInput.value.trim();
            if (url && isValidUrl(url) && !titleInput.value.trim()) {
                fetchPageTitle(url, titleInput, fetchTitleBtn);
            }
        }, 100);
    });

    // Add to DOM first
    document.getElementById('content-list').appendChild(clone);

    // Now initialize Quill editors (they need to be in DOM)
    const actualContainer = document.getElementById('content-list').lastElementChild;

    const problemsEditor = new Quill(actualContainer.querySelector('.content-problems-editor'), {
        theme: 'snow',
        placeholder: 'Opisz zidentyfikowane problemy...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'code-block'],
                ['clean']
            ]
        }
    });

    const fixesEditor = new Quill(actualContainer.querySelector('.content-fixes-editor'), {
        theme: 'snow',
        placeholder: 'Opisz wprowadzone poprawki...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'code-block'],
                ['clean']
            ]
        }
    });

    // Store Quill instances on the container
    actualContainer.quilProblemsEditor = problemsEditor;
    actualContainer.quillFixesEditor = fixesEditor;

    // If data is provided, populate fields
    if (data) {
        actualContainer.querySelector('.content-type').value = data.type || '';
        actualContainer.querySelector('.content-title').value = data.title || '';
        actualContainer.querySelector('.content-url').value = data.url || '';

        // Set Quill content (can be HTML or plain text)
        if (data.problems) {
            problemsEditor.root.innerHTML = data.problems;
        }
        if (data.fixes) {
            fixesEditor.root.innerHTML = data.fixes;
        }

        // Handle screenshots (multiple)
        if (data.screenshots && data.screenshots.length > 0) {
            const screenshotsContainer = actualContainer.querySelector('.screenshots-container');
            data.screenshots.forEach(screenshot => {
                addScreenshotToContainer(screenshotsContainer, screenshot.image, screenshot.description);
            });
        }
    }
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

        // Get HTML content from Quill editors
        const problemsHTML = item.quilProblemsEditor ? item.quilProblemsEditor.root.innerHTML : '';
        const fixesHTML = item.quillFixesEditor ? item.quillFixesEditor.root.innerHTML : '';

        data.contentItems.push({
            type: item.querySelector('.content-type').value,
            title: item.querySelector('.content-title').value,
            url: item.querySelector('.content-url').value,
            problems: problemsHTML,
            fixes: fixesHTML,
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

// Validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Fetch page title from URL
async function fetchPageTitle(url, titleInput, button) {
    if (!url || !isValidUrl(url)) {
        alert('Wprowadź poprawny adres URL');
        return;
    }

    // Show loading state
    const originalText = button.textContent;
    button.textContent = '⏳';
    button.disabled = true;
    button.classList.add('loading');

    try {
        // Try using allorigins.win CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl, {
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error('Nie udało się pobrać strony');
        }

        const data = await response.json();
        const html = data.contents;

        // Extract title from HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

        if (titleMatch && titleMatch[1]) {
            // Decode HTML entities and clean up
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = titleMatch[1];
            const title = tempDiv.textContent.trim();

            titleInput.value = title;
        } else {
            alert('Nie znaleziono tytułu na stronie');
        }
    } catch (error) {
        console.error('Error fetching title:', error);

        // Try alternative: cors-anywhere or just show error
        alert('Nie udało się pobrać tytułu. Możesz wpisać tytuł ręcznie.\n\nPowód: ' + (error.message || 'Problem z połączeniem'));
    } finally {
        // Restore button state
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('loading');
    }
}
