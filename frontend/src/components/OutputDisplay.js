import React from 'react';
import './OutputDisplay.css'; // Create this CSS file

function OutputDisplay({ output, error, files, isRunning, toolName }) {
  if (isRunning) {
    return <div className="output-display loading">Running {toolName}... Please wait.</div>;
  }

  if (!output && !error && (!files || files.length === 0)) {
    return <div className="output-display placeholder">Tool output will appear here.</div>;
  }

  return (
    <div className="output-display">
      {error && (
        <div className="error-message">
          <h4>Error:</h4>
          <pre>{typeof error === 'object' ? JSON.stringify(error, null, 2) : error}</pre>
        </div>
      )}
      {output && (
        <div>
          <h4>Output:</h4>
          <pre>{output}</pre>
        </div>
      )}
      {files && files.length > 0 && (
        <div>
          <h4>Generated Files:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name}
                {/* Placeholder for download link: <a href={file.downloadLink} download>Download</a> */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
export default OutputDisplay;
