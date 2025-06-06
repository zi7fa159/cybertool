import React, { useState, useEffect } from 'react';
import './ToolExecutionForm.css'; // Create this CSS file

function ToolExecutionForm({ selectedTool, onSubmit, isRunning }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Reset form data when selected tool changes
    if (selectedTool) {
      const initialFormData = {};
      selectedTool.parameters.forEach(param => {
        initialFormData[param.name] = param.default || '';
      });
      setFormData(initialFormData);
    } else {
      setFormData({});
    }
  }, [selectedTool]);

  if (!selectedTool) {
    return <p>Select a tool to see its execution options.</p>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedTool.id, formData);
  };

  return (
    <div className="tool-execution-form">
      <h3>Execute: {selectedTool.name}</h3>
      <form onSubmit={handleSubmit}>
        {selectedTool.parameters.map(param => (
          <div key={param.name} className="form-group">
            <label htmlFor={param.name}>{param.name}{param.required && '*'}:</label>
            {param.type === 'select' ? (
              <select name={param.name} id={param.name} value={formData[param.name] || ''} onChange={handleChange} required={param.required}>
                {param.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : param.type === 'textarea' ? (
              <textarea name={param.name} id={param.name} value={formData[param.name] || ''} onChange={handleChange} placeholder={param.placeholder} rows="5" required={param.required} />
            ) : (
              <input type={param.type || 'text'} name={param.name} id={param.name} value={formData[param.name] || ''} onChange={handleChange} placeholder={param.placeholder} required={param.required} />
            )}
            {param.description && <small>{param.description}</small>}
          </div>
        ))}
        <button type="submit" disabled={isRunning}>
          {isRunning ? 'Running...' : `Run ${selectedTool.name}`}
        </button>
      </form>
    </div>
  );
}
export default ToolExecutionForm;
