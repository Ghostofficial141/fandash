import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Download, AlertCircle } from 'lucide-react';
import { useStatement } from '../../context/StatementContext';

const StatementUpload = () => {
  const { uploadStatement, isLoading, error } = useStatement();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  };

  const validateAndSet = (f) => {
    setLocalError(null);
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setLocalError('Please upload a CSV file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setLocalError('File is too large. Maximum size is 10 MB.');
      return;
    }
    setFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    try {
      await uploadStatement(file);
    } catch {
      // error is set in context
    }
  };

  const removeFile = () => {
    setFile(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const displayError = localError || error;

  return (
    <>
      <p className="text-small" style={{ marginBottom: '2rem', opacity: 0.7 }}>
        Upload your bank statement to see where your money goes
      </p>

      <div
        className={`stmt-upload-zone${dragging ? ' dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        id="statement-upload-zone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="statement-file-input"
        />

        <div className="stmt-upload-icon">
          <Upload size={28} />
        </div>

        <div className="stmt-upload-title">
          {file ? 'Ready to Analyze' : 'Drop your bank statement here'}
        </div>

        <div className="stmt-upload-subtitle">
          {file
            ? 'Click Analyze to see your spending insights'
            : 'Supports CSV files from most banks'}
        </div>

        {file && (
          <div className="stmt-file-info" onClick={(e) => e.stopPropagation()}>
            <FileText size={18} />
            <span>
              {file.name} ({formatSize(file.size)})
            </span>
            <button className="stmt-file-remove" onClick={removeFile} aria-label="Remove file">
              <X size={16} />
            </button>
          </div>
        )}

        {file ? (
          <button
            className="stmt-upload-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleAnalyze();
            }}
            disabled={isLoading}
            id="analyze-button"
          >
            {isLoading ? (
              <>
                <div className="stmt-spinner" />
                Analyzing...
              </>
            ) : (
              'Analyze Statement'
            )}
          </button>
        ) : (
          <button
            className="stmt-upload-btn"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Browse Files
          </button>
        )}

        {displayError && (
          <div className="stmt-error">
            <AlertCircle size={16} />
            {displayError}
          </div>
        )}

        <button
          className="stmt-sample-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={async (e) => {
            e.stopPropagation();
            try {
              setLocalError(null);
              const resp = await fetch('/sampleStatement.csv');
              if (!resp.ok) throw new Error('Could not load sample statement.');
              const text = await resp.text();
              const blob = new Blob([text], { type: 'text/csv' });
              const sampleFile = new File([blob], 'sampleStatement.csv', { type: 'text/csv' });
              await uploadStatement(sampleFile);
            } catch (err) {
              setLocalError(err.message || 'Failed to load sample statement.');
            }
          }}
          disabled={isLoading}
        >
          <Download size={14} />
          Try with a sample statement
        </button>
      </div>
    </>
  );
};

export default StatementUpload;
