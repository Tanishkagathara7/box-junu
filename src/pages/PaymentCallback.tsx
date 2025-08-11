
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

function getQueryParam(search: string, key: string) {
  const params = new URLSearchParams(search);
  return params.get(key);
}

const PaymentCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get status from query/hash (Cashfree appends txStatus)
    let txStatus = getQueryParam(location.search, "txStatus") || getQueryParam(location.hash, "txStatus");
    if (txStatus) {
      setStatus(txStatus);
      setLoading(false);
      return;
    }
    // If not present, try to fetch from backend using booking_id
    const bookingId = getQueryParam(location.search, "booking_id");
    if (!bookingId) {
      setError("No booking ID found in callback URL.");
      setLoading(false);
      return;
    }
    fetch(`/api/bookings/${bookingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.booking) {
          const paymentStatus = data.booking.payment?.status || data.booking.status;
          setStatus(paymentStatus?.toUpperCase() || null);
          setLoading(false);
        } else {
          // fallback: try to fetch from Cashfree directly
          fetch(`/api/payments/status/${bookingId}`)
            .then(res2 => res2.json())
            .then(data2 => {
              if (data2.success && data2.status) {
                setStatus(data2.status?.toUpperCase() || null);
              } else {
                setError("Could not fetch booking/payment status.");
              }
            })
            .catch(() => setError("Could not fetch booking/payment status."))
            .finally(() => setLoading(false));
        }
      })
      .catch(() => {
        // fallback: try to fetch from Cashfree directly
        fetch(`/api/payments/status/${bookingId}`)
          .then(res2 => res2.json())
          .then(data2 => {
            if (data2.success && data2.status) {
              setStatus(data2.status?.toUpperCase() || null);
            } else {
              setError("Could not fetch booking/payment status.");
            }
          })
          .catch(() => setError("Could not fetch booking/payment status."))
          .finally(() => setLoading(false));
      });
  }, [location]);

  useEffect(() => {
    if (!status) return;
    if (["SUCCESS", "COMPLETED", "PAID", "CONFIRMED"].includes(status)) {
      toast.success("Payment successful! Your booking is confirmed.");
      setTimeout(() => navigate("/profile/bookings"), 3500);
    } else if (["FAILED", "CANCELLED", "EXPIRED"].includes(status)) {
      toast.error("Payment failed or cancelled. Returning to home page.");
      setTimeout(() => navigate("/"), 3500);
    }
  }, [status, navigate]);

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: 32, border: "1px solid #eee", borderRadius: 12, textAlign: "center", background: "#fff" }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>Payment Status</h2>
      {loading && <p>Processing payment status...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && status && (
        <>
          {(["SUCCESS", "COMPLETED", "PAID", "CONFIRMED"].includes(status)) && (
            <>
              <div style={{ fontSize: 48, color: "#16a34a", marginBottom: 12 }}>✔️</div>
              <p style={{ color: "#16a34a", fontWeight: 600, fontSize: 20 }}>Payment Successful!</p>
              <p style={{ color: "#444", marginTop: 8 }}>Your booking is confirmed. Redirecting to your bookings...</p>
            </>
          )}
          {(["FAILED", "CANCELLED", "EXPIRED"].includes(status)) && (
            <>
              <div style={{ fontSize: 48, color: "#dc2626", marginBottom: 12 }}>❌</div>
              <p style={{ color: "#dc2626", fontWeight: 600, fontSize: 20 }}>Payment Failed or Cancelled</p>
              <p style={{ color: "#444", marginTop: 8 }}>Please try again. Redirecting to home...</p>
            </>
          )}
          {(!["SUCCESS", "COMPLETED", "PAID", "CONFIRMED", "FAILED", "CANCELLED", "EXPIRED"].includes(status)) && (
            <>
              <div style={{ fontSize: 48, color: "#f59e42", marginBottom: 12 }}>⏳</div>
              <p style={{ color: "#f59e42", fontWeight: 600, fontSize: 20 }}>Payment Status: {status}</p>
              <p style={{ color: "#444", marginTop: 8 }}>Please check your bookings for the latest status.</p>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentCallback;
