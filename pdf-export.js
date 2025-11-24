// Create HTML content for PDF
function createPDFContent() {
    const formData = collectFormData();
    const now = new Date();
    const timestamp = now.toLocaleString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const currentDate = document.getElementById('current-date').textContent;

    // Helper function to escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    let html = `
        <div style="font-family: Arial, sans-serif; font-size: 11pt; padding: 20px; max-width: 700px; margin: 0 auto; position: relative;">
            <!-- Header with watermark and timestamp -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 8pt; color: #999;">
                <div>${escapeHtml(wykonawcaName)}</div>
                <div>${timestamp}</div>
            </div>

            <!-- Title -->
            <h1 style="text-align: center; color: #667eea; font-size: 18pt; margin-bottom: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                Monitoring strony - ${currentDate}
            </h1>

            <!-- Basic Info -->
            <div style="margin-bottom: 20px; line-height: 1.8; background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                <p style="margin: 5px 0;"><strong>Data monitoringu:</strong> ${escapeHtml(formData.monitoringDate)}</p>
                <p style="margin: 5px 0;"><strong>Wykonawca:</strong> ${escapeHtml(formData.wykonawca)}</p>
                <p style="margin: 5px 0;"><strong>Klient:</strong> ${escapeHtml(formData.klient)}</p>
                <p style="margin: 5px 0;"><strong>Zakres raportu:</strong> ${escapeHtml(formData.zakres)}</p>
                <p style="margin: 5px 0;"><strong>Okres monitoringu:</strong> ${escapeHtml(formData.okresOd)} do ${escapeHtml(formData.okresDo)}</p>
            </div>

            <!-- Content Items -->
            <h2 style="color: #764ba2; font-size: 16pt; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #764ba2; padding-bottom: 5px;">Lista zweryfikowanych treści</h2>
    `;

    // Add each content item
    formData.contentItems.forEach((item, index) => {
        html += `
            <div style="margin-bottom: 30px; page-break-inside: avoid; border: 1px solid #ddd; padding: 15px; border-radius: 5px; background-color: #fff;">
                <h3 style="color: #555; font-size: 13pt; margin-bottom: 10px; margin-top: 0;">Element ${index + 1}</h3>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Typ treści:</strong> ${escapeHtml(item.type)}</p>

                ${item.title ? `<p style="margin: 8px 0; margin-left: 10px;"><strong>Tytuł:</strong> ${escapeHtml(item.title)}</p>` : ''}

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Adres URL:</strong></p>
                <p style="margin: 5px 0 8px 20px; word-wrap: break-word; overflow-wrap: break-word; font-size: 10pt;">${escapeHtml(item.url)}</p>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Zidentyfikowane problemy:</strong></p>
                <div style="margin: 5px 0 8px 20px; word-wrap: break-word; line-height: 1.6;">${item.problems}</div>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Wprowadzone poprawki:</strong></p>
                <div style="margin: 5px 0 8px 20px; word-wrap: break-word; line-height: 1.6;">${item.fixes}</div>
        `;

        // Add screenshots
        if (item.screenshots && item.screenshots.length > 0) {
            html += `<p style="margin: 8px 0; margin-left: 10px;"><strong>Zdjęcia:</strong></p>`;

            item.screenshots.forEach((screenshot, screenshotIndex) => {
                html += `<div style="margin: 15px 0 15px 20px; page-break-inside: avoid;">`;

                if (item.screenshots.length > 1) {
                    html += `<p style="margin: 5px 0; font-weight: bold; font-size: 10pt;">Zdjęcie ${screenshotIndex + 1}:</p>`;
                }

                if (screenshot.description && screenshot.description.trim()) {
                    html += `<p style="margin: 5px 0; font-style: italic; color: #555; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(screenshot.description)}</p>`;
                }

                if (screenshot.image) {
                    html += `<img src="${screenshot.image}" style="max-width: 100%; height: auto; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;" />`;
                }
                html += `</div>`;
            });
        }

        html += `</div>`;
    });

    html += `</div>`;

    return html;
}

// Export to PDF - using print preview
async function exportToPDF() {
    try {
        const htmlContent = createPDFContent();

        // Create print styles
        const printStyles = `
            <style>
                @page {
                    size: A4;
                    margin: 10mm;
                }

                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }

                /* Quill content styles */
                strong {
                    font-weight: bold;
                }

                em {
                    font-style: italic;
                }

                u {
                    text-decoration: underline;
                }

                ul, ol {
                    margin: 10px 0;
                    padding-left: 30px;
                }

                li {
                    margin: 5px 0;
                }

                pre {
                    background-color: #f4f4f4;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    padding: 10px;
                    overflow-x: auto;
                    margin: 10px 0;
                    font-family: 'Courier New', monospace;
                    font-size: 11pt;
                }

                code {
                    background-color: #f4f4f4;
                    padding: 2px 5px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                }

                a {
                    color: #667eea;
                    text-decoration: underline;
                }

                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .no-print {
                        display: none !important;
                    }

                    * {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    pre, code {
                        background-color: #f4f4f4 !important;
                    }
                }
            </style>
        `;

        // Open new window for print preview
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (!printWindow) {
            alert('Zablokowano wyskakujące okno! Pozwól na wyskakujące okna dla tej strony.');
            return;
        }

        // Write content to new window
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Raport - Podgląd wydruku</title>
                ${printStyles}
            </head>
            <body>
                ${htmlContent}

                <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: white; padding: 10px; border: 2px solid #667eea; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 10001;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #667eea;">Podgląd raportu</p>
                    <button onclick="window.print()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; margin-bottom: 5px; width: 100%;">
                        🖨️ Zapisz jako PDF
                    </button>
                    <button onclick="window.close()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; width: 100%;">
                        ✕ Zamknij
                    </button>
                    <p style="margin: 10px 0 0 0; font-size: 11px; color: #666;">
                        Wybierz "Zapisz jako PDF" w oknie drukowania
                    </p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();

        // Wait for images to load before focusing
        printWindow.onload = () => {
            // Wait a bit for rendering
            setTimeout(() => {
                printWindow.focus();
            }, 500);
        };

    } catch (error) {
        console.error('Error generating preview:', error);
        alert('Wystąpił błąd podczas generowania podglądu!');
    }
}
