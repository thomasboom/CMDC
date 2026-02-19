import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marked } from 'marked';
import SkeletonLoader from './SkeletonLoader';

interface CommandAnalysis {
  explanation: string;
  safety: string;
  risks: string[];
  recommendations: string[];
}

interface CommandCheckerProps {
  darkMode?: boolean;
  customApiKey?: string | null;
}

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const CommandChecker: React.FC<CommandCheckerProps> = ({ darkMode = false, customApiKey = null }) => {
  const [command, setCommand] = useState<string>('');
  const [analysis, setAnalysis] = useState<CommandAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<'fast' | 'accurate' | 'pro'>(() => {
    return (localStorage.getItem('default_analysis_type') as 'fast' | 'accurate' | 'pro') || 'fast';
  });

  const analyzeCommand = async (selectedModelType: 'fast' | 'accurate' | 'pro') => {
    if (!command.trim()) {
      setError('Please enter a command to analyze');
      return;
    }

    const apiKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key is not set. Please add it in settings.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      let modelName: string;
      if (selectedModelType === 'fast') {
        modelName = 'gemini-2.5-flash-lite';
      } else if (selectedModelType === 'pro') {
        modelName = 'gemini-2.5-pro';
      } else {
        modelName = 'gemini-2.5-flash';
      }
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        Analyze the following command for safety and explain what it does:

        Command: ${command}

        Please provide the following:
        1. A short explanation of what this command does (maximum 4 sentences, each as a separate bullet point, using markdown formatting where appropriate)
        2. An assessment of its safety (safe, potentially dangerous, extremely dangerous)
        3. A list of specific risks associated with running this command (max 4 items, using markdown formatting where appropriate)
        4. Recommendations on whether it's safe to execute (max 4 items, using markdown formatting where appropriate)

        Format your response as JSON with these fields:
        {
          "explanation": "Short explanation with max 4 sentences separated by periods. Each sentence should be concise. Use markdown formatting (bold, code, etc.) where appropriate.",
          "safety": "Safe / Potentially Dangerous / Extremely Dangerous",
          "risks": ["risk1 with possible markdown formatting", "risk2 with possible markdown formatting", "risk3", "risk4 max"],
          "recommendations": ["recommendation1 with possible markdown formatting", "recommendation2 with possible markdown formatting", "recommendation3", "recommendation4 max"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let jsonString = '';

      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonString = codeBlockMatch[1].trim();
      } else {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonString = text.substring(jsonStart, jsonEnd).trim();
        }
      }

      if (jsonString) {
        let cleanedJsonString = jsonString
          .replace(/^\s*```json\s*/, '')
          .replace(/^\s*```\s*/, '')
          .replace(/\s*```\s*$/, '')
          .trim();

        const parsedAnalysis: CommandAnalysis = JSON.parse(cleanedJsonString);
        setAnalysis(parsedAnalysis);
      } else {
        throw new Error('Could not parse analysis from response');
      }
    } catch (err) {
      console.error('Error analyzing command:', err);
      if ((err as Error).name === 'SyntaxError') {
        setError('Failed to analyze command. Please try again.');
      } else {
        const errorMessage = (err as Error).message;
        if (errorMessage.includes('quota') && errorMessage.includes('gemini-2.5-pro')) {
          setError('Pro Analysis requires a paid Gemini API plan. Try Quick or Detailed Analysis.');
        } else if (errorMessage.includes('429')) {
          setError('Rate limit exceeded. Please wait or try a different analysis type.');
        } else {
          setError(`Failed to analyze command: ${errorMessage}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeCommand(analysisType);
  };

  const handleReset = () => {
    setAnalysis(null);
    setCommand('');
    setError(null);
  };

  const getSafetyClass = () => {
    if (!analysis) return '';
    const safety = analysis.safety.toLowerCase();
    if (safety.includes('safe') && !safety.includes('dangerous')) return 'safe';
    if (safety.includes('extremely dangerous')) return 'danger';
    return 'warning';
  };

  const renderMarkdown = (text: string) => {
    return { __html: marked.parseInline(text) as string };
  };

  if (loading && !analysis) {
    return <SkeletonLoader darkMode={darkMode} />;
  }

  if (analysis && !loading) {
    return (
      <section className="results-section">
        <div className={`safety-badge ${getSafetyClass()}`}>
          {getSafetyClass() === 'safe' ? <CheckIcon /> : getSafetyClass() === 'danger' ? <XIcon /> : <AlertIcon />}
          {analysis.safety}
        </div>

        <div className="results-grid">
          <div className="result-card">
            <h3 className="result-card-title">Explanation</h3>
            <div>
              {analysis.explanation
                .split('.')
                .map(s => s.trim())
                .filter(s => s !== '')
                .map((sentence, idx) => (
                  <div key={idx} className="result-item">
                    <span dangerouslySetInnerHTML={renderMarkdown(sentence)} />
                  </div>
                ))}
            </div>
          </div>

          <div className="result-card">
            <h3 className="result-card-title">Risks</h3>
            {analysis.risks.length > 0 ? (
              analysis.risks.map((risk, idx) => (
                <div key={idx} className="result-item">
                  <span dangerouslySetInnerHTML={renderMarkdown(risk)} />
                </div>
              ))
            ) : (
              <p className="no-items">No significant risks identified</p>
            )}
          </div>

          <div className="result-card">
            <h3 className="result-card-title">Recommendations</h3>
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="result-item">
                  <span dangerouslySetInnerHTML={renderMarkdown(rec)} />
                </div>
              ))
            ) : (
              <p className="no-items">No specific recommendations</p>
            )}
          </div>
        </div>

        <button className="new-analysis-btn" onClick={handleReset}>
          <ArrowLeftIcon />
          New Analysis
        </button>
      </section>
    );
  }

  return (
    <div className="command-input-section">
      <form onSubmit={handleAnalyze}>
        <label className="input-label" htmlFor="command">Enter a command to analyze</label>
        <textarea
          id="command"
          className="command-textarea"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="rm -rf /, sudo apt install ..., curl ... | sh"
          rows={5}
        />
        
        <div className="action-bar">
          <button
            type="submit"
            className="analyze-btn"
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
          
          <div className="type-selector">
            <button
              type="button"
              className={`type-btn ${analysisType === 'fast' ? 'active' : ''}`}
              onClick={() => setAnalysisType('fast')}
              disabled={loading}
            >
              Quick
            </button>
            <button
              type="button"
              className={`type-btn ${analysisType === 'accurate' ? 'active' : ''}`}
              onClick={() => setAnalysisType('accurate')}
              disabled={loading}
            >
              Detailed
            </button>
            <button
              type="button"
              className={`type-btn ${analysisType === 'pro' ? 'active' : ''}`}
              onClick={() => setAnalysisType('pro')}
              disabled={loading}
            >
              Pro
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default CommandChecker;
