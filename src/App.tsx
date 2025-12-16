import React, { useState } from 'react';
import CommandChecker from './components/CommandChecker';
import SettingsModal from './components/SettingsModal';
import './App.css';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string | null>(() => {
    return localStorage.getItem('custom_gemini_api_key');
  });
  const [showNotification, setShowNotification] = useState<boolean>(false);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleApiKeyChange = (apiKey: string) => {
    const newApiKey = apiKey || null; // Convert empty string to null
    setCustomApiKey(newApiKey);
  };

  // This function will be called when settings are saved
  const handleSettingsSaved = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Apply theme class to body when darkMode changes
  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className={`min-vh-100 ${darkMode ? 'dark-mode' : ''}`}>
      <div className="py-4">
        <nav className="navbar navbar-expand-lg mb-5">
          <div className="container">
            <div className="d-flex align-items-center">
              <h1 className={`h3 mb-0 brand-title`}>
                <i className="fas fa-shield-alt me-2"></i>CMDC
              </h1>
              <div className="ms-3">
                <span className="badge bg-light text-dark">
                  BETA
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <button
                className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'} me-3`}
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>

              <button
                className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                onClick={() => setSettingsOpen(true)}
                aria-label="Open settings"
              >
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </nav>

        <div className="container-xl px-4">
          <CommandChecker darkMode={darkMode} customApiKey={customApiKey} />
        </div>

        <div className="container">
          <footer className={`mt-5 pt-4 border-top text-center ${darkMode ? 'text-muted' : 'text-muted'}`}>
            <small>
              This analysis is powered by artificial intelligence. We take measures to ensure accuracy, but always verify critical commands with a professional before execution. We are not responsible for any damages.
            </small>
          </footer>
        </div>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        onApiKeyChange={handleApiKeyChange}
        currentApiKey={customApiKey}
        onSettingsSaved={handleSettingsSaved}
      />

      {/* Snackbar notification */}
      {showNotification && (
        <div
          className={`position-fixed bottom-0 end-0 m-3 p-3 rounded-3 shadow ${darkMode ? 'bg-success text-light' : 'bg-success text-light'}`}
          style={{ zIndex: 1050 }}
        >
          <div className="d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            <span>Settings saved successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;