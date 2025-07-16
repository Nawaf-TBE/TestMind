import React, { useState } from 'react';

const SimpleTestGenerator: React.FC = () => {
  const [requirements, setRequirements] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateTestSuite = async () => {
    if (!requirements.trim()) return;

    setIsLoading(true);
    setGeneratedCode('');

    try {
      const response = await fetch('http://localhost:8000/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirements: requirements,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedCode(data.test_suite_code);
    } catch (error) {
      setGeneratedCode(`Error: ${error instanceof Error ? error.message : 'An error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#333',
        marginBottom: '30px'
      }}>
        AI Agent Test Suite Generator
      </h1>

      <textarea
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        placeholder="Enter your requirements here, one per line:

Test user login functionality
Test password validation
Test logout process
Test error handling for invalid credentials"
        rows={10}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '14px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontFamily: 'monospace',
          resize: 'vertical',
          marginBottom: '20px',
          boxSizing: 'border-box'
        }}
        disabled={isLoading}
      />

      <button
        onClick={handleGenerateTestSuite}
        disabled={isLoading || !requirements.trim()}
        style={{
          backgroundColor: isLoading || !requirements.trim() ? '#ccc' : '#007bff',
          color: 'white',
          padding: '12px 24px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '6px',
          cursor: isLoading || !requirements.trim() ? 'not-allowed' : 'pointer',
          marginBottom: '30px',
          width: '100%'
        }}
      >
        {isLoading ? 'Generating Test Suite...' : 'Generate Test Suite'}
      </button>

      <div style={{ marginTop: '20px' }}>
        {isLoading && (
          <div style={{ 
            textAlign: 'center', 
            fontSize: '16px', 
            color: '#666',
            padding: '20px'
          }}>
            Loading...
          </div>
        )}
        
        {generatedCode && !isLoading && (
          <pre style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            padding: '20px',
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <code>{generatedCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default SimpleTestGenerator; 