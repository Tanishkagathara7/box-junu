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

  useEffect(() => {
    // Cashfree appends status in query or hash, e.g. ?txStatus=SUCCESS/FAILED/CANCELLED
    const txStatus = getQueryParam(location.search, "txStatus") || getQueryParam(location.hash, "txStatus");
    setStatus(txStatus);

    if (txStatus === "SUCCESS") {
      toast.success("Payment successful! Your booking is confirmed.");
      setTimeout(() => navigate("/profile/bookings"), 2000);
    } else if (txStatus === "FAILED" || txStatus === "CANCELLED") {
      toast.error("Payment failed or cancelled. Returning to home page.");
      setTimeout(() => navigate("/"), 2500);
    }
  }, [location, navigate]);

  return (
    <div style={{ maxWidth: 400, margin: "60px auto", padding: 32, border: "1px solid #eee", borderRadius: 12, textAlign: "center" }}>
      <h2>Payment Status</h2>
      {status === "SUCCESS" && <p style={{ color: "green" }}>Payment successful! Redirecting to your bookings...</p>}
      {(status === "FAILED" || status === "CANCELLED") && <p style={{ color: "red" }}>Payment failed or cancelled. Redirecting to home...</p>}
      {!status && <p>Processing payment status...</p>}
    </div>
  );
};

export default PaymentCallback;
