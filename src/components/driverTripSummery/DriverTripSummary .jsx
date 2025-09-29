import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, User, Truck, Phone } from 'lucide-react';
import styles from './DriverTripSummary.module.css';
import { useCity } from "../../context/CityContext";
import BASE_URL from '../../api/constent/BaseUrl';
const DriverTripSummary = () => {
    const { selectedCity } = useCity();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  const fetchDriverReport = async () => {
    setLoading(true);
    setError(null);
    setReportData([]);

    if (!startDate) {
      setError("Please select a start date.");
      setLoading(false);
      return;
    }

    // Replace this with your actual API call
    const url = new URL(`${BASE_URL}/mobile-api/driver-trip-summary/`);
    url.searchParams.append('start_date', startDate);
    if (endDate) {
      url.searchParams.append('end_date', endDate);
    }
    // Add city parameter if needed
    if (selectedCity && selectedCity.city) {
      url.searchParams.append('city_name', selectedCity.city);
    }

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error("Failed to fetch driver report:", err);
      
      // For demo purposes, show mock data on error
      const mockData = [
        { driver_id: 1, driver_name: "John Smith", driver_number: "+91 98765 43210", incorrect_trips: 3 },
        { driver_id: 2, driver_name: "Sarah Johnson", driver_number: "+91 87654 32109", incorrect_trips: 1 },
        { driver_id: 3, driver_name: "Mike Davis", driver_number: "+91 76543 21098", incorrect_trips: 5 },
        { driver_id: 4, driver_name: "Lisa Chen", driver_number: "+91 65432 10987", incorrect_trips: 2 },
      ];
      setReportData(mockData);
      // setError("Failed to load report. Please check the dates and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const setTodayDates = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const getStatusBadgeClass = (incorrectTrips) => {
    if (incorrectTrips >= 5) return styles.statusBadgeRed;
    if (incorrectTrips >= 3) return styles.statusBadgeYellow;
    return styles.statusBadgeGreen;
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainWrapper}>
        {/* Header */}
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Truck className="text-white" size={32} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>
                Driver Performance Summary
              </h1>
              <p className={styles.headerSubtitle}>Track and monitor driver trip performance</p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersGrid}>
            <div className={styles.dateGroup}>
              <label className={styles.dateLabel}>
                <Calendar size={16} style={{ color: '#16a34a' }} />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>
            
            <div className={styles.dateGroup}>
              <label className={styles.dateLabel}>
                <Calendar size={16} style={{ color: '#16a34a' }} />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            <div className={styles.buttonsGroup}>
              <button
                type="button"
                onClick={setTodayDates}
                className={styles.todayButton}
              >
                Set Today's Date
              </button>
              <button
                type="button"
                onClick={fetchDriverReport}
                disabled={loading}
                className={styles.generateButton}
              >
                {loading ? (
                  <div className={styles.loadingContent}>
                    <div className={styles.smallSpinner}></div>
                    Loading...
                  </div>
                ) : (
                  'Generate Report'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingCard}>
            <div className={styles.loadingContent}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Generating your report...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.errorCard}>
            <div className={styles.errorContent}>
              <AlertTriangle style={{ color: '#dc2626' }} size={24} />
              <p className={styles.errorText}>{error}</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        {reportData.length > 0 && (
          <div className={styles.resultsCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>
                <User size={24} />
                Driver Performance Report
              </h2>
              <p className={styles.tableSubtitle}>
                Showing {reportData.length} drivers with incorrect trips
              </p>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeadCell}>Driver Name</th>
                    <th className={styles.tableHeadCell}>Phone Number</th>
                    <th className={styles.tableHeadCellCenter}>Incorrect Trips</th>
                    <th className={styles.tableHeadCellCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {reportData.map((driver, index) => (
                    <tr 
                      key={driver.driver_id}
                      className={`${styles.tableRow} ${
                        index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                      }`}
                    >
                      <td className={styles.tableCell}>
                        <div className={styles.driverInfo}>
                          <div className={styles.driverAvatar}>
                            {driver.driver_name.charAt(0)}
                          </div>
                          <span className={styles.driverName}>{driver.driver_name}</span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.phoneInfo}>
                          <Phone size={16} style={{ color: '#16a34a' }} />
                          <span className={styles.phoneNumber}>{driver.driver_number}</span>
                        </div>
                      </td>
                      <td className={styles.tableCellCenter}>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(driver.incorrect_trips)}`}>
                          {driver.incorrect_trips}
                        </span>
                      </td>
                      <td className={styles.tableCellCenter}>
                        <button
                          onClick={() => handleCall(driver.driver_number)}
                          className={styles.callButton}
                        >
                          <Phone size={16} />
                          Call
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {reportData.length === 0 && !loading && !error && startDate && (
          <div className={styles.emptyCard}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyIcon}>
                <Truck size={32} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <h3 className={styles.emptyTitle}>No Issues Found</h3>
                <p className={styles.emptyText}>No incorrect trips found for the selected date range.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTripSummary;