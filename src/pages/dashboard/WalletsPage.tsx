import React, { useEffect, useState } from "react";
import { ratesApi, walletsApi } from "../../lib/api";
import { extractArray } from "../../lib/api/response";
import { useNavigate } from "react-router-dom";

type WalletItem = Record<string, unknown>;

const C = {
  lime: "#C8F135",
  dark: "#0d1f1e",
  bg: "#f5f9f8",
  surface: "#ffffff",
  border: "#e0ebe9",
  muted: "#7a9c99",
  light: "#b0ccc9",
  error: "#e05252",
};

const PALETTE = ["#C8F135", "#32D4F0", "#F032D4", "#F09E32"];

const CURRENCY_FLAG: Record<string, string> = {
  NGN: "🇳🇬",
  USD: "🇺🇸",
  GBP: "🇬🇧",
  CAD: "🇨🇦",
  EUR: "🇪🇺",
};

const CURRENCY_SYMBOL: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  CAD: "CA$",
  EUR: "€",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const fmtShort = (n: number) => new Intl.NumberFormat().format(n);

const WalletsPage: React.FC = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rateToNGN, setRateToNGN] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await walletsApi.list();
        if (response.success) {
          const walletList = extractArray(response.data);
          setWallets(walletList);
          if (walletList.length > 0) {
            setSelectedWalletId(
              String(walletList[0].id || walletList[0].currency),
            );
          }
          const currencySet = new Set(
            walletList
              .map((w) =>
                String((w as Record<string, unknown>).currency || "NGN"),
              )
              .filter((c) => c && c !== "NGN"),
          );
          const currencies = Array.from(currencySet);
          if (currencies.length) {
            const results = await Promise.all(
              currencies.map(async (c) => {
                const res = await ratesApi.getByPair("NGN", c);
                if (!res.success) return [c, 0] as const;
                const d = res.data as any;
                const v = Number(d?.rate ?? d?.value ?? 0);
                return [c, v] as const;
              }),
            );
            const nextRateToNGN: Record<string, number> = {};
            for (const [c, v] of results) nextRateToNGN[c] = v;
            setRateToNGN(nextRateToNGN);
          } else {
            setRateToNGN({});
          }
        } else if (!response.success) {
          setError(response.error?.message || "Failed to load wallets");
        }
      } catch (err: any) {
        setError("An unexpected error occurred while loading wallets");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const selected =
    wallets.find((w) => String(w.id || w.currency) === selectedWalletId) ||
    null;

  const totalBalanceInNGN = wallets.reduce((sum, w) => {
    const balance = Number(w.balance || 0);
    const currency = String(w.currency || "NGN");
    if (currency === "NGN") return sum + balance;
    const rate = rateToNGN[currency];
    return sum + balance * (Number.isFinite(rate) && rate > 0 ? rate : 0);
  }, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .wlt * { font-family: 'DM Sans', -apple-system, sans-serif; box-sizing: border-box; }

        @keyframes walletShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes wltFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .wlt { min-height: 100vh; background: ${C.bg}; padding: 36px 32px; }

        /* header */
        .wlt-header { display: flex; align-items: flex-end; justify-content: space-between;
          gap: 16px; flex-wrap: wrap; margin-bottom: 32px;
          animation: wltFadeUp 0.35s ease both; }
        .wlt-header-left { display: flex; align-items: center; gap: 14px; }
        .wlt-header-icon { width: 48px; height: 48px; border-radius: 14px;
          background: ${C.dark}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .wlt-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: ${C.muted}; margin-bottom: 4px; }
        .wlt-title { font-size: 26px; font-weight: 800; color: ${C.dark};
          letter-spacing: -0.5px; margin: 0; line-height: 1.15; }
        .wlt-subtitle { font-size: 13px; color: ${C.muted}; margin: 0; font-weight: 500; }

        .wlt-add-btn { display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 20px; border-radius: 12px; border: none;
          background: ${C.lime}; color: ${C.dark}; font-size: 14px; font-weight: 800;
          cursor: pointer; letter-spacing: -0.2px; font-family: inherit;
          transition: transform 0.12s ease, box-shadow 0.12s ease; white-space: nowrap; }
        .wlt-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(200,241,53,0.4); }
        .wlt-add-btn:active { transform: translateY(0); }

        /* portfolio hero */
        .wlt-portfolio-card {
          background: ${C.dark}; border-radius: 20px; padding: 28px 28px 22px;
          margin-bottom: 20px; position: relative; overflow: hidden;
          animation: wltFadeUp 0.4s ease 0.05s both;
        }
        .wlt-portfolio-card::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(200,241,53,0.06); pointer-events: none;
        }
        .wlt-portfolio-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: ${C.light}; margin-bottom: 8px; }
        .wlt-portfolio-amount { font-size: 36px; font-weight: 800; color: #fff;
          letter-spacing: -1px; margin-bottom: 4px; }
        .wlt-portfolio-sub { font-size: 12px; color: ${C.light}; font-weight: 500; margin-bottom: 20px; }

        /* distribution bar */
        .wlt-dist-bar { height: 8px; width: 100%; border-radius: 4px;
          overflow: hidden; display: flex; gap: 2px; background: rgba(255,255,255,0.08); }
        .wlt-dist-segment { height: 100%; border-radius: 4px; transition: width 0.4s ease; }

        /* legend */
        .wlt-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; }
        .wlt-legend-item { display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: ${C.light}; font-weight: 600; }
        .wlt-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* wallet cards grid */
        .wlt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px; margin-bottom: 24px; animation: wltFadeUp 0.45s ease 0.1s both; }

        .wlt-wallet-card { background: ${C.surface}; border: 2px solid ${C.border};
          border-radius: 16px; padding: 18px; cursor: pointer;
          transition: all 0.15s ease; position: relative; overflow: hidden; }
        .wlt-wallet-card:hover { border-color: ${C.light}; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(13,31,30,0.07); }
        .wlt-wallet-card.active { border-color: ${C.lime};
          background: rgba(200,241,53,0.04); }
        .wlt-wallet-card.active::after {
          content: ''; position: absolute; top: 0; right: 0;
          width: 0; height: 0;
          border-top: 24px solid ${C.lime};
          border-left: 24px solid transparent;
        }

        .wlt-wcard-flag { font-size: 24px; margin-bottom: 10px; display: block; }
        .wlt-wcard-currency { font-size: 13px; font-weight: 800; color: ${C.dark};
          letter-spacing: 0.03em; margin-bottom: 2px; }
        .wlt-wcard-balance { font-size: 18px; font-weight: 800; color: ${C.dark};
          letter-spacing: -0.4px; margin-top: 6px; }
        .wlt-wcard-label { font-size: 10px; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; color: ${C.muted}; }
        .wlt-status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: ${C.lime}; margin-right: 5px; vertical-align: middle; }

        /* detail panel */
        .wlt-detail-panel { background: ${C.surface}; border: 1px solid ${C.border};
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(13,31,30,0.05);
          animation: wltFadeUp 0.3s ease both; }
        .wlt-detail-header { background: ${C.dark}; padding: 20px 24px;
          display: flex; align-items: center; gap: 12px; }
        .wlt-detail-accent { width: 4px; height: 32px; background: ${C.lime};
          border-radius: 2px; flex-shrink: 0; }
        .wlt-detail-title { font-size: 15px; font-weight: 800; color: #fff;
          letter-spacing: -0.3px; margin: 0; }
        .wlt-detail-sub { font-size: 12px; color: ${C.light}; margin: 3px 0 0; font-weight: 500; }
        .wlt-detail-body { padding: 22px 24px; }
        .wlt-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .wlt-detail-field { }
        .wlt-detail-field-label { font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
          text-transform: uppercase; color: ${C.muted}; margin-bottom: 6px; }
        .wlt-detail-field-value { font-size: 15px; font-weight: 700; color: ${C.dark}; }
        .wlt-detail-footer { display: flex; justify-content: flex-end;
          padding: 16px 24px; border-top: 1px solid ${C.border}; }
        .wlt-history-btn { display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 20px; border-radius: 12px; border: none;
          background: ${C.lime}; color: ${C.dark}; font-size: 14px; font-weight: 800;
          cursor: pointer; font-family: inherit; letter-spacing: -0.2px;
          transition: transform 0.12s ease, box-shadow 0.12s ease; }
        .wlt-history-btn:hover { transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,241,53,0.4); }

        /* section label */
        .wlt-section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.09em;
          text-transform: uppercase; color: ${C.muted}; margin-bottom: 12px; }

        /* loading / error */
        .wlt-center { padding: 80px 20px; text-align: center; }
        .wlt-error-text { color: ${C.error}; font-size: 15px; font-weight: 600; }
        .wlt-loading-dots { display: inline-flex; gap: 6px; }
        .wlt-loading-dot { width: 8px; height: 8px; border-radius: 50%;
          background: ${C.lime}; animation: wltBounce 0.9s ease infinite; }
        .wlt-loading-dot:nth-child(2) { animation-delay: 0.15s; }
        .wlt-loading-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes wltBounce {
          0%,80%,100% { transform: scale(0.7); opacity: 0.5; }
          40%          { transform: scale(1);   opacity: 1; }
        }

        @media (max-width: 640px) {
          .wlt { padding: 20px 16px; }
          .wlt-portfolio-amount { font-size: 26px; }
          .wlt-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="wlt">
        {loading ? (
          <div className="wlt-center">
            <div className="wlt-loading-dots">
              <div className="wlt-loading-dot" />
              <div className="wlt-loading-dot" />
              <div className="wlt-loading-dot" />
            </div>
            <p
              style={{
                color: C.muted,
                marginTop: 16,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Loading wallets…
            </p>
          </div>
        ) : error ? (
          <div className="wlt-center">
            <p className="wlt-error-text">⚠ {error}</p>
          </div>
        ) : (
          <>
            {/* ── header ── */}
            <div className="wlt-header">
              <div className="wlt-header-left">
                <div className="wlt-header-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={C.lime}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="3" />
                    <path d="M16 7V5a2 2 0 0 0-4 0v2" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                    <circle cx="12" cy="16" r="1" fill={C.lime} stroke="none" />
                  </svg>
                </div>
                <div>
                  <div className="wlt-eyebrow">Finance</div>
                  <h1 className="wlt-title">My Wallets</h1>
                  <p className="wlt-subtitle">Manage your currency balances</p>
                </div>
              </div>
              <button className="wlt-add-btn">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add New Wallet
              </button>
            </div>

            {/* ── portfolio hero ── */}
            <div className="wlt-portfolio-card">
              <div className="wlt-portfolio-eyebrow">Total Portfolio Value</div>
              <div className="wlt-portfolio-amount">
                ₦{fmtShort(totalBalanceInNGN)}
              </div>
              <div className="wlt-portfolio-sub">
                Estimated in NGN across all wallets
              </div>

              {/* distribution bar */}
              <div className="wlt-dist-bar">
                {wallets.map((w, idx) => {
                  const balance = Number(w.balance || 0);
                  const currency = String(w.currency || "NGN");
                  const valueInNGN =
                    currency === "NGN"
                      ? balance
                      : balance *
                        (Number.isFinite(rateToNGN[currency]) &&
                        (rateToNGN[currency] ?? 0) > 0
                          ? rateToNGN[currency]
                          : 0);
                  const pct =
                    totalBalanceInNGN > 0
                      ? (valueInNGN / totalBalanceInNGN) * 100
                      : 0;
                  return (
                    <div
                      key={idx}
                      className="wlt-dist-segment"
                      style={{
                        width: `${pct}%`,
                        background: PALETTE[idx % PALETTE.length],
                      }}
                      title={`${currency}: ${balance}`}
                    />
                  );
                })}
              </div>

              <div className="wlt-legend">
                {wallets.map((w, idx) => (
                  <span key={idx} className="wlt-legend-item">
                    <span
                      className="wlt-legend-dot"
                      style={{ background: PALETTE[idx % PALETTE.length] }}
                    />
                    {String(w.currency)} ({fmtShort(Number(w.balance || 0))})
                  </span>
                ))}
              </div>
            </div>

            {/* ── wallet cards ── */}
            <div className="wlt-section-label">Your Wallets</div>
            <div className="wlt-grid">
              {wallets.map((wallet) => {
                const wid = String(wallet.id || wallet.currency);
                const currency = String(wallet.currency || "");
                const available = Number(
                  (wallet as any).available_balance ??
                    (wallet as any).availableBalance ??
                    (wallet as any).available ??
                    (wallet as any).balance ??
                    0,
                );
                const isActive = selectedWalletId === wid;
                return (
                  <div
                    key={wid}
                    className={`wlt-wallet-card ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedWalletId(wid)}
                  >
                    <span className="wlt-wcard-flag">
                      {CURRENCY_FLAG[currency] || "💰"}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span className="wlt-wcard-currency">{currency}</span>
                      <span
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          fontWeight: 600,
                        }}
                      >
                        <span
                          className="wlt-status-dot"
                          style={{
                            background:
                              String(
                                wallet.status || "active",
                              ).toLowerCase() === "active"
                                ? C.lime
                                : C.error,
                          }}
                        />
                        {String(wallet.status || "active")}
                      </span>
                    </div>
                    <div className="wlt-wcard-label" style={{ marginTop: 10 }}>
                      Available
                    </div>
                    <div className="wlt-wcard-balance">
                      {CURRENCY_SYMBOL[currency] || String(wallet.symbol || "")}
                      {fmt(available)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── detail panel ── */}
            {selected && (
              <>
                <div className="wlt-section-label" style={{ marginTop: 8 }}>
                  Wallet Details
                </div>
                <div className="wlt-detail-panel">
                  <div className="wlt-detail-header">
                    <div className="wlt-detail-accent" />
                    <div>
                      <p className="wlt-detail-title">
                        {CURRENCY_FLAG[String(selected.currency)] || "💰"}{" "}
                        {String(selected.currency)} Wallet
                      </p>
                      <p className="wlt-detail-sub">
                        Account information and banking details
                      </p>
                    </div>
                  </div>
                  <div className="wlt-detail-body">
                    <div className="wlt-detail-grid">
                      {[
                        {
                          label: "Available Balance",
                          value: `${CURRENCY_SYMBOL[String(selected.currency)] || ""}${fmt(Number((selected as any).available_balance ?? (selected as any).availableBalance ?? (selected as any).balance ?? 0))}`,
                        },
                        {
                          label: "Locked Balance",
                          value: `${CURRENCY_SYMBOL[String(selected.currency)] || ""}${fmt(Number((selected as any).locked_balance ?? (selected as any).lockedBalance ?? (selected as any).locked ?? 0))}`,
                        },
                        {
                          label: "Status",
                          value: String(selected.status || "Active"),
                          isStatus: true,
                        },
                      ].map(({ label, value, isStatus }) => (
                        <div key={label} className="wlt-detail-field">
                          <div className="wlt-detail-field-label">{label}</div>
                          <div
                            className="wlt-detail-field-value"
                            style={isStatus ? { color: "#4a7a00" } : undefined}
                          >
                            {isStatus && <span className="wlt-status-dot" />}
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="wlt-detail-footer">
                    <button
                      className="wlt-history-btn"
                      onClick={() =>
                        navigate(
                          `/dashboard/wallets/${String(selected.currency || "").toUpperCase()}`,
                        )
                      }
                    >
                      View Wallet History →
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default WalletsPage;
