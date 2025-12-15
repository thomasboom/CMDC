import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marked } from 'marked';

interface CommandAnalysis {
  explanation: string; // This will be a string with sentences separated by periods
  safety: string;
  risks: string[];
  recommendations: string[];
}

const CommandChecker: React.FC = () => {
  const [command, setCommand] = useState<string>('');
  const [analysis, setAnalysis] = useState<CommandAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCommand = async (selectedModelType: 'fast' | 'accurate') => {
    if (!command.trim()) {
      setError('Please enter a command to analyze');
      return;
    }

    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key is not set. Please set VITE_GEMINI_API_KEY in your .env file.');
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

  const handleQuickAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeCommand('fast');
  };

  const handleAccurateAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeCommand('accurate');
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setCommand('');
  };

  const safetyLevelClass = (safety: string) => {
    switch(safety.toLowerCase()) {
      case 'safe':
        return 'text-success fw-bold';
      case 'potentially dangerous':
        return 'text-warning fw-bold';
      case 'extremely dangerous':
        return 'text-danger fw-bold';
      default:
        return 'text-info fw-bold';
    }
  };

  if (analysis && !loading) {
    // Display only the analysis results without input fields
    return (
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 mb-0">Command Analysis Results</h2>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={resetAnalysis}
            >
              New Analysis
            </button>
          </div>

          <div className="alert p-3 mb-4 text-center">
            <strong>Overall Risk Assessment:</strong>
            <span className={`ms-2 ${safetyLevelClass(analysis.safety)}`}>
              {analysis.safety}
            </span>
          </div>

          <div className="row g-4">
            {/* Explanation Card */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Explanation</h5>
                </div>
                <div className="card-body">
                  <div className="markdown-content">
                    {analysis.explanation.split('. ').filter(item => item.trim() !== '').map((sentence, index) => (
                      <div
                        key={index}
                        className="mb-2"
                        dangerouslySetInnerHTML={{
                          __html: marked.parseInline(sentence.replace(/\.$/, '')) as string
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Risks Card */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">Risks</h5>
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
                    <p className="text-muted mb-0">No significant risks identified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations Card */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Recommendations</h5>
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
                    <p className="text-muted mb-0">No specific recommendations</p>
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
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <form>
          <div className="mb-3">
            <label htmlFor="command" className="form-label fw-semibold">
              Command to Check
            </label>
            <textarea
              id="command"
              className="form-control"
              rows={4}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter the command you want to check (e.g., rm -rf /, sudo apt install ..., curl ... | sh)"
              required
            />
            <div className="form-text mt-2">
              Make sure to set your Gemini API key in the .env file as VITE_GEMINI_API_KEY
            </div>
          </div>

          <div className="d-grid gap-3 d-md-flex justify-content-md-center">
            <button
              type="button"
              className="btn btn-outline-primary flex-fill py-2"
              onClick={handleQuickAnalysis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-bolt me-2"></i> Quick & Less Accurate
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-primary flex-fill py-2"
              onClick={handleAccurateAnalysis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-cogs me-2"></i> Accurate & Normal
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-danger mt-4" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandChecker;