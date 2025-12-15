import React, { useState } from 'react';
import CommandChecker from './components/CommandChecker';
import './App.css';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
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
      <div className="container py-4">
        <nav className="navbar navbar-expand-lg mb-5">
          <div className="container-fluid">
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
            </div>
          </div>
        </nav>

        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <CommandChecker darkMode={darkMode} />

            <footer className={`mt-5 pt-4 border-top text-center ${darkMode ? 'text-muted' : 'text-muted'}`}>
              <p>Powered by Google Gemini AI • Always verify critical commands before execution</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;