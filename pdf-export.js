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

    let html = `
        <div style="font-family: Arial, sans-serif; font-size: 11pt; padding: 20px; max-width: 700px; margin: 0 auto; position: relative;">
            <!-- Watermark -->
            <div style="position: fixed; left: 5px; top: 50%; transform: translateY(-50%) rotate(-90deg); font-size: 10pt; color: #ccc; font-weight: bold; transform-origin: center;">
                ${wykonawcaName}
            </div>

            <!-- Timestamp -->
            <div style="position: fixed; bottom: 10px; right: 20px; font-size: 8pt; color: #666;">
                ${timestamp}
            </div>

            <!-- Title -->
            <h1 style="text-align: center; color: #667eea; font-size: 18pt; margin-bottom: 20px;">
                Monitoring strony - ${currentDate}
            </h1>

            <!-- Basic Info -->
            <div style="margin-bottom: 20px; line-height: 1.8;">
                <p style="margin: 5px 0;"><strong>Data monitoringu:</strong> ${formData.monitoringDate}</p>
                <p style="margin: 5px 0;"><strong>Wykonawca:</strong> ${formData.wykonawca}</p>
                <p style="margin: 5px 0;"><strong>Klient:</strong> ${formData.klient}</p>
                <p style="margin: 5px 0;"><strong>Zakres raportu:</strong> ${formData.zakres}</p>
                <p style="margin: 5px 0;"><strong>Okres monitoringu:</strong> ${formData.okresOd} do ${formData.okresDo}</p>
            </div>

            <!-- Content Items -->
            <h2 style="color: #764ba2; font-size: 16pt; margin-top: 30px; margin-bottom: 15px;">Lista zweryfikowanych treści</h2>
    `;

    // Add each content item
    formData.contentItems.forEach((item, index) => {
        html += `
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
                <h3 style="color: #555; font-size: 13pt; margin-bottom: 10px;">Element ${index + 1}</h3>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Typ treści:</strong> ${item.type}</p>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Adres URL:</strong></p>
                <p style="margin: 5px 0 8px 20px; word-wrap: break-word; overflow-wrap: break-word;">${item.url}</p>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Zidentyfikowane problemy:</strong></p>
                <p style="margin: 5px 0 8px 20px; white-space: pre-wrap; word-wrap: break-word;">${item.problems}</p>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Wprowadzone poprawki:</strong></p>
                <p style="margin: 5px 0 8px 20px; white-space: pre-wrap; word-wrap: break-word;">${item.fixes}</p>
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
                    html += `<p style="margin: 5px 0; font-style: italic; color: #555; white-space: pre-wrap; word-wrap: break-word;">${screenshot.description}</p>`;
                }

                html += `<img src="${screenshot.image}" style="max-width: 100%; height: auto; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px;" />`;
                html += `</div>`;
            });
        }

        html += `</div>`;
    });

    html += `</div>`;

    return html;
}

// Export to PDF
async function exportToPDF() {
    if (!window.html2pdf) {
        alert('Biblioteka html2pdf nie została załadowana!');
        return;
    }

    // Show loading message
    const originalText = document.getElementById('export-pdf-btn').textContent;
    document.getElementById('export-pdf-btn').textContent = '⏳ Generowanie PDF...';
    document.getElementById('export-pdf-btn').disabled = true;

    try {
        const htmlContent = createPDFContent();

        // Create temporary element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        // Get current timestamp for filename
        const now = new Date();
        const pdfTimestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `raport_${pdfTimestamp}.pdf`;

        // Configure PDF options
        const opt = {
            margin: [15, 10, 15, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        // Generate PDF
        await html2pdf().set(opt).from(tempDiv).save();

        // Remove temporary element
        document.body.removeChild(tempDiv);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Wystąpił błąd podczas generowania PDF!');
    } finally {
        // Restore button
        document.getElementById('export-pdf-btn').textContent = originalText;
        document.getElementById('export-pdf-btn').disabled = false;
    }
}
