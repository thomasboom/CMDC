import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onApiKeyChange: (apiKey: string) => void;
  currentApiKey: string | null;
  onSettingsSaved?: () => void;
}

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

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
    onApiKeyChange(apiKey);
    localStorage.setItem('custom_gemini_api_key', apiKey);
    onClose();
    if (onSettingsSaved) {
      onSettingsSaved();
    }
  };

  const handleRemove = () => {
    setApiKey('');
    onApiKeyChange('');
    localStorage.removeItem('custom_gemini_api_key');
    onClose();
    if (onSettingsSaved) {
      onSettingsSaved();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.4)',
          zIndex: 999
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem',
            fontWeight: 400,
            color: 'var(--text)',
            letterSpacing: '-0.01em'
          }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="api-key-input"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text)',
              marginBottom: '8px'
            }}
          >
            Gemini API Key
          </label>
          <input
            type="password"
            id="api-key-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key..."
            style={{
              width: '100%',
              padding: '12px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)',
              outline: 'none'
            }}
          />
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
            marginTop: '8px',
            lineHeight: 1.5
          }}>
            Use your own API key for higher rate limits.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="default-analysis-type"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text)',
              marginBottom: '8px'
            }}
          >
            Default Analysis Type
          </label>
          <select
            id="default-analysis-type"
            value={localStorage.getItem('default_analysis_type') || 'fast'}
            onChange={(e) => localStorage.setItem('default_analysis_type', e.target.value)}
            disabled={!currentApiKey}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '0.875rem',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: currentApiKey ? 'var(--text)' : 'var(--text-tertiary)',
              cursor: currentApiKey ? 'pointer' : 'not-allowed',
              outline: 'none'
            }}
          >
            <option value="fast">Quick (Flash Lite)</option>
            <option value="accurate">Detailed (Flash)</option>
            <option value="pro">Pro (Pro)</option>
          </select>
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
            marginTop: '8px',
            lineHeight: 1.5
          }}>
            {currentApiKey 
              ? 'Which analysis runs by default' 
              : 'Add an API key to change this setting'}
          </p>
        </div>

        <div style={{
          padding: '14px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '24px',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          Get an API key at{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text)',
              textDecoration: 'underline'
            }}
          >
            Google AI Studio
          </a>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          {currentApiKey && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: 'transparent',
                color: 'var(--safety-danger)',
                border: '1px solid var(--safety-danger)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              Remove Key
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: 'var(--text)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsModal;
