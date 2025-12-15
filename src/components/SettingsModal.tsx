import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onApiKeyChange: (apiKey: string) => void;
  currentApiKey: string | null;
  onSettingsSaved?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onApiKeyChange,
  currentApiKey,
  onSettingsSaved
}) => {
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    if (currentApiKey) {
      setApiKey(currentApiKey);
    }
  }, [currentApiKey]);

  const handleSave = () => {
    // Save to local storage and state
    onApiKeyChange(apiKey);
    localStorage.setItem('custom_gemini_api_key', apiKey);

    // Close the modal
    onClose();

    // Notify parent component
    if (onSettingsSaved) {
      onSettingsSaved();
    }
  };

  const handleReset = () => {
    setApiKey('');
    onApiKeyChange('');
    localStorage.removeItem('custom_gemini_api_key');

    // Close the modal
    onClose();

    // Notify parent component
    if (onSettingsSaved) {
      onSettingsSaved();
    }
  };

  const handleRemoveApiKey = () => {
    setApiKey('');
    onApiKeyChange('');
    localStorage.removeItem('custom_gemini_api_key');

    // Close the modal
    onClose();

    // Notify parent component
    if (onSettingsSaved) {
      onSettingsSaved();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal fade show d-block ${darkMode ? 'modal-dark' : ''}`} tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className={`modal-content ${darkMode ? 'bg-dark text-light border-light' : 'bg-white'}`}>
          <div className={`modal-header ${darkMode ? 'border-light' : 'border-dark'}`}>
            <h5 className={`modal-title ${darkMode ? 'text-light' : 'text-dark'}`}>
              <i className="fas fa-cog me-2"></i>Settings
            </h5>
            <button 
              type="button" 
              className={`btn-close ${darkMode ? 'btn-close-white' : ''}`} 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className={`modal-body ${darkMode ? 'bg-dark text-light' : 'bg-white'}`}>
            <div className="mb-4">
              <label htmlFor="api-key-input" className={`form-label fw-semibold ${darkMode ? 'text-light' : 'text-dark'}`}>
                <i className="fas fa-key me-2"></i>Custom Gemini API Key
              </label>
              <input
                type="password"
                id="api-key-input"
                className={`form-control ${darkMode ? 'bg-dark text-light border-light' : 'border-dark'}`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key..."
              />
              <div className={`form-text ${darkMode ? 'text-muted' : 'text-muted'}`}>
                Using your own API key will provide higher rate limits and better performance.
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="default-analysis-type" className={`form-label fw-semibold ${darkMode ? 'text-light' : 'text-dark'}`}>
                <i className="fas fa-cogs me-2"></i>Default Button Analysis Type
              </label>
              <select
                id="default-analysis-type"
                className={`form-select ${darkMode ? 'bg-dark text-light border-light' : 'border-dark'}`}
                value={localStorage.getItem('default_analysis_type') || 'fast'}
                onChange={(e) => {
                  localStorage.setItem('default_analysis_type', e.target.value);
                }}
                disabled={!currentApiKey}
              >
                <option value="fast">Quick Analysis (gemini-2.5-flash-lite)</option>
                <option value="accurate">Detailed Analysis (gemini-2.5-flash)</option>
              </select>
              <div className={`form-text ${darkMode ? 'text-muted' : 'text-muted'}`}>
                {currentApiKey
                  ? 'Choose which type of analysis runs when clicking the main button'
                  : 'Custom API key required to change analysis type'
                }
              </div>
            </div>

            <div className={`alert alert-info ${darkMode ? 'bg-primary bg-opacity-10 text-light border-light' : 'bg-info bg-opacity-10 text-dark'}`}>
              <i className="fas fa-info-circle me-2"></i>
              To get a Gemini API key, visit{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className={darkMode ? 'text-light' : 'text-dark'}
              >
                Google AI Studio
              </a>{' '}
              and create an API key.
            </div>
          </div>
          <div className={`modal-footer flex-column ${darkMode ? 'border-light' : 'border-dark'}`}>
            <button
              type="button"
              className={`btn w-100 mb-2 ${darkMode ? 'btn-outline-danger' : 'btn-outline-danger'}`}
              onClick={handleRemoveApiKey}
              disabled={!currentApiKey}
            >
              <i className="fas fa-trash me-2"></i>Remove API Key
            </button>
            <button
              type="button"
              className={`btn w-100 mb-2 ${darkMode ? 'btn-outline-light text-light' : 'btn-outline-secondary'}`}
              onClick={handleReset}
            >
              <i className="fas fa-undo me-2"></i>Reset
            </button>
            <button
              type="button"
              className={`btn w-100 ${darkMode ? 'btn-light text-dark' : 'btn-dark'}`}
              onClick={handleSave}
            >
              <i className="fas fa-save me-2"></i>Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;