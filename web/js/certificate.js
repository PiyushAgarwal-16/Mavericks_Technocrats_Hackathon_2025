document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('certificate-form');
    const previewCard = document.getElementById('certificate-preview');
    const downloadBtn = document.getElementById('download-pdf-btn');
    
    // Generate a random Certificate ID on load
    const certIdInput = document.getElementById('cert-id');
    if (certIdInput) {
        certIdInput.value = 'ZT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Handle Form Submission (Preview Generation)
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get values
            const deviceName = document.getElementById('device-name').value;
            const imei = document.getElementById('imei').value;
            const date = new Date().toLocaleDateString();
            const certId = document.getElementById('cert-id').value;
            
            // Update Preview
            document.getElementById('preview-device').textContent = deviceName;
            document.getElementById('preview-imei').textContent = imei;
            document.getElementById('preview-date').textContent = date;
            document.getElementById('preview-id').textContent = certId;
            
            // Generate QR Code
            const qrContainer = document.getElementById('qrcode');
            qrContainer.innerHTML = ''; // Clear previous
            new QRCode(qrContainer, {
                text: `https://zerotrace.com/verify/${certId}`,
                width: 100,
                height: 100,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            
            // Show Preview Section
            previewCard.classList.remove('hidden');
            previewCard.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Handle PDF Download
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const deviceName = document.getElementById('preview-device').textContent;
            const imei = document.getElementById('preview-imei').textContent;
            const certId = document.getElementById('preview-id').textContent;
            const date = document.getElementById('preview-date').textContent;

            // Add Design Elements to PDF
            doc.setFillColor(11, 94, 215); // Primary Blue
            doc.rect(0, 0, 210, 20, 'F'); // Header Bar
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('ZeroTrace Certificate of Erasure', 105, 13, { align: 'center' });
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            
            doc.text('This document certifies that the data on the device listed below', 105, 40, { align: 'center' });
            doc.text('has been permanently erased in accordance with NIST 800-88 standards.', 105, 46, { align: 'center' });
            
            // Details Box
            doc.setDrawColor(200, 200, 200);
            doc.rect(30, 60, 150, 80);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Certificate ID:', 40, 75);
            doc.setFont('helvetica', 'normal');
            doc.text(certId, 90, 75);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Device Model:', 40, 90);
            doc.setFont('helvetica', 'normal');
            doc.text(deviceName, 90, 90);
            
            doc.setFont('helvetica', 'bold');
            doc.text('IMEI / Serial:', 40, 105);
            doc.setFont('helvetica', 'normal');
            doc.text(imei, 90, 105);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Erasure Date:', 40, 120);
            doc.setFont('helvetica', 'normal');
            doc.text(date, 90, 120);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Method:', 40, 135);
            doc.setFont('helvetica', 'normal');
            doc.text('NIST 800-88 Purge (3-Pass)', 90, 135);
            
            // Footer
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text('ZeroTrace Inc. - Secure Data Wiping Solutions', 105, 280, { align: 'center' });
            
            // Save
            doc.save(`ZeroTrace_Certificate_${certId}.pdf`);
        });
    }
});
