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

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Adres URL:</strong></p>
                <p style="margin: 5px 0 8px 20px; word-wrap: break-word; overflow-wrap: break-word; font-size: 10pt;">${escapeHtml(item.url)}</p>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Zidentyfikowane problemy:</strong></p>
                <p style="margin: 5px 0 8px 20px; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(item.problems)}</p>

                <p style="margin: 8px 0; margin-left: 10px;"><strong>Wprowadzone poprawki:</strong></p>
                <p style="margin: 5px 0 8px 20px; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(item.fixes)}</p>
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

        // Create temporary element that is visible for rendering
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.position = 'fixed';
        tempDiv.style.top = '0';
        tempDiv.style.left = '0';
        tempDiv.style.width = '210mm';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.zIndex = '10000';
        tempDiv.style.overflow = 'auto';
        tempDiv.style.maxHeight = '100vh';
        tempDiv.style.padding = '20px';

        document.body.appendChild(tempDiv);

        // Wait for all images to load
        const images = tempDiv.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            if (img.complete) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = resolve; // Resolve anyway to not block PDF generation
                // Timeout after 5 seconds
                setTimeout(resolve, 5000);
            });
        });

        await Promise.all(imagePromises);

        // Additional wait for fonts and rendering
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get current timestamp for filename
        const now = new Date();
        const pdfTimestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `raport_${pdfTimestamp}.pdf`;

        // Configure PDF options
        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                letterRendering: true,
                logging: true,
                windowWidth: 794  // A4 width in pixels at 96 DPI
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        // Generate PDF from the visible element
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
