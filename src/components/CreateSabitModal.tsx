import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sabitsApi } from "../lib/api";
import { toast } from "react-toastify";

interface CreateSabitModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: {
    id: string | number;
    type: "SELL" | "BUY";
    currency: string;
    amount: number | string;
    rate: number | string;
  };
}

const S = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(13,31,30,0.55)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  card: {
    background: "#f5f9f8",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 24px 64px rgba(13,31,30,0.18)",
    overflow: "hidden",
    position: "relative" as const,
  },
  header: {
    background: "#0d1f1e",
    padding: "28px 28px 24px",
  },
  accentBar: {
    width: "36px",
    height: "4px",
    background: "#C8F135",
    borderRadius: "2px",
    marginBottom: "14px",
  },
  headerTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#ffffff",
    margin: 0,
  },
  closeBtn: {
    position: "absolute" as const,
    top: "20px",
    right: "20px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "1px solid rgba(176,204,201,0.25)",
    background: "rgba(176,204,201,0.1)",
    color: "#b0ccc9",
    cursor: "pointer",
  },
  body: {
    padding: "24px 28px 28px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    color: "#7a9c99",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "2px solid #dde8e6",
    background: "#ffffff",
    fontSize: "16px",
    fontWeight: 600,
    color: "#0d1f1e",
    marginBottom: "16px",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "2px solid #dde8e6",
    background: "#ffffff",
    fontSize: "16px",
    fontWeight: 600,
    color: "#0d1f1e",
    marginBottom: "16px",
    outline: "none",
    cursor: "pointer",
  },
  submitBtn: (disabled: boolean) => ({
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    background: disabled ? "#dde8e6" : "#C8F135",
    color: "#0d1f1e",
    fontSize: "15px",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
  }),
};

const CreateSabitModal: React.FC<CreateSabitModalProps> = ({ onClose, onSuccess, editData }) => {
  const navigate = useNavigate();
  const [type, setType] = useState<"sell" | "buy">(editData?.type.toLowerCase() as any || "sell");
  const [currency, setCurrency] = useState(editData?.currency || "GBP");
  const [amount, setAmount] = useState(editData?.amount?.toString() || "");
  const [rate, setRate] = useState(editData?.rate?.toString() || "");
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !rate) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: type.toUpperCase(),
        currency: currency.toUpperCase(),
        amount: String(amount),
        rate_ngn: String(rate),
      };

      const res = editData 
        ? await sabitsApi.update(editData.id, payload)
        : await sabitsApi.create(payload);

      if (res.success) {
        const id = (res.data as any)?.id || editData?.id;
        toast.success(editData ? "Listing updated successfully!" : "Listing created successfully!");
        if (!editData && id) {
          setSuccessId(id);
        } else {
          onSuccess();
        }
      } else {
        toast.error(res.error?.message || "Failed to process listing.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div style={S.overlay} onClick={onClose}>
        <div style={S.card} onClick={(e) => e.stopPropagation()}>
          <div style={S.header}>
            <div style={S.accentBar} />
            <h2 style={S.headerTitle}>Listing Created!</h2>
            <button style={S.closeBtn} onClick={onClose}>×</button>
          </div>
          <div style={{ ...S.body, textAlign: 'center' }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: '50%', background: '#C8F135', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 20px' 
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d1f1e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p style={{ color: '#0d1f1e', fontWeight: 600, fontSize: 16, marginBottom: 24 }}>
              Your listing has been successfully posted to the marketplace.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                style={{ ...S.submitBtn(false), background: '#0d1f1e', color: '#fff' }}
                onClick={() => {
                  onSuccess();
                  navigate('/dashboard/active-sabits');
                }}
              >
                View Listing
              </button>
              <button 
                style={{ ...S.submitBtn(false), background: 'transparent', border: '2px solid #dde8e6' }}
                onClick={onSuccess}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        <div style={S.header}>
          <div style={S.accentBar} />
          <h2 style={S.headerTitle}>{editData ? "Edit Listing" : "Create New Listing"}</h2>
          <button style={S.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={S.body}>
          <form onSubmit={handleSubmit}>
            <label style={S.label}>Type</label>
            <select style={S.select} value={type} onChange={(e) => setType(e.target.value as "sell" | "buy")}>
              <option value="sell">Sell</option>
              <option value="buy">Buy</option>
            </select>

            <label style={S.label}>Currency</label>
            <select style={S.select} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="GBP">GBP - British Pound</option>
              <option value="USD">USD - US Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>

            <label style={S.label}>Amount</label>
            <input
              style={S.input}
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="any"
            />

            <label style={S.label}>Rate (₦ per unit)</label>
            <input
              style={S.input}
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="0.00"
              step="any"
            />

            <button type="submit" style={S.submitBtn(submitting)} disabled={submitting}>
              {submitting ? (editData ? "Updating..." : "Creating...") : (editData ? "Update Listing" : "Create Listing")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSabitModal;