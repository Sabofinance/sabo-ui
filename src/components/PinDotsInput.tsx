import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  label?: string;
  autoFocus?: boolean;
};

const PIN_REGEX = /^\d{6}$/;

const PinDotsInput: React.FC<Props> = ({ value, onChange, disabled, label, autoFocus }) => {
  const digits = useMemo(() => {
    const normalized = (value || "").replace(/\D/g, "").slice(0, 6);
    return Array.from({ length: 6 }, (_, i) => normalized[i] || "");
  }, [value]);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const firstFocusDoneRef = useRef(false);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    if (firstFocusDoneRef.current) return;
    firstFocusDoneRef.current = true;
    inputsRef.current[0]?.focus();
  }, [autoFocus, disabled]);

  const setDigit = (idx: number, digit: string) => {
    const nextDigits = [...digits];
    nextDigits[idx] = digit ? digit.slice(-1) : "";
    const next = nextDigits.join("");
    onChange(next);
  };

  const handlePasteBlock = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleChange = (idx: number, raw: string) => {
    if (disabled) return;
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(idx, digit);
    if (digit && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  return (
    <div>
      {label && <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", marginBottom: 8 }}>{label}</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {digits.map((d, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            value={d}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            onPaste={handlePasteBlock}
            onCopy={(e) => e.preventDefault()}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            aria-label={`PIN digit ${idx + 1}`}
            style={{
              width: 44,
              height: 52,
              textAlign: "center",
              fontSize: 18,
              fontWeight: 800,
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              outline: "none",
              opacity: disabled ? 0.6 : 1,
            }}
          />
        ))}
      </div>
      {value && value.replace(/\D/g, "").length === 6 && !PIN_REGEX.test(value) && (
        <div style={{ marginTop: 8, color: "#b91c1c", fontWeight: 700, fontSize: 12 }}>
          PIN must be exactly 6 digits.
        </div>
      )}
    </div>
  );
};

export default PinDotsInput;

