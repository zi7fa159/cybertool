import React from 'react';
import './ToolCard.css'; // Create this CSS file

function ToolCard({ tool, onSelectTool }) {
  return (
    <div className="tool-card" onClick={() => onSelectTool(tool)}>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      <button onClick={(e) => { e.stopPropagation(); onSelectTool(tool); }}>Select Tool</button>
    </div>
  );
}
export default ToolCard;
