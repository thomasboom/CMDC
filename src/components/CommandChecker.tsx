import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marked } from 'marked';
import SkeletonLoader from './SkeletonLoader';

interface CommandAnalysis {
  explanation: string; // This will be a string with sentences separated by periods
  safety: string;
  risks: string[];
  recommendations: string[];
}

interface CommandCheckerProps {
  darkMode?: boolean;
  customApiKey?: string | null;
}

const CommandChecker: React.FC<CommandCheckerProps> = ({ darkMode = false, customApiKey = null }) => {
  const [command, setCommand] = useState<string>('');
  const [analysis, setAnalysis] = useState<CommandAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCommand = async (selectedModelType: 'fast' | 'accurate') => {
    if (!command.trim()) {
      setError('Please enter a command to analyze');
      return;
    }

    // Get API key - prefer custom API key if available, otherwise use environment variable
    const apiKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key is not set. Please add it to your environment variables or configure a custom key in settings.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Use different models based on user selection
      const modelName = selectedModelType === 'fast' ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });

      // Create a detailed prompt for command analysis
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

      // Improved JSON extraction from the response
      let jsonString = '';

      // First, try to find JSON wrapped in triple backticks (common in AI responses)
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonString = codeBlockMatch[1].trim();
      } else {
        // If no code block found, try extracting JSON between braces
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonString = text.substring(jsonStart, jsonEnd).trim();
        }
      }

      if (jsonString) {
        // Attempt to clean up the JSON string to handle common AI response formatting issues
        let cleanedJsonString = jsonString
          .replace(/^\s*```json\s*/, '')  // Remove leading ```json
          .replace(/^\s*```\s*/, '')     // Remove leading ```
          .replace(/\s*```\s*$/, '')     // Remove trailing ```
          .trim();

        // Parse the cleaned JSON string
        const parsedAnalysis: CommandAnalysis = JSON.parse(cleanedJsonString);
        setAnalysis(parsedAnalysis);
      } else {
        throw new Error('Could not parse analysis from response');
      }
    } catch (err) {
      console.error('Error analyzing command:', err);
      // If it's a JSON parsing error, provide more specific information
      if ((err as Error).name === 'SyntaxError') {
        setError(`Failed to analyze command: Invalid JSON format in AI response. This may be due to an incomplete or malformed response from the AI service. Try running the analysis again.`);
      } else {
        setError(`Failed to analyze command: ${(err as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMainButtonAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultAnalysisType = localStorage.getItem('default_analysis_type') || 'fast';
    analyzeCommand(defaultAnalysisType as 'fast' | 'accurate');
  };


  const safetyLevelClass = (safety: string) => {
    if (darkMode) {
      switch(safety.toLowerCase()) {
        case 'safe':
          return 'text-light fw-bold';
        case 'potentially dangerous':
          return 'text-light fw-bold';
        case 'extremely dangerous':
          return 'text-light fw-bold';
        default:
          return 'text-light fw-bold';
      }
    } else {
      switch(safety.toLowerCase()) {
        case 'safe':
          return 'text-dark fw-bold';
        case 'potentially dangerous':
          return 'text-dark fw-bold';
        case 'extremely dangerous':
          return 'text-dark fw-bold';
        default:
          return 'text-dark fw-bold';
      }
    }
  };

  const getSafetyColorClasses = (safety: string) => {
    if (darkMode) {
      switch(safety.toLowerCase()) {
        case 'safe':
          return 'bg-success bg-opacity-10 text-light';
        case 'potentially dangerous':
          return 'bg-warning bg-opacity-10 text-light';
        case 'extremely dangerous':
          return 'bg-danger bg-opacity-10 text-light';
        default:
          return 'bg-dark text-light';
      }
    } else {
      switch(safety.toLowerCase()) {
        case 'safe':
          return 'bg-success bg-opacity-10 text-dark';
        case 'potentially dangerous':
          return 'bg-warning bg-opacity-10 text-dark';
        case 'extremely dangerous':
          return 'bg-danger bg-opacity-10 text-dark';
        default:
          return 'bg-light text-dark';
      }
    }
  };

  const getCardHeaderClasses = (section: 'explanation' | 'risks' | 'recommendations') => {
    if (darkMode) {
      switch(section) {
        case 'explanation':
          return 'bg-dark text-light border-bottom border-light';
        case 'risks':
          return 'bg-dark text-light border-bottom border-light';
        case 'recommendations':
          return 'bg-dark text-light border-bottom border-light';
        default:
          return 'bg-dark text-light border-bottom border-light';
      }
    } else {
      switch(section) {
        case 'explanation':
          return 'bg-light text-dark border-bottom border-dark';
        case 'risks':
          return 'bg-light text-dark border-bottom border-dark';
        case 'recommendations':
          return 'bg-light text-dark border-bottom border-dark';
        default:
          return 'bg-light text-dark border-bottom border-dark';
      }
    }
  };

  if (loading && !analysis) {
    // Show skeleton loader while loading but no analysis is available yet
    return <SkeletonLoader darkMode={darkMode} />;
  }

  if (analysis && !loading) {
    // Display only the analysis results without input fields
    return (
      <div className={`card shadow-sm ${darkMode ? 'bg-dark text-light border-light' : 'bg-white'}`}>
        <div className="card-body p-4">
          <div className="mb-4">
            <h2 className={`h4 mb-1 ${darkMode ? 'text-light' : 'text-dark'}`}>
              <i className="fas fa-clipboard-list me-2"></i>Your Command Analysis
            </h2>
          </div>

          <div className={`${getSafetyColorClasses(analysis.safety)} p-4 mb-4 rounded-3 text-center border ${darkMode ? 'border-light' : 'border-dark'}`}>
            <div className="d-flex align-items-center justify-content-center flex-wrap">
              <i className={`me-3 ${
                analysis.safety.toLowerCase().includes('safe') ? (darkMode ? 'text-success' : 'text-success') :
                analysis.safety.toLowerCase().includes('dangerous') ? (darkMode ? 'text-danger' : 'text-danger') : (darkMode ? 'text-warning' : 'text-warning')
              }`}>
                {analysis.safety.toLowerCase().includes('safe') ?
                  <i className="fas fa-shield-alt fa-2x"></i> :
                  analysis.safety.toLowerCase().includes('dangerous') && analysis.safety.toLowerCase().includes('extremely') ?
                  <i className="fas fa-skull-crossbones fa-2x"></i> :
                  <i className="fas fa-exclamation-triangle fa-2x"></i>}
              </i>
              <div>
                <span className={`fs-3 fw-bold ${safetyLevelClass(analysis.safety)}`} style={{color: darkMode ? 'var(--mono-darker)' : 'var(--mono-text)'}}>
                  {analysis.safety}*
                </span>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Make all cards full width for better readability */}
            <div className="col-12">
              <div className={`card h-100 ${darkMode ? 'bg-dark border-light' : 'bg-white'}`}>
                <div className={`card-header rounded-top-2 ${getCardHeaderClasses('explanation')}`}>
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>Explanation
                  </h5>
                </div>
                <div className="card-body">
                  <div className="markdown-content">
                    {analysis.explanation.split('. ').filter(item => item.trim() !== '').map((sentence, index) => (
                      <div
                        key={index}
                        className="mb-3"
                        dangerouslySetInnerHTML={{
                          __html: marked.parseInline(sentence.replace(/\.$/, '')) as string
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              {/* Risks Card - now full width */}
              <div className={`card h-100 ${darkMode ? 'bg-dark border-light' : 'bg-white'}`}>
                <div className={`card-header rounded-top-2 ${getCardHeaderClasses('risks')}`}>
                  <h5 className="mb-0">
                    <i className="fas fa-bug me-2"></i>Risks
                  </h5>
                </div>
                <div className="card-body">
                  {analysis.risks.length > 0 ? (
                    <ul className="mb-0">
                      {analysis.risks.map((risk, index) => (
                        <li
                          key={index}
                          className="mb-2"
                          dangerouslySetInnerHTML={{
                            __html: marked.parseInline(risk) as string
                          }}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className={`text-muted mb-0 ${darkMode ? 'text-muted' : ''}`}>No significant risks identified</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12">
              {/* Recommendations Card - now full width */}
              <div className={`card h-100 ${darkMode ? 'bg-dark border-light' : 'bg-white'}`}>
                <div className={`card-header rounded-top-2 ${getCardHeaderClasses('recommendations')}`}>
                  <h5 className="mb-0">
                    <i className="fas fa-lightbulb me-2"></i>Recommendations
                  </h5>
                </div>
                <div className="card-body">
                  {analysis.recommendations.length > 0 ? (
                    <ul className="mb-0">
                      {analysis.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="mb-2"
                          dangerouslySetInnerHTML={{
                            __html: marked.parseInline(rec) as string
                          }}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className={`text-muted mb-0 ${darkMode ? 'text-muted' : ''}`}>No specific recommendations</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display the input form
  return (
    <div className={`card shadow-sm ${darkMode ? 'bg-dark text-light border-light' : 'bg-white'}`}>
      <div className="card-body p-4">
        <div className="text-center mb-5">
          <h2 className={`display-5 fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}>
            AI-Powered Command Safety Checker
          </h2>
          <p className={`lead ${darkMode ? 'text-muted' : 'text-muted'}`}>
            Enter any command below to have our AI analyze it and determine if it's safe to execute
          </p>
        </div>
        <form>
          <div className="mb-4">
            <label htmlFor="command" className={`form-label fw-semibold ${darkMode ? 'text-light' : ''}`}>
              <i className="fas fa-terminal me-2"></i>Command to Check
            </label>
            <textarea
              id="command"
              className={`form-control ${darkMode ? 'bg-dark text-light border-light' : ''}`}
              rows={5}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter the command you want to check (e.g., rm -rf /, sudo apt install ..., curl ... | sh)"
              required
              style={{ fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace' }}
            />
          </div>

          <div className="d-flex flex-column flex-md-row gap-3 align-items-center justify-content-between">
            <button
              type="button"
              className={`btn ${darkMode ? 'btn-light text-dark' : 'btn-dark'} flex-fill py-3`}
              onClick={handleMainButtonAnalysis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-bolt me-2"></i> {localStorage.getItem('default_analysis_type') === 'accurate' ? 'Detailed Analysis' : 'Quick Analysis'}
                </>
              )}
            </button>

            {/* Dropdown menu for alternative analysis type */}
            <div className="dropdown">
              <button
                className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'} py-3 px-3`}
                type="button"
                id="analysisOptionsDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                disabled={loading}
              >
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <ul className={`dropdown-menu ${darkMode ? 'bg-dark text-light' : 'bg-white'}`} aria-labelledby="analysisOptionsDropdown">
                <li>
                  <button
                    className={`dropdown-item ${darkMode ? 'bg-dark text-light' : ''}`}
                    type="button"
                    onClick={() => {
                      const currentDefault = localStorage.getItem('default_analysis_type') || 'fast';
                      const alternativeType = currentDefault === 'fast' ? 'accurate' : 'fast';
                      analyzeCommand(alternativeType as 'fast' | 'accurate');
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-cogs me-2"></i> {localStorage.getItem('default_analysis_type') === 'accurate' ? 'Quick Analysis' : 'Detailed Analysis'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </form>

        {error && (
          <div className={`alert mt-4 rounded-3 ${darkMode ? 'bg-dark text-light border-light' : 'bg-light text-dark border-dark'}`} role="alert">
            <div className="d-flex align-items-center">
              <i className={`fas fa-exclamation-triangle me-2 ${darkMode ? 'text-light' : 'text-dark'}`}></i>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandChecker;