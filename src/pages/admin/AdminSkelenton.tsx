
export const AdminSkeleton = () => (
  <>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -600px 0; }
        100% { background-position: 600px 0; }
      }
      .skel {
        background: linear-gradient(90deg, var(--skel-base) 25%, var(--skel-shine) 50%, var(--skel-base) 75%);
        background-size: 600px 100%;
        animation: shimmer 1.4s ease-in-out infinite;
        border-radius: 6px;
      }
      .adm-skeleton {
        --skel-base: #0A1E28;
        --skel-shine: #f4f5f8;
      }
    
      }
    `}</style>

    <div
      className="adm-skeleton"
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Stat cards row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--skel-base)",
              borderRadius: 10,
              padding: "18px 20px",
            }}
          >
            <div
              className="skel"
              style={{ height: 11, width: "55%", marginBottom: 14 }}
            />
            <div className="skel" style={{ height: 26, width: "70%" }} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--skel-base)",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
            gap: 16,
            padding: "12px 20px",
            background: "var(--skel-base)",
          }}
        >
          {[80, 110, 60, 60, 70].map((w, i) => (
            <div key={i} className="skel" style={{ height: 10, width: w }} />
          ))}
        </div>

        {/* Table rows */}
        {[...Array(6)].map((_, row) => (
          <div
            key={row}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr",
              gap: 16,
              padding: "16px 20px",
              borderTop: "1px solid var(--skel-base)",
              alignItems: "center",
            }}
          >
            {/* Name + email cell */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="skel"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skel"
                  style={{ height: 10, width: "70%", marginBottom: 6 }}
                />
                <div className="skel" style={{ height: 9, width: "90%" }} />
              </div>
            </div>
            <div className="skel" style={{ height: 10, width: "60%" }} />
            <div
              className="skel"
              style={{ height: 22, width: 64, borderRadius: 20 }}
            />
            <div
              className="skel"
              style={{ height: 22, width: 58, borderRadius: 20 }}
            />
            <div
              className="skel"
              style={{ height: 28, width: 72, borderRadius: 6 }}
            />
          </div>
        ))}
      </div>
    </div>
  </>
);