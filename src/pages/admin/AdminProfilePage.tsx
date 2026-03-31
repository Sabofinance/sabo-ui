import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { adminApi } from "../../lib/api";
import { useAdminAuth } from "../../context/AdminAuthContext";

const CSS = `
.adm-profile-card { background: #fff; border: 1px solid #e3e8f0; border-radius: 20px; padding: 40px; max-width: 600px; margin: 40px auto; box-shadow: 0 4px 16px rgba(13,24,41,0.08); }
.adm-profile-header { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 30px; }
.adm-profile-avatar-wrap { position: relative; width: 120px; height: 120px; }
.adm-profile-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid #7cb800; background: #eef9cc; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: #7cb800; }
.adm-profile-upload-btn { position: absolute; bottom: 0; right: 0; background: #0d1829; color: #fff; width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.adm-profile-info { width: 100%; }
.adm-profile-item { display: flex; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #e3e8f0; }
.adm-profile-label { color: #6b7a99; font-size: 14px; }
.adm-profile-value { color: #0d1829; font-weight: 600; font-size: 14px; }
`;

const AdminProfilePage: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    const res = await adminApi.getProfile();
    if (res.success) setProfile(res.data);
    else toast.error("Failed to load profile");
    setLoading(false);
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await adminApi.updateProfilePicture(formData);
    if (res.success) {
      toast.success("Profile picture updated");
      void loadProfile();
    } else {
      toast.error(res.error?.message || "Upload failed");
    }
    setUploading(false);
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>Loading profile...</div>
    );

  const displayUser = profile || adminUser;
  const initials =
    displayUser?.name
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div style={{ padding: 24 }}>
      <style>{CSS}</style>
      <div className="adm-profile-card">
        <div className="adm-profile-header">
          <div className="adm-profile-avatar-wrap">
            {displayUser?.avatarUrl ? (
              <img
                src={displayUser.avatarUrl}
                alt="Avatar"
                className="adm-profile-avatar"
              />
            ) : (
              <div className="adm-profile-avatar">{initials}</div>
            )}
            <label className="adm-profile-upload-btn">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
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
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </label>
          </div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>
              {displayUser?.name}
            </h2>
            <p style={{ color: "#6b7a99", textTransform: "capitalize" }}>
              {displayUser?.role?.replace("_", " ")}
            </p>
          </div>
        </div>

        <div className="adm-profile-info">
          <div className="adm-profile-item">
            <span className="adm-profile-label">Email Address</span>
            <span className="adm-profile-value">{displayUser?.email}</span>
          </div>
          <div className="adm-profile-item">
            <span className="adm-profile-label">Admin ID</span>
            <span className="adm-profile-value">#{displayUser?.id}</span>
          </div>
          <div className="adm-profile-item">
            <span className="adm-profile-label">Permissions</span>
            <span
              className="adm-profile-value"
              style={{ textTransform: "capitalize" }}
            >
              {displayUser?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
