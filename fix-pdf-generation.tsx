// Fixed PDF generation function for BookingDetails
const handleDownloadReceipt = async () => {
  try {
    setIsDownloadingReceipt(true);

    // Get receipt HTML with proper error handling
    const response = await fetch(`http://localhost:3002/api/bookings/${booking._id}/receipt-test`);
    
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message || "Failed to generate receipt");
      return;
    }

    const htmlContent = await response.text();
    console.log('📄 Received HTML content length:', htmlContent.length);

    if (htmlContent.length < 50 || !htmlContent.includes('<')) {
      toast.error("Invalid receipt content received");
      return;
    }

    try {
      // Dynamic imports for PDF libraries
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Create visible container for rendering
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 800px;
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        color: #000;
        padding: 20px;
        z-index: 9999;
        visibility: visible;
      `;
      
      document.body.appendChild(tempDiv);

      // Force all elements to be visible
      tempDiv.querySelectorAll('*').forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.color = '#000';
          el.style.visibility = 'visible';
          el.style.opacity = '1';
        }
      });

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: true
      });

      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas generation failed - no content captured');
      }

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Save PDF
      const fileName = `BoxCric-Receipt-${booking.bookingId || booking._id}.pdf`;
      pdf.save(fileName);
      
      toast.success("Receipt PDF downloaded successfully!");

      // Cleanup
      document.body.removeChild(tempDiv);

    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      toast.error("PDF generation failed. Opening receipt in new tab.");
      
      // Fallback: open in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
    }

  } catch (error) {
    console.error("Receipt download error:", error);
    toast.error("Failed to download receipt. Please try again.");
  } finally {
    setIsDownloadingReceipt(false);
  }
};
