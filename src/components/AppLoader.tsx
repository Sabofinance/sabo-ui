import React, { useEffect, useState } from 'react';
import '../assets/css/AppLoader.css';

const AppLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate realistic loading progress
    const steps = [
      { target: 30,  delay: 0   },
      { target: 55,  delay: 200 },
      { target: 75,  delay: 500 },
      { target: 90,  delay: 900 },
      { target: 100, delay: 1300 },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach(({ target, delay }) => {
      const t = setTimeout(() => {
        setProgress(target);
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="app-loader">

      {/* Background blobs */}
      <div className="loader-blob loader-blob-1" />
      <div className="loader-blob loader-blob-2" />

      {/* Centre content */}
      <div className="loader-content">

        {/* Logo */}
        <div className="loader-logo">
          <img src="/Sabo logo.png" alt="Sabo Finance" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Tagline */}
        <p className="loader-tagline">Your trusted currency exchange</p>

        {/* Progress bar */}
        <div className="loader-bar-track">
          <div
            className="loader-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage */}
        <span className="loader-percent">{progress}%</span>

      </div>

      {/* Bottom text */}
      <p className="loader-footer">Powered by Sabo &copy; {new Date().getFullYear()}</p>

    </div>
  );
};

export default AppLoader;