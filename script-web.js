// Application state
let klienciData = [];
let wykonawcaName = '';
let bledyTemplates = [];
let poprawkiTemplates = [];
let contentItemCounter = 0;
let currentReportId = null;
let currentUser = null;

// API Base URL - zmień to na adres swojego serwera
const API_URL = 'api.php';

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    await checkAuthentication();

    await loadConfiguration();
    setupEventListeners();
    setCurrentDate();
    updateUserInfo();
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const result = await apiCall('check_auth');
        if (!result.authenticated) {
            // Redirect to login
            window.location.href = 'login.html';
            return;
        }
        currentUser = result.user;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = 'login.html';
    }
}

// Update user info display
function updateUserInfo() {
    if (currentUser) {
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.innerHTML = `
                <span class="user-name">👤 ${currentUser.full_name || currentUser.username}</span>
                <span class="user-role">${currentUser.role === 'administrator' ? 'Administrator' : 'Audytor'}</span>
            `;
        }
    }
}

// Logout function
async function logout() {
    if (confirm('Czy na pewno chcesz się wylogować?')) {
        try {
            await apiCall('logout', {}, 'POST');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = 'login.html';
        }
    }
}

// ========================================
// API FUNCTIONS
// ========================================

async function apiCall(action, data = null, method = 'GET') {
    showLoading();
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        let url = `${API_URL}?action=${action}`;

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        } else if (data && method === 'GET') {
            const params = new URLSearchParams(data);
            url += '&' + params.toString();
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        alert('Błąd połączenia z serwerem: ' + error.message);
        throw error;
    } finally {
        hideLoading();
    }
}

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// ========================================
// CONFIGURATION
// ========================================

async function loadConfiguration() {
    try {
        const config = await apiCall('get_config');

        wykonawcaName = config.wykonawca;
        klienciData = config.klienci;
        bledyTemplates = config.bledy.map(b => ({ id: b.id, text: b.opis }));
        poprawkiTemplates = config.poprawki.map(p => ({ id: p.id, text: p.opis }));

        populateWykonawca();
        populateKlienci();

        document.getElementById('wykonawca-name').value = wykonawcaName;
    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
}

function populateWykonawca() {
    document.getElementById('wykonawca').value = wykonawcaName;
}

function populateKlienci() {
    const klientSelect = document.getElementById('klient');

    // Clear existing options except the first one
    while (klientSelect.options.length > 1) {
        klientSelect.remove(1);
    }

    // Add klienci options
    klienciData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nazwa;
        option.dataset.umowa = item.numer_umowy;
        klientSelect.appendChild(option);
    });
}

// ========================================
// EVENT LISTENERS
// ========================================

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
    document.getElementById('add-content-btn').addEventListener('click', () => addContentItem());

    // Save report
    document.getElementById('save-report-btn').addEventListener('click', saveReport);

    // Load report
    document.getElementById('load-report-btn').addEventListener('click', showLoadReportModal);

    // Export to PDF
    document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);

    // Manage config
    document.getElementById('manage-config-btn').addEventListener('click', showConfigModal);

    // Config modal tabs
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchConfigTab(tabName);
        });
    });

    // Close config modal
    document.getElementById('close-config-btn').addEventListener('click', () => {
        document.getElementById('config-modal').style.display = 'none';
    });

    // Close load modal
    document.getElementById('close-load-modal-btn').addEventListener('click', () => {
        document.getElementById('load-report-modal').style.display = 'none';
    });

    // Save wykonawca
    document.getElementById('save-wykonawca-btn').addEventListener('click', saveWykonawca);

    // Add buttons
    document.getElementById('add-klient-btn').addEventListener('click', () => addKlientPrompt());
    document.getElementById('add-blad-btn').addEventListener('click', () => addTemplatePrompt('blad'));
    document.getElementById('add-poprawka-btn').addEventListener('click', () => addTemplatePrompt('poprawka'));

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// ========================================
// CONFIG MODAL
// ========================================

function showConfigModal() {
    document.getElementById('config-modal').style.display = 'flex';
    loadConfigData();
}

function switchConfigTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.config-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Load data for the tab
    if (tabName === 'klienci') loadKlienciList();
    if (tabName === 'bledy') loadBledyList();
    if (tabName === 'poprawki') loadPoprawkiList();
}

async function saveWykonawca() {
    const nazwa = document.getElementById('wykonawca-name').value.trim();

    if (!nazwa) {
        alert('Nazwa wykonawcy nie może być pusta');
        return;
    }

    try {
        await apiCall('update_wykonawca', { nazwa }, 'POST');
        wykonawcaName = nazwa;
        populateWykonawca();
        alert('Wykonawca zaktualizowany');
    } catch (error) {
        console.error('Failed to save wykonawca:', error);
    }
}

async function loadConfigData() {
    await loadConfiguration();
}

function loadKlienciList() {
    const list = document.getElementById('klienci-list');
    list.innerHTML = '';

    if (klienciData.length === 0) {
        list.innerHTML = '<p class="empty-message">Brak klientów. Dodaj pierwszego klienta.</p>';
        return;
    }

    klienciData.forEach(klient => {
        const item = document.createElement('div');
        item.className = 'config-list-item';
        item.innerHTML = `
            <div class="config-item-content">
                <strong>${klient.nazwa}</strong>
                <span class="config-item-meta">Umowa: ${klient.numer_umowy}</span>
            </div>
            <div class="config-item-actions">
                <button class="btn btn-small btn-secondary" onclick="editKlient(${klient.id})">Edytuj</button>
                <button class="btn btn-small btn-danger" onclick="deleteKlientConfirm(${klient.id})">Usuń</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function loadBledyList() {
    const list = document.getElementById('bledy-list');
    list.innerHTML = '';

    if (bledyTemplates.length === 0) {
        list.innerHTML = '<p class="empty-message">Brak szablonów błędów.</p>';
        return;
    }

    bledyTemplates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'config-list-item';
        item.innerHTML = `
            <div class="config-item-content">
                <span>${template.text}</span>
            </div>
            <div class="config-item-actions">
                <button class="btn btn-small btn-danger" onclick="deleteTemplateConfirm(${template.id}, 'blad')">Usuń</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function loadPoprawkiList() {
    const list = document.getElementById('poprawki-list');
    list.innerHTML = '';

    if (poprawkiTemplates.length === 0) {
        list.innerHTML = '<p class="empty-message">Brak szablonów poprawek.</p>';
        return;
    }

    poprawkiTemplates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'config-list-item';
        item.innerHTML = `
            <div class="config-item-content">
                <span>${template.text}</span>
            </div>
            <div class="config-item-actions">
                <button class="btn btn-small btn-danger" onclick="deleteTemplateConfirm(${template.id}, 'poprawka')">Usuń</button>
            </div>
        `;
        list.appendChild(item);
    });
}

async function addKlientPrompt() {
    const nazwa = prompt('Nazwa klienta:');
    if (!nazwa) return;

    const numerUmowy = prompt('Numer umowy:');
    if (!numerUmowy) return;

    try {
        await apiCall('add_klient', { nazwa, numer_umowy: numerUmowy }, 'POST');
        await loadConfiguration();
        loadKlienciList();
        alert('Klient dodany');
    } catch (error) {
        console.error('Failed to add klient:', error);
    }
}

async function editKlient(id) {
    const klient = klienciData.find(k => k.id === id);
    if (!klient) return;

    const nazwa = prompt('Nazwa klienta:', klient.nazwa);
    if (!nazwa) return;

    const numerUmowy = prompt('Numer umowy:', klient.numer_umowy);
    if (!numerUmowy) return;

    try {
        await apiCall('update_klient', { id, nazwa, numer_umowy: numerUmowy }, 'POST');
        await loadConfiguration();
        loadKlienciList();
        alert('Klient zaktualizowany');
    } catch (error) {
        console.error('Failed to update klient:', error);
    }
}

async function deleteKlientConfirm(id) {
    if (!confirm('Czy na pewno chcesz usunąć tego klienta?')) return;

    try {
        await apiCall('delete_klient', { id }, 'POST');
        await loadConfiguration();
        loadKlienciList();
        alert('Klient usunięty');
    } catch (error) {
        console.error('Failed to delete klient:', error);
    }
}

async function addTemplatePrompt(type) {
    const opis = prompt(`Wpisz szablon ${type === 'blad' ? 'błędu' : 'poprawki'}:`);
    if (!opis) return;

    const action = type === 'blad' ? 'add_blad_template' : 'add_poprawka_template';

    try {
        await apiCall(action, { opis }, 'POST');
        await loadConfiguration();
        if (type === 'blad') {
            loadBledyList();
        } else {
            loadPoprawkiList();
        }
        alert('Szablon dodany');
    } catch (error) {
        console.error('Failed to add template:', error);
    }
}

async function deleteTemplateConfirm(id, type) {
    if (!confirm('Czy na pewno chcesz usunąć ten szablon?')) return;

    const action = type === 'blad' ? 'delete_blad_template' : 'delete_poprawka_template';

    try {
        await apiCall(action, { id }, 'POST');
        await loadConfiguration();
        if (type === 'blad') {
            loadBledyList();
        } else {
            loadPoprawkiList();
        }
        alert('Szablon usunięty');
    } catch (error) {
        console.error('Failed to delete template:', error);
    }
}

// ========================================
// CONTENT ITEMS
// ========================================

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
                    const timestamp = new Date().toLocaleString('pl-PL');
                    addScreenshotToContainer(screenshotsContainer, event.target.result, '', timestamp);
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

    // Populate template dropdowns
    const problemsSelect = actualContainer.querySelector('.problems-template-select');
    const fixesSelect = actualContainer.querySelector('.fixes-template-select');

    // Add bledy templates to problems dropdown
    if (bledyTemplates.length > 0) {
        bledyTemplates.forEach((template) => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.text.length > 80 ? template.text.substring(0, 80) + '...' : template.text;
            option.dataset.fullText = template.text;
            problemsSelect.appendChild(option);
        });
    } else {
        problemsSelect.disabled = true;
        problemsSelect.querySelector('option').textContent = '-- Brak szablonów błędów --';
    }

    // Add poprawki templates to fixes dropdown
    if (poprawkiTemplates.length > 0) {
        poprawkiTemplates.forEach((template) => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.text.length > 80 ? template.text.substring(0, 80) + '...' : template.text;
            option.dataset.fullText = template.text;
            fixesSelect.appendChild(option);
        });
    } else {
        fixesSelect.disabled = true;
        fixesSelect.querySelector('option').textContent = '-- Brak szablonów poprawek --';
    }

    // Setup insert template buttons
    const insertButtons = actualContainer.querySelectorAll('.btn-insert-template');
    insertButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            const select = target === 'problems' ? problemsSelect : fixesSelect;
            const editor = target === 'problems' ? problemsEditor : fixesEditor;

            const selectedOption = select.selectedOptions[0];
            if (selectedOption && selectedOption.value !== '') {
                const templateText = selectedOption.dataset.fullText;
                insertTemplateToEditor(editor, templateText);
                select.value = '';
            } else {
                alert('Wybierz szablon z listy');
            }
        });
    });

    // If data is provided, populate fields
    if (data) {
        actualContainer.querySelector('.content-type').value = data.typ_tresci || data.type || '';
        actualContainer.querySelector('.content-title').value = data.tytul || data.title || '';
        actualContainer.querySelector('.content-url').value = data.url || '';

        // Set Quill content (can be HTML or plain text)
        if (data.problemy || data.problems) {
            problemsEditor.root.innerHTML = data.problemy || data.problems;
        }
        if (data.poprawki || data.fixes) {
            fixesEditor.root.innerHTML = data.poprawki || data.fixes;
        }

        // Handle screenshots (multiple)
        if (data.screenshots && data.screenshots.length > 0) {
            const screenshotsContainer = actualContainer.querySelector('.screenshots-container');
            data.screenshots.forEach(screenshot => {
                addScreenshotToContainer(
                    screenshotsContainer,
                    screenshot.image_data || screenshot.image,
                    screenshot.opis || screenshot.description,
                    screenshot.upload_timestamp
                );
            });
        }
    }
}

function addScreenshotToContainer(container, imageSrc, description = '', uploadTimestamp = null) {
    const template = document.getElementById('screenshot-item-template');
    const clone = template.content.cloneNode(true);

    const screenshotItem = clone.querySelector('.screenshot-item');
    const img = clone.querySelector('.screenshot-preview img');
    const descriptionTextarea = clone.querySelector('.screenshot-description');
    const removeBtn = clone.querySelector('.btn-remove-screenshot-item');
    const timestampSpan = clone.querySelector('.screenshot-timestamp');

    img.src = imageSrc;
    descriptionTextarea.value = description;

    // Set timestamp
    if (uploadTimestamp) {
        const timestamp = typeof uploadTimestamp === 'string' ? uploadTimestamp : new Date(uploadTimestamp).toLocaleString('pl-PL');
        timestampSpan.textContent = `Dodano: ${timestamp}`;
        screenshotItem.dataset.timestamp = uploadTimestamp;
    } else {
        const now = new Date().toISOString();
        timestampSpan.textContent = `Dodano: ${new Date(now).toLocaleString('pl-PL')}`;
        screenshotItem.dataset.timestamp = now;
    }

    removeBtn.addEventListener('click', () => {
        screenshotItem.remove();
    });

    container.appendChild(clone);
}

function updateItemNumbers() {
    const items = document.querySelectorAll('.content-item');
    items.forEach((item, index) => {
        item.querySelector('.item-number').textContent = index + 1;
    });
    contentItemCounter = items.length;
}

function insertTemplateToEditor(editor, text) {
    const selection = editor.getSelection();
    const cursorPosition = selection ? selection.index : editor.getLength();

    const currentContent = editor.getText();
    const needsNewline = cursorPosition > 0 && currentContent.charAt(cursorPosition - 1) !== '\n';

    if (needsNewline) {
        editor.insertText(cursorPosition, '\n');
        editor.insertText(cursorPosition + 1, text);
    } else {
        editor.insertText(cursorPosition, text);
    }

    const newPosition = cursorPosition + (needsNewline ? 1 : 0) + text.length;
    editor.setSelection(newPosition, 0);

    editor.focus();
}

// ========================================
// SAVE/LOAD REPORTS
// ========================================

async function saveReport() {
    const klientId = parseInt(document.getElementById('klient').value);

    if (!klientId) {
        alert('Wybierz klienta');
        return;
    }

    const data = {
        id: currentReportId,
        monitoringDate: document.getElementById('monitoring-date').value,
        klientId: klientId,
        zakres: document.getElementById('zakres').value,
        okresOd: document.getElementById('okres-od').value,
        okresDo: document.getElementById('okres-do').value,
        contentItems: []
    };

    const items = document.querySelectorAll('.content-item');
    items.forEach(item => {
        const screenshots = [];
        const screenshotItems = item.querySelectorAll('.screenshot-item');
        screenshotItems.forEach(screenshotItem => {
            const img = screenshotItem.querySelector('.screenshot-preview img');
            const description = screenshotItem.querySelector('.screenshot-description').value;
            const timestamp = screenshotItem.dataset.timestamp || new Date().toISOString();

            if (img.src) {
                screenshots.push({
                    image: img.src,
                    description: description,
                    upload_timestamp: timestamp
                });
            }
        });

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

    try {
        const result = await apiCall('save_report', data, 'POST');
        currentReportId = result.id;
        document.getElementById('save-status-text').textContent = 'Zapisany (' + new Date().toLocaleTimeString() + ')';
        alert('Raport został zapisany');
    } catch (error) {
        console.error('Failed to save report:', error);
    }
}

async function showLoadReportModal() {
    try {
        const result = await apiCall('get_reports');
        const reports = result.reports;

        const list = document.getElementById('reports-list');
        list.innerHTML = '';

        if (reports.length === 0) {
            list.innerHTML = '<p class="empty-message">Brak zapisanych raportów</p>';
        } else {
            reports.forEach(report => {
                const item = document.createElement('div');
                item.className = 'report-list-item';
                item.innerHTML = `
                    <div class="report-item-content">
                        <strong>${report.klient_nazwa || 'Bez klienta'}</strong>
                        <span class="report-item-meta">Data: ${report.monitoring_date} | Utworzony: ${new Date(report.created_at).toLocaleString('pl-PL')}</span>
                    </div>
                    <div class="report-item-actions">
                        <button class="btn btn-small btn-primary" onclick="loadReportById(${report.id})">Wczytaj</button>
                        <button class="btn btn-small btn-danger" onclick="deleteReportConfirm(${report.id})">Usuń</button>
                    </div>
                `;
                list.appendChild(item);
            });
        }

        document.getElementById('load-report-modal').style.display = 'flex';
    } catch (error) {
        console.error('Failed to load reports:', error);
    }
}

async function loadReportById(id) {
    try {
        const result = await apiCall('get_report', { id });
        const report = result.report;

        // Clear current form
        document.getElementById('content-list').innerHTML = '';
        contentItemCounter = 0;
        currentReportId = report.id;

        // Populate form
        document.getElementById('monitoring-date').value = report.monitoring_date;
        document.getElementById('klient').value = report.klient_id;

        // Trigger change event to update zakres
        const changeEvent = new Event('change');
        document.getElementById('klient').dispatchEvent(changeEvent);

        document.getElementById('okres-od').value = report.okres_od;
        document.getElementById('okres-do').value = report.okres_do;

        // Add content items
        if (report.items && report.items.length > 0) {
            report.items.forEach(item => addContentItem(item));
        }

        document.getElementById('load-report-modal').style.display = 'none';
        document.getElementById('save-status-text').textContent = 'Wczytany raport';
        alert('Raport wczytany');
    } catch (error) {
        console.error('Failed to load report:', error);
    }
}

async function deleteReportConfirm(id) {
    if (!confirm('Czy na pewno chcesz usunąć ten raport?')) return;

    try {
        await apiCall('delete_report', { id }, 'POST');
        showLoadReportModal(); // Refresh the list
        alert('Raport usunięty');
    } catch (error) {
        console.error('Failed to delete report:', error);
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function fetchPageTitle(url, titleInput, button) {
    if (!url || !isValidUrl(url)) {
        alert('Wprowadź poprawny adres URL');
        return;
    }

    const originalText = button.textContent;
    button.textContent = '⏳';
    button.disabled = true;
    button.classList.add('loading');

    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl, {
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error('Nie udało się pobrać strony');
        }

        const data = await response.json();
        const html = data.contents;

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

        if (titleMatch && titleMatch[1]) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = titleMatch[1];
            const title = tempDiv.textContent.trim();

            titleInput.value = title;
        } else {
            alert('Nie znaleziono tytułu na stronie');
        }
    } catch (error) {
        console.error('Error fetching title:', error);
        alert('Nie udało się pobrać tytułu. Możesz wpisać tytuł ręcznie.\n\nPowód: ' + (error.message || 'Problem z połączeniem'));
    } finally {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('loading');
    }
}
