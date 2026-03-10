import React from 'react';
import Button from '../components/UI/Button';
import MonthlySummary from '../components/Reports/MonthlySummary';
import YearlySummary from '../components/Reports/YearlySummary';
import { Download } from 'lucide-react';

const Reports = () => {
    const handleExport = (format) => {
        alert(`Exporting report as ${format}... (This is a mock action)`);
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ margin: 0 }}>Reports</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="secondary" onClick={() => handleExport('CSV')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Export CSV
                    </Button>
                    <Button onClick={() => handleExport('PDF')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Export PDF
                    </Button>
                </div>
            </div>

            <MonthlySummary />
            <YearlySummary />
        </div>
    );
};

export default Reports;
