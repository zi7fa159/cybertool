import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ToolCard from './ToolCard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function ToolList({ onSelectTool }) { // Accept onSelectTool
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/tools`)
      .then(response => {
        setTools(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tools:", err);
        setError('Failed to load tools. Is the backend running?');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading tools...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (tools.length === 0) return <p>No tools available.</p>;

  return (
    <div>
      <h2>Available Tools</h2>
      <div className="tool-list"> {/* Ensure .tool-list class is in App.css for flex display */}
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} onSelectTool={onSelectTool} />
        ))}
      </div>
    </div>
  );
}
export default ToolList;
