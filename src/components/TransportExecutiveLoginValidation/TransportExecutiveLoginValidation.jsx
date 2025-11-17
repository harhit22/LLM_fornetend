import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Phone,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  BadgeCheck,
} from "lucide-react";
import styles from "./TransportExecutiveLoginValidation.module.css";
import BASE_URL from '../../api/constant/BaseUrl';

const TransportExecutiveLoginValidation = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyViolations, setShowOnlyViolations] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [arrivalTimeFilter, setArrivalTimeFilter] = useState("");
  const [departureTimeFilter, setDepartureTimeFilter] = useState("");
  const [timeFilterType, setTimeFilterType] = useState("exact"); // exact, before, after
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    violations: 0,
    compliant: 0,
  });

  useEffect(() => {
    fetchSOPReports();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const date = params.get("date");
    if (date) {
      setDateFilter(date);
    }
  }, [location.search]);

  useEffect(() => {
    if (dateFilter) {
      fetchSOPReports(dateFilter);
    }
  }, [dateFilter]);

  useEffect(() => {
    applyFilters();
  }, [reports, employeeFilter, showOnlyViolations, arrivalTimeFilter, departureTimeFilter, timeFilterType]);

  const fetchSOPReports = async (date = null) => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/mobile-api/employee-sop-reports/`;
      
      if (date) {
        url += `?date=${date}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      setReports(data.reports || []);
      setStats(data.stats || { total: 0, violations: 0, compliant: 0 });
    } catch (err) {
      setError("Failed to fetch SOP reports");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const timeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const compareTime = (reportTime, filterTime, type) => {
    const reportMinutes = timeToMinutes(reportTime);
    const filterMinutes = timeToMinutes(filterTime);

    switch (type) {
      case "before":
        return reportMinutes < filterMinutes;
      case "after":
        return reportMinutes > filterMinutes;
      case "exact":
      default:
        return reportMinutes === filterMinutes;
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (dateFilter) {
      filtered = filtered.filter((report) => report.date === dateFilter);
    }

    if (employeeFilter) {
      filtered = filtered.filter((report) =>
        report.employee_name.toLowerCase().includes(employeeFilter.toLowerCase())
      );
    }

    // Time filters
    if (arrivalTimeFilter) {
      filtered = filtered.filter((report) => {
        if (!report.arrival_time) return false;
        return compareTime(report.arrival_time, arrivalTimeFilter, timeFilterType);
      });
    }

    if (departureTimeFilter) {
      filtered = filtered.filter((report) => {
        if (!report.departure_time) return false;
        return compareTime(report.departure_time, departureTimeFilter, timeFilterType);
      });
    }

    if (showOnlyViolations) {
      filtered = filtered.filter((report) => !report.is_sop_followed);
    }

    setFilteredReports(filtered);
  };

  const clearAllFilters = () => {
    setDateFilter("");
    setEmployeeFilter("");
    setArrivalTimeFilter("");
    setDepartureTimeFilter("");
    setTimeFilterType("exact");
    setShowOnlyViolations(false);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading SOP reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <AlertTriangle className={styles.errorIcon} size={48} />
          <p className={styles.errorText}>{error}</p>
          <button onClick={fetchSOPReports} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <ArrowLeft
              className={styles.backButton}
              size={20}
              onClick={() => window.history.back()}
            />
            <h1 className={styles.headerTitle}>👤 Employee SOP Report</h1>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterButton}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

     

      {/* Filters */}
      {showFilters && (
        <div className={styles.filtersSection}>
          <div className={styles.filtersContent}>
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Calendar size={16} />
                  Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <User size={16} />
                  Employee Name
                </label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
            </div>

            {/* Time Filter Type Selector */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <Clock size={16} />
                Time Filter Type
              </label>
              <select
                value={timeFilterType}
                onChange={(e) => setTimeFilterType(e.target.value)}
                className={styles.filterInput}
              >
                <option value="exact">Exact Time</option>
                <option value="before">Before Time</option>
                <option value="after">After Time</option>
              </select>
            </div>

            {/* Time Filters */}
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Clock size={16} />
                  Arrival Time
                </label>
                <input
                  type="time"
                  value={arrivalTimeFilter}
                  onChange={(e) => setArrivalTimeFilter(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Clock size={16} />
                  Departure Time
                </label>
                <input
                  type="time"
                  value={departureTimeFilter}
                  onChange={(e) => setDepartureTimeFilter(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
            </div>

            <div className={styles.filtersBottom}>
              <label className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  checked={showOnlyViolations}
                  onChange={(e) => setShowOnlyViolations(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxLabel}>
                  Show only violations
                </span>
              </label>

              <button onClick={clearAllFilters} className={styles.clearButton}>
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className={styles.reportsSection}>
        {filteredReports.length === 0 ? (
          <div className={styles.emptyState}>
            <BadgeCheck className={styles.emptyStateIcon} size={48} />
            <p className={styles.emptyStateText}>No SOP reports found</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className={`${styles.reportCard} ${
                  report.is_sop_followed
                    ? styles.reportCardCompliant
                    : styles.reportCardViolation
                }`}
              >
                <div
                  className={`${styles.reportHeader} ${
                    report.is_sop_followed
                      ? styles.reportHeaderCompliant
                      : styles.reportHeaderViolation
                  }`}
                >
                  <div className={styles.reportHeaderContent}>
                    <div>
                      <h3 className={styles.reportTitle}>
                        {report.employee_name}
                      </h3>
                      <p className={styles.reportSubtitle}>
                        ID: {report.employee_id} | {report.site_name}
                      </p>
                    </div>
                    <div className={styles.statusIcon}>
                      {report.is_sop_followed ? (
                        <CheckCircle size={24} />
                      ) : (
                        <XCircle size={24} />
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.reportBody}>
                  <div className={styles.reportDetails}>
                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <Calendar size={16} />
                        <span><strong>Date:</strong> {report.date}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <Phone size={16} />
                        <span><strong>Mobile:</strong> {report.mobile_number}</span>
                        {report.mobile_number && (
                          <a
                            href={`tel:${report.mobile_number}`}
                            className={styles.callLink}
                          >
                            Call
                          </a>
                        )}
                      </div>
                    </div>

                    <div className={styles.detailsGrid}>
                      <div className={styles.detailItem}>
                        <Clock size={16} />
                        <span><strong>Arrival:</strong> {formatTime(report.arrival_time)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <Clock size={16} />
                        <span><strong>Departure:</strong> {formatTime(report.departure_time)}</span>
                      </div>
                    </div>

                    {!report.is_sop_followed && report.violation && (
                      <div className={styles.violationSection}>
                        <p className={styles.violationTitle}>
                          Violation Details:
                        </p>
                        <p className={styles.violationText}>{report.violation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.resultsCount}>
        Showing {filteredReports.length} of {reports.length} reports
      </div>
    </div>
  );
};

export default TransportExecutiveLoginValidation;