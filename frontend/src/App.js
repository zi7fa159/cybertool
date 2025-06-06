import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ToolList from './components/ToolList';
import ToolExecutionForm from './components/ToolExecutionForm';
import OutputDisplay from './components/OutputDisplay';
import LegalDisclaimer from './components/LegalDisclaimer';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolOutput, setToolOutput] = useState('');
  const [toolError, setToolError] = useState('');
  const [toolFiles, setToolFiles] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setToolOutput(''); // Clear previous output
    setToolError('');
    setToolFiles([]);
  };

  const handleToolSubmit = async (toolId, formData) => {
    if (!selectedTool) return;

    setIsRunning(true);
    setToolOutput('');
    setToolError('');
    setToolFiles([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/tools/${toolId}/run`, formData);
      setToolOutput(response.data.output || '');
      setToolError(response.data.error || '');
      setToolFiles(response.data.files || []);
    } catch (err) {
      console.error("Error running tool:", err);
      let errorMessage = 'Failed to run tool.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
        if (err.response.data.error) {
             errorMessage += ` Details: ${err.response.data.error}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setToolError(errorMessage);
      setToolOutput(''); // Clear any partial output
      setToolFiles([]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pentest Toolkit</h1>
      </header>
      <div className="main-content">
        <div className="tools-section">
          <ToolList onSelectTool={handleSelectTool} />
        </div>
        <div className="execution-section">
          {selectedTool && (
            <ToolExecutionForm
              selectedTool={selectedTool}
              onSubmit={handleToolSubmit}
              isRunning={isRunning}
            />
          )}
          <OutputDisplay
            output={toolOutput}
            error={toolError}
            files={toolFiles}
            isRunning={isRunning}
            toolName={selectedTool?.name}
          />
        </div>
      </div>
      <footer>
        <LegalDisclaimer />
      </footer>
    </div>
  );
}
export default App;
