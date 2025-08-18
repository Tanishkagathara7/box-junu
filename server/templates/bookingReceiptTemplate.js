// Booking receipt email template
export const generateBookingReceiptHTML = (booking, user) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const ground = booking.groundId || booking.ground || {};
  const playerDetails = booking.playerDetails || {};
  const contactPerson = playerDetails.contactPerson || {};
  const pricing = booking.pricing || {};
  const timeSlot = booking.timeSlot || {};

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BoxCric - Booking Receipt</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fafc;
        }
        .container { 
          max-width: 650px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%); 
          padding: 30px; 
          text-align: center; 
          color: white;
        }
        .logo { 
          font-size: 32px; 
          font-weight: bold; 
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .tagline { 
          font-size: 16px; 
          opacity: 0.9; 
          margin-bottom: 20px;
        }
        .receipt-title {
          background: rgba(255,255,255,0.2);
          padding: 15px 25px;
          border-radius: 8px;
          font-size: 20px;
          font-weight: 600;
        }
        .content { padding: 30px; }
        .booking-id {
          text-align: center;
          background: #f0fdf4;
          border: 2px solid #22c55e;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .booking-id-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .booking-id-value {
          font-size: 24px;
          font-weight: bold;
          color: #22c55e;
          letter-spacing: 2px;
        }
        .section {
          margin-bottom: 25px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .section:last-child { border-bottom: none; }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        .section-icon {
          margin-right: 10px;
          font-size: 20px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #22c55e;
        }
        .info-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .full-width { grid-column: 1 / -1; }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-confirmed {
          background: #dcfce7;
          color: #166534;
        }
        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }
        .pricing-summary {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }
        .pricing-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }
        .pricing-total {
          border-top: 2px solid #22c55e;
          padding-top: 15px;
          margin-top: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #22c55e;
        }
        .footer {
          background: #f9fafb;
          padding: 25px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer-text {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 15px;
        }
        .contact-info {
          color: #4b5563;
          font-size: 13px;
        }
        .qr-placeholder {
          width: 80px;
          height: 80px;
          background: #e5e7eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          color: #6b7280;
          font-size: 12px;
        }
        @media (max-width: 600px) {
          .container { margin: 10px; }
          .content { padding: 20px; }
          .info-grid { grid-template-columns: 1fr; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏏 BoxCric</div>
          <div class="tagline">Book. Play. Win.</div>
          <div class="receipt-title">✅ Booking Confirmed</div>
        </div>
        
        <div class="content">
          <div class="booking-id">
            <div class="booking-id-label">Booking ID</div>
            <div class="booking-id-value">${booking.bookingId || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">
              <span class="section-icon">🏟️</span>
              Venue Details
            </div>
            <div class="info-grid">
              <div class="info-item full-width">
                <div class="info-label">Ground Name</div>
                <div class="info-value">${ground.name || 'Ground details unavailable'}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Address</div>
                <div class="info-value">${ground.location?.address || 'Address not available'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">City</div>
                <div class="info-value">${ground.location?.cityName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Pitch Type</div>
                <div class="info-value">${ground.features?.pitchType || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              <span class="section-icon">📅</span>
              Booking Details
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${formatDate(booking.bookingDate)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Time Slot</div>
                <div class="info-value">${timeSlot.startTime && timeSlot.endTime ? `${formatTime(timeSlot.startTime)} - ${formatTime(timeSlot.endTime)}` : 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Duration</div>
                <div class="info-value">${timeSlot.duration || 'N/A'} hour(s)</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge ${booking.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}">
                    ${booking.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              <span class="section-icon">👥</span>
              Team Details
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Team Name</div>
                <div class="info-value">${playerDetails.teamName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Players</div>
                <div class="info-value">${playerDetails.playerCount || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Contact Person</div>
                <div class="info-value">${contactPerson.name || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${contactPerson.phone || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              <span class="section-icon">💰</span>
              Payment Summary
            </div>
            <div class="pricing-summary">
              <div class="pricing-row">
                <span>Base Amount:</span>
                <span>₹${pricing.baseAmount || 0}</span>
              </div>
              <div class="pricing-row">
                <span>Discount:</span>
                <span>-₹${pricing.discount || 0}</span>
              </div>
              <div class="pricing-row">
                <span>Taxes & Fees:</span>
                <span>₹${pricing.taxes || 0}</span>
              </div>
              <div class="pricing-row pricing-total">
                <span>Total Amount:</span>
                <span>₹${pricing.totalAmount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="qr-placeholder">QR Code</div>
          <div class="footer-text">
            Thank you for choosing BoxCric! Show this receipt at the venue.
          </div>
          <div class="contact-info">
            📧 support@boxcric.com | 📞 +91-XXXX-XXXX-XX<br>
            🌐 www.boxcric.com
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
