import React, { createContext, useContext, useState, useCallback } from 'react';
import { parseStatement } from '../utils/statementParser';

const StatementContext = createContext(null);

const STORAGE_KEY = 'fandash_statement_data';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Silently fail if localStorage is full
  }
}

export function StatementProvider({ children }) {
  const [statementData, setStatementData] = useState(() => loadFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadStatement = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = parseStatement(text);
      data.fileName = file.name;
      data.uploadedAt = new Date().toISOString();
      setStatementData(data);
      saveToStorage(data);
    } catch (err) {
      setError(err.message || 'Failed to parse file.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearStatement = useCallback(() => {
    setStatementData(null);
    setError(null);
    saveToStorage(null);
  }, []);

  return (
    <StatementContext.Provider
      value={{ statementData, analytics: statementData, isLoading, error, uploadStatement, clearStatement, resetStatement: clearStatement }}
    >
      {children}
    </StatementContext.Provider>
  );
}

export function useStatement() {
  const ctx = useContext(StatementContext);
  if (!ctx) throw new Error('useStatement must be used within StatementProvider');
  return ctx;
}
