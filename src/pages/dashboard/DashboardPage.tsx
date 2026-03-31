import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellModal from "../../components/SellModal";
import DepositModal from "../../components/DepositModal";
import { type ActivityChartPoint } from "../../components/ActivityChart";
import LedgerVolumeAreaChart from "../../components/LedgerVolumeAreaChart";
import DepositsWithdrawalsBarChart, {
  type DepositsWithdrawalsPoint,
} from "../../components/DepositsWithdrawalsBarChart";
import ConversionsTrendBarChart, {
  type ConversionTrendPoint,
} from "../../components/ConversionsTrendBarChart";
import WalletBalancesBarChart, {
  type WalletBarPoint,
} from "../../components/WalletBalancesBarChart";
import TransactionHistory, {
  type TransactionItem,
} from "../../components/TransactionHistory";
import {
  conversionsApi,
  depositsApi,
  ledgerApi,
  ratesApi,
  sabitsApi,
  withdrawalsApi,
  walletsApi,
} from "../../lib/api";
import { extractArray } from "../../lib/api/response";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

/* ─── Types ──────────────────────────────────────────────── */
type WalletView = {
  id: string;
  currency: string;
  balance: number;
  locked: number;
  symbol: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  income: number;
  outcome: number;
  limit: number;
};
type SellerView = {
  id: number;
  name: string;
  avatar: string;
  amount: number;
  currency: string;
  rate: number;
  rating: number;
  completed: number;
  type: "buy" | "sell";
};

/* ─── Constants ──────────────────────────────────────────── */
const FLAG_URLS: Record<string, string> = {
  NGN: "https://flagcdn.com/w80/ng.png",
  GBP: "https://flagcdn.com/w80/gb.png",
  USD: "https://flagcdn.com/w80/us.png",
  EUR: "https://flagcdn.com/w80/eu.png",
  CAD: "https://flagcdn.com/w80/ca.png",
};

const WALLET_META: Record<
  string,
  { bg: string; iconBg: string; iconColor: string; label: string }
> = {
  NGN: {
    bg: "#f0fdf4",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    label: "Nigerian Naira",
  },
  GBP: {
    bg: "#eff6ff",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    label: "British Pound",
  },
  USD: {
    bg: "#f0fdf4",
    iconBg: "#dcfce7",
    iconColor: "#059669",
    label: "US Dollar",
  },
  CAD: {
    bg: "#fff7ed",
    iconBg: "#ffedd5",
    iconColor: "#ea580c",
    label: "Canadian Dollar",
  },
};

const fmt = (n: number) => new Intl.NumberFormat("en-NG").format(n);
const currSym = (c: string) =>
  ({ NGN: "₦", USD: "$", GBP: "£", CAD: "CA$" })[c] ?? "";

/* ─── Global CSS ─────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dp-root {
    --lime: #c8f135;
    --lime-dark: #8aae00;
    --lime-bg: #f4fcd4;
    --dark-card: #0d1f1a;
    --dark-card-2: #1a2e25;
    --surface: #ffffff;
    --surface-2: #f6f7f9;
    --surface-3: #eef0f4;
    --border: #e8ecf1;
    --border-strong: #d4d9e3;
    --text-primary: #0d1321;
    --text-secondary: #5c6478;
    --text-muted: #9aa2b2;
    --success: #16a34a;
    --success-bg: #dcfce7;
    --danger: #dc2626;
    --danger-bg: #fee2e2;
    --shadow-sm: 0 1px 3px rgba(13,19,33,0.06);
    --shadow-md: 0 4px 20px rgba(13,19,33,0.08);
    --shadow-lg: 0 16px 48px rgba(13,19,33,0.12);
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 22px;
    --radius-xl: 28px;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #f2f4f7;
    color: var(--text-primary);
    min-height: 100vh;
  }

  .dp-root h1, .dp-root h2, .dp-root h3, .dp-root h4 {
    font-family: 'Sora', system-ui, sans-serif;
  }

  /* ── Layout ── */
  .dp-page { padding: clamp(16px, 3vw, 32px); max-width: 1400px; margin: 0 auto; }

  .dp-main-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) 360px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 1080px) { .dp-main-grid { grid-template-columns: 1fr; } }

  .dp-col { display: flex; flex-direction: column; gap: 16px; }

  /* ── Welcome ── */
  .dp-welcome {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 24px;
  }
  .dp-welcome h1 {
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.2;
  }
  .dp-welcome p { font-size: 13px; color: var(--text-secondary); margin-top: 5px; font-style: italic; }

  /* ── Add Money button ── */
  .dp-add-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--text-primary); color: #fff;
    border: none; border-radius: 99px;
    padding: 11px 22px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'Sora', inherit;
    box-shadow: 0 4px 14px rgba(13,19,33,0.18);
    transition: background 0.15s, transform 0.15s;
    white-space: nowrap;
  }
  .dp-add-btn:hover { background: #1e2a3a; transform: translateY(-1px); }

  /* ── Rate pill ── */
  .dp-rate-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 16px; border-radius: 99px;
    background: var(--lime-bg); border: 1.5px solid #d4f07a;
    font-size: 13px; font-weight: 700; color: var(--lime-dark);
    white-space: nowrap; flex-shrink: 0;
  }

  /* ── Dark Balance Hero ── */
  .dp-hero {
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    position: relative;
  }
  .dp-hero-body {
    background: linear-gradient(145deg, #0d1f1a 0%, #1a3028 55%, #0d1f1a 100%);
    padding: 28px 28px 24px;
    color: #fff;
    position: relative;
    overflow: hidden;
  }
  .dp-hero-body::before {
    content: '';
    position: absolute; top: -90px; right: -90px;
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(200,241,53,0.18) 0%, transparent 65%);
    pointer-events: none;
  }
  .dp-hero-body::after {
    content: '';
    position: absolute; bottom: -60px; left: 25%;
    width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle, rgba(200,241,53,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  .dp-hero-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
    text-transform: uppercase; color: rgba(255,255,255,0.45);
    margin-bottom: 10px;
  }
  .dp-hero-balance {
    font-size: clamp(34px, 5vw, 52px);
    font-weight: 900; letter-spacing: -2px;
    line-height: 1; color: #fff; font-family: 'Sora', inherit;
  }
  .dp-hero-locked {
    margin-top: 10px; font-size: 12px;
    color: rgba(255,255,255,0.5); font-weight: 500;
  }
  .dp-hero-locked strong { color: rgba(255,255,255,0.8); font-weight: 700; }

  .dp-hero-stats {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; margin-top: 22px;
  }
  .dp-hero-stat {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: var(--radius-md);
    padding: 12px 14px;
  }
  .dp-hero-stat small { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.45); display: block; }
  .dp-hero-stat .val { font-size: 16px; font-weight: 800; margin-top: 4px; font-family: 'Sora', inherit; }

  .dp-hero-nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
    color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
    z-index: 5; transition: background 0.15s;
  }
  .dp-hero-nav:hover { background: rgba(255,255,255,0.2); }
  .dp-hero-nav.left { left: 12px; }
  .dp-hero-nav.right { right: 12px; }

  .dp-dots { display: flex; justify-content: center; gap: 6px; margin-top: 18px; }
  .dp-dot { height: 5px; border-radius: 99px; transition: all 0.3s; }
  .dp-dot.active { width: 22px; background: var(--lime); }
  .dp-dot:not(.active) { width: 5px; background: rgba(255,255,255,0.2); }

  /* ── Action bar under hero ── */
  .dp-action-bar {
    display: grid; grid-template-columns: repeat(4, 1fr);
    background: var(--surface); border-top: 1px solid var(--border);
  }
  .dp-action-btn {
    padding: 16px 8px; border: none; background: transparent;
    cursor: pointer; font-family: inherit; font-weight: 700; font-size: 12px;
    color: var(--text-secondary); transition: background 0.15s, color 0.15s;
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    letter-spacing: 0.2px;
  }
  .dp-action-btn:not(:last-child) { border-right: 1px solid var(--border); }
  .dp-action-btn:hover { background: var(--surface-2); color: var(--text-primary); }
  .dp-action-btn.lime {
    background: var(--lime); color: #1a2900; font-weight: 800;
  }
  .dp-action-btn.lime:hover { background: #d4ff40; }

  .dp-action-icon {
    width: 36px; height: 36px; border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.06);
    transition: background 0.15s;
  }
  .dp-action-btn.lime .dp-action-icon { background: rgba(0,0,0,0.08); }

  /* ── White cards ── */
  .dp-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
  .dp-card-pad { padding: 22px 24px; }

  /* ── My Wallets sidebar card ── */
  .dp-wallets-card { display: flex; flex-direction: column; gap: 0; }
  .dp-wallets-card h2 { font-size: 16px; font-weight: 800; margin-bottom: 6px; }

  .dp-wallet-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
  }
  .dp-wallet-row:last-of-type { border-bottom: none; }
  .dp-wallet-icon {
    width: 44px; height: 44px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 900; flex-shrink: 0;
  }

  /* ── Wallet pills row ── */
  .dp-pills-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  }
  @media (max-width: 640px) { .dp-pills-grid { grid-template-columns: repeat(2,1fr); } }
  .dp-pill {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: var(--radius-md); padding: 14px 16px;
    cursor: pointer; transition: all 0.18s;
    box-shadow: var(--shadow-sm);
  }
  .dp-pill:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .dp-pill.active { border-color: var(--lime-dark); background: var(--lime-bg); }

  /* ── Section header ── */
  .dp-section-head {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
  }
  .dp-section-head h3 { font-size: 15px; font-weight: 700; }

  /* ── Badge / tag ── */
  .dp-badge {
    font-size: 11px; font-weight: 700; padding: 3px 10px;
    border-radius: 99px; letter-spacing: 0.3px;
  }
  .dp-badge-lime { background: var(--lime-bg); color: var(--lime-dark); }
  .dp-badge-green { background: var(--success-bg); color: var(--success); }
  .dp-badge-red { background: var(--danger-bg); color: var(--danger); }
  .dp-badge-blue { background: #dbeafe; color: #1d4ed8; }
  .dp-badge-neutral { background: var(--surface-3); color: var(--text-secondary); }

  /* ── Table ── */
  .dp-table-wrap { overflow-x: auto; border-radius: var(--radius-md); }
  .dp-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 460px; }
  .dp-table th {
    text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase;
    color: var(--text-muted); background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }
  .dp-table td { padding: 13px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .dp-table tr:last-child td { border-bottom: none; }
  .dp-table tr:hover td { background: var(--surface-2); }

  .dp-table-btn {
    padding: 6px 16px; border-radius: 99px; border: none;
    font-weight: 700; font-size: 12px; cursor: pointer;
    font-family: inherit; transition: opacity 0.15s;
  }
  .dp-table-btn:hover { opacity: 0.82; }

  /* ── Stat bar ── */
  .dp-bar-track {
    height: 6px; border-radius: 99px;
    background: var(--surface-3); overflow: hidden; margin-top: 8px;
  }
  .dp-bar-fill { height: 100%; border-radius: 99px; transition: width 0.9s cubic-bezier(.22,1,.36,1); }

  /* ── Rate box ── */
  .dp-rate-box {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-radius: var(--radius-md);
    background: var(--surface-2); border: 1px solid var(--border);
    margin-bottom: 10px;
  }

  /* ── Sparkline ── */
  .dp-sparkline { width: 100%; height: 48px; display: block; }

  /* ── Animations ── */
  @keyframes dp-rise { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .dp-rise { animation: dp-rise 0.45s cubic-bezier(.22,1,.36,1) both; }
  .dp-d1 { animation-delay: 0.04s; } .dp-d2 { animation-delay: 0.09s; }
  .dp-d3 { animation-delay: 0.14s; } .dp-d4 { animation-delay: 0.19s; }
  .dp-d5 { animation-delay: 0.24s; } .dp-d6 { animation-delay: 0.29s; }

  /* ── Select ── */
  .dp-select {
    width: 100%; padding: 9px 12px; border-radius: var(--radius-sm);
    border: 1px solid var(--border-strong);
    background: var(--surface); color: var(--text-primary);
    font-size: 13px; font-weight: 600; font-family: inherit;
    outline: none; cursor: pointer;
  }
  .dp-select:focus { border-color: var(--lime-dark); }

  /* ── Empty state ── */
  .dp-empty { text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 13px; }

  /* ── View all link ── */
  .dp-view-all {
    display: flex; align-items: center; gap: 4px;
    font-size: 13px; font-weight: 700; color: var(--text-primary);
    background: none; border: none; cursor: pointer;
    padding: 0; font-family: inherit;
    transition: color 0.15s;
  }
  .dp-view-all:hover { color: var(--lime-dark); }

  /* ── Warning banner ── */
  .dp-warning {
    margin-bottom: 18px; padding: 14px 18px; border-radius: var(--radius-lg);
    background: #fffbeb; border: 1px solid #fde68a;
    display: flex; justify-content: space-between; align-items: center;
    gap: 12px; flex-wrap: wrap;
  }

  /* ── Refresh btn ── */
  .dp-refresh-btn {
    padding: 10px 20px; border-radius: 99px;
    border: 1.5px solid var(--border-strong);
    background: var(--surface); color: var(--text-primary);
    font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; transition: all 0.15s;
  }
  .dp-refresh-btn:hover { border-color: var(--lime-dark); background: var(--lime-bg); }

  @media (max-width: 480px) {
    .dp-action-bar { grid-template-columns: repeat(2, 1fr); }
    .dp-action-btn:nth-child(2) { border-right: none; }
    .dp-action-btn:nth-child(3) { border-top: 1px solid var(--border); }
  }
`;

/* ─── Sparkline ───────────────────────────────────────────── */
const Sparkline: React.FC<{ values: number[]; color?: string }> = ({
  values,
  color = "#c8f135",
}) => {
  if (values.length < 2)
    return (
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9aa2b2",
          fontSize: 12,
        }}
      >
        No history
      </div>
    );
  const W = 300,
    H = 48,
    pad = 6;
  const min = Math.min(...values),
    max = Math.max(...values),
    range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="dp-sparkline"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="spkG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${pts.join(" ")} ${W},${H}`} fill="url(#spkG)" />
      <polyline
        points={pts.join(" ")}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ─── Wallet Hero ─────────────────────────────────────────── */
const WalletHero: React.FC<{
  wallets: WalletView[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  buyTargetCurrency: string;
  onBuyTargetChange: (c: string) => void;
  onDeposit: () => void;
  onSell: () => void;
  onBuy: () => void;
}> = ({
  wallets,
  activeIndex,
  onPrev,
  onNext,
  buyTargetCurrency,
  onBuyTargetChange,
  onDeposit,
  onSell,
  onBuy,
}) => {
  const w = wallets[activeIndex];
  if (!w) return null;
  const flagUrl = FLAG_URLS[w.currency];

  return (
    <div className="dp-hero">
      <div className="dp-hero-body" style={{ position: "relative" }}>
        {/* Nav arrows */}
        <button
          className="dp-hero-nav left"
          onClick={onPrev}
          aria-label="Previous wallet"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18L9 12L15 6" />
          </svg>
        </button>
        <button
          className="dp-hero-nav right"
          onClick={onNext}
          aria-label="Next wallet"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18L15 12L9 6" />
          </svg>
        </button>

        {/* Top: flag + currency code badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {flagUrl && (
              <img
                src={flagUrl}
                alt={w.currency}
                style={{
                  width: 38,
                  height: 26,
                  borderRadius: 5,
                  objectFit: "cover",
                  border: "1px solid rgba(255,255,255,0.15)",
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 1,
                }}
              >
                Active Wallet
              </div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{w.currency}</div>
            </div>
          </div>
          <div
            style={{
              background: "rgba(200,241,53,0.15)",
              border: "1px solid rgba(200,241,53,0.3)",
              borderRadius: 99,
              padding: "5px 14px",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--lime)",
              letterSpacing: "0.3px",
            }}
          >
            {w.cardHolder || "MY WALLET"}
          </div>
        </div>

        {/* Balance */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="dp-hero-label">Total Balance (Estim. USD)</div>
          <div className="dp-hero-balance">
            {w.symbol}
            {fmt(w.balance)}
          </div>
          <div className="dp-hero-locked">
            Locked:{" "}
            <strong title="Funds committed to active trades">
              {w.symbol}
              {fmt(w.locked)}
            </strong>
          </div>
        </div>

        {/* Income / Outcome chips */}
        <div
          className="dp-hero-stats"
          style={{ position: "relative", zIndex: 2 }}
        >
          <div className="dp-hero-stat">
            <small>Income</small>
            <div className="val" style={{ color: "#86efac" }}>
              {w.symbol}
              {fmt(w.income)}
            </div>
          </div>
          <div className="dp-hero-stat">
            <small>Outcome</small>
            <div className="val" style={{ color: "#fca5a5" }}>
              {w.symbol}
              {fmt(w.outcome)}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="dp-dots">
          {wallets.map((_, i) => (
            <div
              key={i}
              className={`dp-dot ${i === activeIndex ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Buy currency selector (NGN only) */}
      {w.currency === "NGN" && (
        <div
          style={{
            padding: "12px 22px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Buy Currency
          </label>
          <select
            className="dp-select"
            value={buyTargetCurrency}
            onChange={(e) => onBuyTargetChange(e.target.value)}
          >
            {wallets
              .filter((wx) => wx.currency !== "NGN")
              .map((wx) => (
                <option key={wx.currency} value={wx.currency}>
                  {wx.currency}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Action bar — Send (lime), Exchange, Receive, More */}
      <div className="dp-action-bar">
        {[
          {
            label: "Send",
            fn: onSell,
            lime: true,
            icon: (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            ),
          },
          {
            label: "Exchange",
            fn: () => {},
            lime: false,
            icon: (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            ),
          },
          {
            label: "Receive",
            fn: onDeposit,
            lime: false,
            icon: (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            ),
          },
          {
            label: "More",
            fn: onBuy,
            lime: false,
            icon: (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            ),
          },
        ].map(({ label, fn, lime, icon }) => (
          <button
            key={label}
            className={`dp-action-btn${lime ? " lime" : ""}`}
            onClick={fn}
          >
            <div className="dp-action-icon">{icon}</div>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── My Wallets sidebar ─────────────────────────────────── */
const MyWallets: React.FC<{ wallets: WalletView[]; onViewAll: () => void }> = ({
  wallets,
  onViewAll,
}) => (
  <div className="dp-card dp-card-pad dp-wallets-card">
    <h2
      style={{
        fontFamily: "Sora, inherit",
        fontSize: 17,
        fontWeight: 800,
        marginBottom: 4,
      }}
    >
      My Wallets
    </h2>
    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
      Multi-currency balances
    </p>

    {wallets.map((w) => {
      const meta = WALLET_META[w.currency] ?? WALLET_META.NGN;
      return (
        <div key={w.currency} className="dp-wallet-row">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="dp-wallet-icon" style={{ background: meta.iconBg }}>
              <span
                style={{
                  color: meta.iconColor,
                  fontFamily: "Sora, inherit",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                {w.symbol}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{w.currency}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {meta.label}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>
              {w.symbol} {fmt(w.balance)}
            </div>
            {w.locked > 0 && (
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Locked: {w.symbol}
                {fmt(w.locked)}
              </div>
            )}
          </div>
        </div>
      );
    })}

    <button
      className="dp-view-all"
      onClick={onViewAll}
      style={{ marginTop: 14 }}
    >
      View all wallets
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeWalletIndex, setActiveWalletIndex] = useState(0);

  const walletCurrencies = useMemo(
    () => [
      { code: "NGN", symbol: "₦" },
      { code: "USD", symbol: "$" },
      { code: "GBP", symbol: "£" },
      { code: "CAD", symbol: "CA$" },
    ],
    [],
  );

  const initWallets = (): WalletView[] =>
    walletCurrencies.map((c) => ({
      id: c.code,
      currency: c.code,
      balance: 0,
      symbol: c.symbol,
      locked: 0,
      cardNumber: "",
      cardHolder: "",
      expiry: "",
      income: 0,
      outcome: 0,
      limit: 0,
    }));

  const [wallets, setWallets] = useState<WalletView[]>(initWallets);
  const [marketListings, setMarketListings] = useState<SellerView[]>([]);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyTargetCurrency, setBuyTargetCurrency] = useState("GBP");
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activityPoints, setActivityPoints] = useState<ActivityChartPoint[]>(
    () => buildEmpty7("activity") as ActivityChartPoint[],
  );
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [depositWithdrawalPoints, setDepositWithdrawalPoints] = useState<
    DepositsWithdrawalsPoint[]
  >(() => buildEmpty7("depwd") as DepositsWithdrawalsPoint[]);
  const [depositWithdrawalLoading, setDepositWithdrawalLoading] =
    useState(false);
  const [depositWithdrawalError, setDepositWithdrawalError] = useState("");
  const [conversionPoints, setConversionPoints] = useState<ConversionTrendPoint[]>(
    () => buildEmpty7("conv") as ConversionTrendPoint[],
  );
  const [recentTransactions, setRecentTransactions] = useState<
    TransactionItem[]
  >([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState("");
  const [tradingStats, setTradingStats] = useState<
    { label: string; pct: number; type: "buy" | "sell" }[]
  >([]);
  const [rateHistoryValues, setRateHistoryValues] = useState<number[]>([]);

  const extractRate = (
    ratesData: unknown,
    base: string,
    quote: string,
  ): number | null => {
    const b = base.toUpperCase(),
      q = quote.toUpperCase();
    if (Array.isArray(ratesData)) {
      for (const r of ratesData) {
        const rec = r as Record<string, unknown>;
        const from = String(
          rec.from ?? rec.base ?? rec.currency_from ?? rec.currencyFrom ?? "",
        ).toUpperCase();
        const to = String(
          rec.to ?? rec.quote ?? rec.currency_to ?? rec.currencyTo ?? "",
        ).toUpperCase();
        if (
          (from === b && to === q) ||
          String(rec.pair || "").toUpperCase() === `${b}/${q}`
        ) {
          const v = Number(
            rec.rate ?? rec.value ?? rec.exchange_rate ?? rec.exchangeRate ?? 0,
          );
          return Number.isFinite(v) && v > 0 ? v : null;
        }
      }
    }
    if (ratesData && typeof ratesData === "object") {
      const obj = ratesData as Record<string, unknown>;
      const direct = obj[`${b}_${q}`] ?? obj[`${b}/${q}`] ?? obj[`${q}_${b}`];
      if (direct && typeof direct === "object") {
        const v = Number((direct as any).rate ?? (direct as any).value ?? 0);
        return Number.isFinite(v) && v > 0 ? v : null;
      }
      const v = Number(obj.rate ?? obj.value ?? 0);
      return Number.isFinite(v) && v > 0 ? v : null;
    }
    return null;
  };

  const loadDashboard = useCallback(async () => {
    const dayMs = 86400000;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [walletRes, listingRes, ratesRes] = await Promise.all([
          walletsApi.list(),
          sabitsApi.list({ status: "active", limit: 6 }),
          ratesApi.list(),
        ]);

        if (walletRes.success) {
          const walletList = extractArray(walletRes.data);
          const wMap = new Map<string, Record<string, unknown>>(
            walletList.map((w: Record<string, unknown>) => [
              String(w.currency || ""),
              w,
            ]),
          );
          setWallets(
            walletCurrencies.map((c, idx) => {
              const w = wMap.get(c.code) || {};
              return {
                id: String((w as any).id || c.code || idx),
                currency: c.code,
                balance:
                  Number(
                    (w as any).available_balance ??
                      (w as any).availableBalance ??
                      (w as any).available ??
                      (w as any).balance ??
                      0,
                  ) || 0,
                locked:
                  Number(
                    (w as any).locked_balance ??
                      (w as any).lockedBalance ??
                      (w as any).locked ??
                      0,
                  ) || 0,
                symbol: String((w as any).symbol || c.symbol),
                cardNumber: String((w as any).cardNumber || ""),
                cardHolder: String((w as any).cardHolder || ""),
                expiry: String((w as any).expiry || ""),
                income: Number((w as any).income || 0),
                outcome: Number((w as any).outcome || 0),
                limit: Number((w as any).limit || 0),
              };
            }),
          );
          const foreign = walletCurrencies
            .filter((c) => c.code !== "NGN")
            .map((c) => c.code);
          setBuyTargetCurrency((prev) =>
            foreign.includes(prev) ? prev : foreign[0] || "GBP",
          );
        } else if (!walletRes.success) {
          setError(walletRes.error?.message || "Failed to load wallets");
        }

        if (listingRes.success) {
          const listings = extractArray(listingRes.data);
          setMarketListings(
            listings.map((item: Record<string, unknown>, i: number) => ({
              id: Number(item.id || i + 1),
              name: String(item.sellerName || item.name || ""),
              avatar: String(item.avatar || ""),
              amount: Number(item.amount || 0),
              currency: String(item.currency || "NGN"),
              rate: Number(item.rate || 0),
              rating: Number(item.rating || 0),
              completed: Number(item.completed || 0),
              type: item.type === "sell" ? "sell" : "buy",
            })),
          );
        }

        if (ratesRes.success) {
          const v = extractRate(ratesRes.data, "NGN", "GBP");
          setRate(v);
        }

        setActivityLoading(true);
        setRecentLoading(true);
        setDepositWithdrawalLoading(true);

        const [
          ledgerRes,
          rateHistoryRes,
          depositsRes,
          withdrawalsRes,
          conversionsRes,
        ] = await Promise.all([
          ledgerApi.listEntries({ limit: 50 }),
          ratesApi.list(),
          depositsApi.list({ limit: 50 }),
          withdrawalsApi.list({ limit: 50 }),
          conversionsApi.list({ limit: 50 }),
        ]);

        if (ledgerRes.success) {
          const ledgerList = extractArray(ledgerRes.data);
          const allMapped = ledgerList.map(
            (entry: Record<string, unknown>, idx: number) => {
              const counterparty =
                (entry.counterpartyName as string) ||
                (entry.counterparty as any)?.name ||
                "";
              const avatar =
                (entry.counterpartyAvatar as string) ||
                (entry.counterparty as any)?.avatar ||
                "";
              const typeRaw = String(entry.type || "buy");
              const type: TransactionItem["type"] =
                typeRaw === "sell" ? "sell" : "buy";
              const statusRaw = String(entry.status || "completed");
              const status: TransactionItem["status"] = [
                "pending",
                "cancelled",
                "completed",
              ].includes(statusRaw)
                ? (statusRaw as TransactionItem["status"])
                : "completed";
              const amount = Number(entry.amount || 0);
              const rateVal = Number(entry.rate || entry.exchangeRate || 0);
              const total =
                Number(entry.total || entry.value || 0) || amount * rateVal;
              return {
                id: Number(entry.id || idx + 1),
                type,
                currency: String(entry.currency || ""),
                amount,
                rate: rateVal,
                total,
                counterparty,
                avatar,
                reference: String(
                  entry.reference ??
                    entry.ref ??
                    entry.reference_id ??
                    entry.id ??
                    idx + 1,
                ),
                date: String(
                  entry.date || entry.createdAt || new Date().toISOString(),
                ),
                status,
              };
            },
          );
          setRecentTransactions(allMapped.slice(0, 5));

          const buckets = make7Buckets(dayMs);
          for (const tx of allMapped) {
            if (tx.status !== "completed") continue;
            const t = new Date(tx.date).getTime();
            if (!Number.isFinite(t)) continue;
            const b = buckets.find((b) => t >= b.start && t < b.end);
            if (b) {
              b.trades!++;
              b.volume! += tx.total || 0;
            }
          }
          setActivityPoints(
            buckets.map((b) => ({
              day: b.label,
              trades: b.trades!,
              volume: b.volume!,
            })),
          );

          const buyVol = allMapped
            .filter((t) => t.type === "buy" && t.status === "completed")
            .reduce((s, t) => s + t.total, 0);
          const sellVol = allMapped
            .filter((t) => t.type === "sell" && t.status === "completed")
            .reduce((s, t) => s + t.total, 0);
          const totalVol = buyVol + sellVol;
          setTradingStats([
            {
              label: "Buying Volume",
              pct: totalVol > 0 ? (buyVol / totalVol) * 100 : 0,
              type: "buy",
            },
            {
              label: "Selling Volume",
              pct: totalVol > 0 ? (sellVol / totalVol) * 100 : 0,
              type: "sell",
            },
          ]);
        } else if (!ledgerRes.success) {
          setRecentError(
            ledgerRes.error?.message || "Failed to load transactions",
          );
          setActivityError(
            ledgerRes.error?.message || "Failed to load activity",
          );
        }

        const depBuckets = make7Buckets(dayMs);
        const addToBucket = (
          dateValue: unknown,
          amountValue: unknown,
          key: "deposits" | "withdrawals",
        ) => {
          const t = new Date(String(dateValue || "")).getTime();
          if (!Number.isFinite(t)) return;
          const b = depBuckets.find((b) => t >= b.start && t < b.end);
          if (!b) return;
          const amt = Number(amountValue || 0);
          if (!Number.isFinite(amt) || amt <= 0) return;
          (b as any)[key] = ((b as any)[key] || 0) + amt;
        };
        if (depositsRes.success) {
          const deposits = extractArray(depositsRes.data);
          for (const dep of deposits) {
            const d = dep as Record<string, unknown>;
            addToBucket(
              d.date ?? d.createdAt ?? d.created_at ?? d.timestamp,
              d.amount ?? d.value,
              "deposits",
            );
          }
        }
        if (withdrawalsRes.success) {
          const withdrawals = extractArray(withdrawalsRes.data);
          for (const w of withdrawals) {
            const wd = w as Record<string, unknown>;
            addToBucket(
              wd.date ?? wd.createdAt ?? wd.created_at ?? wd.timestamp,
              wd.amount ?? wd.value,
              "withdrawals",
            );
          }
        }
        if (
          (!depositsRes.success) &&
          (!withdrawalsRes.success)
        ) {
          setDepositWithdrawalError(
            depositsRes.error?.message ||
              withdrawalsRes.error?.message ||
              "Failed to load deposits/withdrawals",
          );
          setDepositWithdrawalPoints(
            buildEmpty7("depwd") as DepositsWithdrawalsPoint[],
          );
        } else {
          setDepositWithdrawalPoints(
            depBuckets.map((b) => ({
              day: b.label,
              deposits: (b as any).deposits || 0,
              withdrawals: (b as any).withdrawals || 0,
            })),
          );
        }

        const convBuckets = make7Buckets(dayMs);
        if (conversionsRes.success) {
          const conversions = extractArray(conversionsRes.data);
          for (const c of conversions) {
            const conv = c as Record<string, unknown>;
            const t = new Date(
              String(
                conv.date ??
                  conv.createdAt ??
                  conv.created_at ??
                  conv.timestamp ??
                  "",
              ),
            ).getTime();
            if (!Number.isFinite(t)) continue;
            const b = convBuckets.find((b) => t >= b.start && t < b.end);
            if (!b) continue;
            const amt = Number(conv.amount ?? conv.value ?? conv.total ?? 0);
            if (Number.isFinite(amt) && amt > 0)
              (b as any).value = ((b as any).value || 0) + amt;
          }

          setConversionPoints(
            convBuckets.map((b) => ({
              day: b.label,
              value: Number((b as any).value || 0),
            })),
          );
        } else {
          // Conversion fetch failed, but chart will show empty data
        }

        if (rateHistoryRes.success) {
          const rateHistory = extractArray(rateHistoryRes.data);
          const values = rateHistory
            .map((x: Record<string, unknown>) => ({
              v: Number(x.rate ?? x.value ?? x.exchangeRate ?? 0),
              date: String(x.date || x.createdAt || ""),
            }))
            .filter((x) => Number.isFinite(x.v) && x.v > 0);
          values.sort((a, b) => a.date.localeCompare(b.date));
          setRateHistoryValues(values.map((x) => x.v).slice(-10));
        } else {
          setRateHistoryValues([]);
        }
      } catch (err: any) {
        setError("An unexpected error occurred while loading dashboard data");
        void err;
      } finally {
        setLoading(false);
        setActivityLoading(false);
        setRecentLoading(false);
        setDepositWithdrawalLoading(false);
      }
    };
    void load();
  }, [walletCurrencies]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const activeWallet = wallets[activeWalletIndex];
  const nextWallet = () =>
    setActiveWalletIndex((i) =>
      wallets.length ? (i + 1) % wallets.length : 0,
    );
  const prevWallet = () =>
    setActiveWalletIndex((i) =>
      wallets.length ? (i - 1 + wallets.length) % wallets.length : 0,
    );

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "";
  const displayRate = useMemo(() => rate ?? null, [rate]);
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }, []);

  const handleSellSubmit = async (
    amountSent: number,
    rateValue: number,
    amountReceived: number,
    receiveCurrency: string,
  ) => {
    const payload =
      activeWallet.currency === "NGN"
        ? {
            type: "buy",
            currency: receiveCurrency,
            amount: amountReceived,
            rate: rateValue,
            status: "active",
          }
        : {
            type: "sell",
            currency: activeWallet.currency,
            amount: amountSent,
            rate: rateValue,
            status: "active",
          };
    const res = await sabitsApi.create(payload as Record<string, unknown>);
    if (!res.success)
      throw new Error(res.error?.message || "Failed to create sabit");
  };

  /* ── Render ── */
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div
        className="dp-root"
        style={{ opacity: loading ? 0.92 : 1, transition: "opacity 0.3s" }}
      >
        <div className="dp-page">
          {/* PIN Warning Banner */}
          {user && user.transaction_pin_set === false && (
            <div className="dp-warning dp-rise">
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#92400e" }}>
                  Transaction PIN Required
                </div>
                <div style={{ fontSize: 12, color: "#b45309", marginTop: 2 }}>
                  You must set a transaction PIN to place bids or initiate trades.
                </div>
              </div>
              <button
                className="dp-add-btn"
                style={{ background: "#f59e0b" }}
                onClick={() => navigate("/dashboard/transaction-pin")}
              >
                Set PIN Now
              </button>
            </div>
          )}

          {/* Welcome row */}
          <div className="dp-welcome dp-rise">
            <div>
              <h1>
                {greeting}
                {displayName ? `, ${displayName}` : ""}! 👋
              </h1>
              <p>Your financial overview is looking solid today.</p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {displayRate !== null && (
                <div className="dp-rate-pill">
                  <div style={{ display: "flex" }}>
                    {[FLAG_URLS.NGN, FLAG_URLS.GBP].map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        style={{
                          width: 20,
                          height: 14,
                          borderRadius: 2,
                          objectFit: "cover",
                          border: "1px solid rgba(0,0,0,0.1)",
                          marginLeft: i > 0 ? -5 : 0,
                        }}
                      />
                    ))}
                  </div>
                  NGN/GBP · ₦{fmt(displayRate)}
                  <span
                    style={{
                      fontSize: 10,
                      background: "var(--success-bg)",
                      color: "var(--success)",
                      padding: "2px 6px",
                      borderRadius: 99,
                      fontWeight: 700,
                    }}
                  >
                    ▲ 2.4%
                  </span>
                </div>
              )}
              <button
                className="dp-refresh-btn"
                onClick={async () => {
                  if (refreshing) return;
                  setRefreshing(true);
                  try {
                    await loadDashboard();
                  } finally {
                    setRefreshing(false);
                  }
                }}
              >
                {refreshing ? "Refreshing…" : "↻ Refresh"}
              </button>
              <button
                className="dp-add-btn"
                onClick={() => setIsDepositModalOpen(true)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Money
              </button>
            </div>
          </div>

          {/* ── Top section: Hero + Wallets sidebar ── */}
          <div className="dp-main-grid" style={{ marginBottom: 20 }}>
            {/* Left: Hero card */}
            <div className="dp-rise dp-d1">
              <WalletHero
                wallets={wallets}
                activeIndex={activeWalletIndex}
                onPrev={prevWallet}
                onNext={nextWallet}
                buyTargetCurrency={buyTargetCurrency}
                onBuyTargetChange={setBuyTargetCurrency}
                onDeposit={() => setIsDepositModalOpen(true)}
                onSell={() => setIsSellModalOpen(true)}
                onBuy={() => navigate("/dashboard/active-sabits")}
              />
            </div>

            {/* Right: My Wallets */}
            <div className="dp-rise dp-d2">
              <MyWallets
                wallets={wallets}
                onViewAll={() => navigate("/dashboard/wallets")}
              />
            </div>
          </div>

          {/* ── Wallet pills ── */}
          <div
            className="dp-pills-grid dp-rise dp-d2"
            style={{ marginBottom: 20 }}
          >
            {wallets.map((w, idx) => {
              const meta = WALLET_META[w.currency] ?? WALLET_META.NGN;
              const isActive = idx === activeWalletIndex;
              return (
                <div
                  key={w.currency}
                  className={`dp-pill ${isActive ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveWalletIndex(idx)}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setActiveWalletIndex(idx)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {FLAG_URLS[w.currency] && (
                      <img
                        src={FLAG_URLS[w.currency]}
                        alt={w.currency}
                        style={{
                          width: 22,
                          height: 15,
                          borderRadius: 3,
                          objectFit: "cover",
                          border: "1px solid var(--border)",
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: isActive ? meta.iconColor : "var(--text-muted)",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {w.currency}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: isActive ? meta.iconColor : "var(--text-primary)",
                      letterSpacing: "-0.2px",
                    }}
                  >
                    {w.symbol}
                    {fmt(w.balance)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    Available
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    Locked: {w.symbol}
                    {fmt(w.locked)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Bottom grid: main content + sidebar ── */}
          <div className="dp-main-grid">
            {/* Left col */}
            <div className="dp-col">
              {/* Marketplace */}
              <div className="dp-card dp-card-pad dp-rise dp-d3">
                <div className="dp-section-head">
                  <h3>Active Sabit Marketplace</h3>
                  <span className="dp-badge dp-badge-lime">
                    Live · {marketListings.length} listings
                  </span>
                </div>
                {marketListings.length === 0 ? (
                  <div className="dp-empty">
                    No active listings at the moment.
                  </div>
                ) : (
                  <div className="dp-table-wrap">
                    <table className="dp-table">
                      <thead>
                        <tr>
                          {[
                            "Seller",
                            "Type",
                            "Rate (NGN)",
                            "Amount",
                            "Action",
                          ].map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {marketListings.map((seller) => (
                          <tr key={seller.id}>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <img
                                  src={seller.avatar}
                                  alt={seller.name}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    background: "var(--surface-3)",
                                    flexShrink: 0,
                                  }}
                                />
                                <span style={{ fontWeight: 600 }}>
                                  {seller.name}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`dp-badge ${seller.type === "sell" ? "dp-badge-red" : "dp-badge-green"}`}
                              >
                                {seller.type === "sell"
                                  ? "SELL SABIT"
                                  : "BUY SABIT"}
                              </span>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: "var(--lime-dark)",
                                }}
                              >
                                ₦{fmt(seller.rate)}
                              </span>
                            </td>
                            <td style={{ color: "var(--text-secondary)" }}>
                              {currSym(seller.currency)}
                              {fmt(seller.amount)} {seller.currency}
                            </td>
                            <td>
                              <button
                                className="dp-table-btn"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/transaction/${seller.id}`,
                                  )
                                }
                                style={{
                                  background:
                                    seller.type === "sell"
                                      ? "var(--success-bg)"
                                      : "var(--danger-bg)",
                                  color:
                                    seller.type === "sell"
                                      ? "var(--success)"
                                      : "var(--danger)",
                                }}
                              >
                                {seller.type === "sell" ? "Buy" : "Sell"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Transaction History */}
              <div className="dp-card dp-rise dp-d4">
                <TransactionHistory
                  onViewAll={() => navigate("/dashboard/history")}
                  transactions={recentTransactions}
                  loading={recentLoading}
                  error={recentError}
                />
              </div>

              {/* Funds Analysis chart — mirroring screenshot bottom section */}
              <div className="dp-card dp-card-pad dp-rise dp-d5">
                <div className="dp-section-head">
                  <div>
                    <h3>Funds Analysis</h3>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Last 7 Days Overview
                    </div>
                  </div>
                </div>
                <LedgerVolumeAreaChart
                  points={activityPoints}
                  loading={activityLoading}
                  error={activityError}
                />
              </div>
            </div>

            {/* Right col */}
            <div className="dp-col">
              {/* Wallet balances chart */}
              <div className="dp-card dp-rise dp-d1">
                <WalletBalancesBarChart
                  points={wallets.map(
                    (w): WalletBarPoint => ({
                      currency: w.currency,
                      balance: w.balance,
                    }),
                  )}
                />
              </div>

              {/* Trading stats */}
              <div className="dp-card dp-card-pad dp-rise dp-d2">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>
                  Trading Statistics
                </h3>
                {tradingStats.length ? (
                  tradingStats.map((bar) => (
                    <div key={bar.type} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{bar.label}</span>
                        <span
                          style={{
                            fontWeight: 800,
                            color: "var(--text-primary)",
                          }}
                        >
                          {bar.pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="dp-bar-track">
                        <div
                          className="dp-bar-fill"
                          style={{
                            width: `${bar.pct}%`,
                            background:
                              bar.type === "buy"
                                ? "linear-gradient(90deg,#86efac,#16a34a)"
                                : "linear-gradient(90deg,#fca5a5,#dc2626)",
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    No statistics yet.
                  </p>
                )}
              </div>

              {/* Exchange Rate */}
              <div className="dp-card dp-card-pad dp-rise dp-d3">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                    Exchange Rate
                  </h3>
                  <span
                    className="dp-badge dp-badge-green"
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    ▲ 2.4%
                  </span>
                </div>
                <div
                  style={{
                    marginBottom: 14,
                    paddingBottom: 14,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <Sparkline values={rateHistoryValues} color="#8aae00" />
                </div>
                {[
                  {
                    from: "NGN",
                    to: "GBP",
                    fromF: FLAG_URLS.NGN,
                    toF: FLAG_URLS.GBP,
                  },
                  {
                    from: "GBP",
                    to: "NGN",
                    fromF: FLAG_URLS.GBP,
                    toF: FLAG_URLS.NGN,
                  },
                ].map(({ from, to, fromF, toF }) => (
                  <div key={`${from}${to}`} className="dp-rate-box">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div style={{ display: "flex" }}>
                        <img
                          src={fromF}
                          alt={from}
                          style={{
                            width: 24,
                            height: 16,
                            borderRadius: 3,
                            objectFit: "cover",
                            border: "1px solid var(--border)",
                          }}
                        />
                        <img
                          src={toF}
                          alt={to}
                          style={{
                            width: 24,
                            height: 16,
                            borderRadius: 3,
                            objectFit: "cover",
                            border: "1px solid var(--border)",
                            marginLeft: -6,
                            zIndex: 1,
                            position: "relative",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {from} → {to}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "var(--lime-dark)",
                        }}
                      >
                        {displayRate === null ? "—" : `₦${fmt(displayRate)}`}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        per £1
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart widgets */}
              <div className="dp-card dp-rise dp-d4">
                <DepositsWithdrawalsBarChart
                  points={depositWithdrawalPoints}
                  loading={depositWithdrawalLoading}
                  error={depositWithdrawalError}
                />
              </div>
              <div className="dp-card dp-rise dp-d5">
                <ConversionsTrendBarChart points={conversionPoints} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSellModalOpen && (
        <SellModal
          currency={activeWallet.currency}
          balance={activeWallet.balance}
          symbol={activeWallet.symbol}
          targetCurrency={buyTargetCurrency}
          onClose={() => setIsSellModalOpen(false)}
          onSubmit={handleSellSubmit}
        />
      )}
      {isDepositModalOpen && (
        <DepositModal
          onClose={() => setIsDepositModalOpen(false)}
          defaultCurrency={activeWallet.currency as any}
        />
      )}
    </>
  );
};

export default DashboardPage;

/* ─── Helpers ─────────────────────────────────────────────── */
function make7Buckets(dayMs: number) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * dayMs);
    const start = new Date(d.toDateString()).getTime();
    return {
      start,
      end: start + dayMs,
      label: d.toLocaleDateString("en-GB", { weekday: "short" }),
      trades: 0,
      volume: 0,
    };
  });
}

function buildEmpty7(type: "activity" | "depwd" | "conv") {
  const now = new Date(),
    dayMs = 86400000;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * dayMs);
    const day = d.toLocaleDateString("en-GB", { weekday: "short" });
    if (type === "activity") return { day, trades: 0, volume: 0 };
    if (type === "depwd") return { day, deposits: 0, withdrawals: 0 };
    return { day, value: 0 };
  });
}
