import React, { useState } from 'react';
import './TestGenerator.css';

interface TestGeneratorProps {}

const TestGenerator: React.FC<TestGeneratorProps> = () => {
  const [requirements, setRequirements] = useState<string>('');
  const [agentApiUrl, setAgentApiUrl] = useState<string>('');
  const [generatedTests, setGeneratedTests] = useState<string>('');
  const [testResults, setTestResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateTests = async () => {
    if (!requirements.trim()) {
      setError('Please enter some requirements');
      return;
    }

    if (!agentApiUrl.trim()) {
      setError('Please enter the agent API URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedTests('');
    setTestResults('');

    try {
      const response = await fetch('http://localhost:8000/generate-and-run-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirements: requirements,
          agent_api_url: agentApiUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedTests(data.test_suite_code);
      setTestResults(data.test_results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setRequirements('');
    setAgentApiUrl('');
    setGeneratedTests('');
    setTestResults('');
    setError('');
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedTests);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="test-generator">
      <div className="test-generator__container">
        <h1 className="test-generator__title">TestMind - AI Test Generator</h1>
        <p className="test-generator__subtitle">
          Convert your requirements into professional test suites using AI
        </p>

        <div className="test-generator__form">
          <div className="test-generator__input-section">
            <label htmlFor="agentApiUrl" className="test-generator__label">
              Agent API URL
            </label>
            <input
              id="agentApiUrl"
              type="url"
              className="test-generator__input"
              value={agentApiUrl}
              onChange={(e) => setAgentApiUrl(e.target.value)}
              placeholder="http://my-agent-api.com/invoke"
              disabled={isLoading}
            />
          </div>

          <div className="test-generator__input-section">
            <label htmlFor="requirements" className="test-generator__label">
              Requirements (one per line):
            </label>
            <textarea
              id="requirements"
              className="test-generator__textarea"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Enter your requirements here, one per line:&#10;&#10;Test user login functionality&#10;Test password validation&#10;Test logout process&#10;Test error handling for invalid credentials"
              rows={8}
              disabled={isLoading}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          <div className="test-generator__actions">
            <button
              className="test-generator__button test-generator__button--primary"
              onClick={handleGenerateTests}
              disabled={isLoading || !requirements.trim() || !agentApiUrl.trim()}
            >
              {isLoading ? 'Generating Tests...' : 'Generate Tests'}
            </button>
            <button
              className="test-generator__button test-generator__button--secondary"
              onClick={handleClearAll}
              disabled={isLoading}
            >
              Clear All
            </button>
          </div>

          {error && (
            <div className="test-generator__error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {generatedTests && (
            <div className="test-generator__output-section">
              <div className="test-generator__output-header">
                <h2>Generated Test Suite</h2>
                <button
                  className="test-generator__button test-generator__button--copy"
                  onClick={handleCopyToClipboard}
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>
              <pre className="test-generator__output">
                <code>{generatedTests}</code>
              </pre>
            </div>
          )}

          {testResults && (
            <div className="test-generator__output-section">
              <h2>Test Results</h2>
              <pre className="test-generator__output test-generator__output--results">
                <code>{testResults}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestGenerator; 