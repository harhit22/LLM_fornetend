import React, { useState, useEffect } from 'react';
import styles from './Report.module.css';
import { useNavigate } from "react-router-dom"; 

const Report = () => {
  const [reportTypes, setReportTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportTypes();
  }, []);

  const fetchReportTypes = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/mobile-api/mobile-api/reports/`);
      const data = await response.json();
      
      if (data.success) {
        setReportTypes(data.report_types);
        console.log('Fetched report types:', data.report_types);
      } else {
        throw new Error(data.error || 'Failed to fetch reports');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine the route based on report type
  const getReportRoute = (report) => {
    // You can use report.id, report.name, or any unique identifier
    switch(report.name.toLowerCase()) {
      case 'trip validation report':
        return '/trip-validation-report';
      case 'fuel validation report':
        return '/fuel-validation-report';
      case 'skip lines report':
        return '/skipline-validation-report';
      case 'employee sop report':
        return '/sop-te-report';
      default:
        return '/details'; // fallback route
    }
  };

  const handleReportClick = (report) => {
    const route = getReportRoute(report);
    navigate(route);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading Reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Error Loading Reports</h3>
          <p>{error}</p>
          <button onClick={fetchReportTypes} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Report Selection</h1>
        <p>Choose a report type to view</p>
      </div>

      <div className={styles.reportGrid}>
        {reportTypes.map((report, index) => (
          <div
            key={report.id}
            onClick={() => handleReportClick(report)}
            className={styles.reportBox}
          >
            <div className={styles.reportIcon}>{report.icon}</div>
            <h3 className={styles.reportName}>{report.name}</h3>
            <div className={styles.fieldCount}>{report.fields.length} fields</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Report;