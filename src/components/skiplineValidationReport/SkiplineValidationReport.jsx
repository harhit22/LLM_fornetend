import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Phone,
  User,
  AlertTriangle,
  Route,
  Eye,
  MapPin,
  Car,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Users,
  Building,
  Hash,
  BarChart3,
  Fuel,
  FileText,
  Menu,
  X
} from "lucide-react";
import { useCity } from "../../context/CityContext";
import styles from "./SkiplineValidationReport.module.css";
import { useDate } from "../../context/DateContext";

const SkiplineValidationReport = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const { selectedDate, setSelectedDate, dateRange, setDateRange } = useDate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlySkipped, setShowOnlySkipped] = useState(false);
  const [showRepeatedOnly, setShowRepeatedOnly] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Local filters
  const [dateFilter, setDateFilter] = useState(selectedDate || "");
  const [wardFilter, setWardFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    skipped: 0,
    unknown: 0,
    repeated: 0,
    completionRate: 0,
    skipRate: 0,
  });

  const location = useLocation();

  const fetchSkiplineReports = async () => {
    try {
      setLoading(true);
      
      // Build API URL with filters
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (selectedCity?.city) params.set("city", selectedCity.city);
      if (wardFilter) params.set("ward", wardFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (driverFilter) params.set("driver", driverFilter);
      if (showOnlySkipped) params.set("only_skipped", "true");
      if (showRepeatedOnly) params.set("only_repeated", "true");
      
      const queryString = params.toString();
      const url = `${BASE_URL}/mobile-api/mobile-api/skipline-validation-reports/${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setReports(data.reports || []);
      setStats(data.stats || {});
    } catch (err) {
      setError("Failed to fetch skipline reports");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkiplineReports();
  }, [dateFilter, selectedCity, wardFilter, statusFilter, driverFilter, showOnlySkipped, showRepeatedOnly]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityFromUrl = params.get("city");
    const dateFromUrl = params.get("date");
    const startDateFromUrl = params.get("startDate");
    const endDateFromUrl = params.get("endDate");
    const wardFromUrl = params.get("ward");
    const statusFromUrl = params.get("status");

    if (cityFromUrl && cityFromUrl !== selectedCity?.city) {
      setSelectedCity({ city: cityFromUrl, name: cityFromUrl });
    }

    if (dateFromUrl && dateFromUrl !== selectedDate) {
      setSelectedDate(dateFromUrl);
      setDateFilter(dateFromUrl);
    }

    if (startDateFromUrl || endDateFromUrl) {
      setDateRange({
        start: startDateFromUrl || dateRange.start,
        end: endDateFromUrl || dateRange.end
      });
    }

    if (wardFromUrl) setWardFilter(wardFromUrl);
    if (statusFromUrl) setStatusFilter(statusFromUrl);
  }, [location.search]);

  const navigateWithContext = (path) => {
    const params = new URLSearchParams();
    if (selectedCity?.city) params.set("city", selectedCity.city);
    if (selectedDate) params.set("date", selectedDate);
    if (dateRange.start) params.set("startDate", dateRange.start);
    if (dateRange.end) params.set("endDate", dateRange.end);
    
    const queryString = params.toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    navigate(fullPath);
    setShowNavMenu(false);
  };

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
    setSelectedDate(e.target.value);
  };

  const clearAllFilters = () => {
    setDateFilter("");
    setWardFilter("");
    setStatusFilter("");
    setDriverFilter("");
    setShowOnlySkipped(false);
    setShowRepeatedOnly(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "LineCompleted":
        return <CheckCircle size={18} className={styles.statusIconCompleted} />;
      case "Skipped":
        return <XCircle size={18} className={styles.statusIconSkipped} />;
      case "Unknown":
        return <Clock size={18} className={styles.statusIconUnknown} />;
      default:
        return <AlertTriangle size={18} className={styles.statusIconDefault} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "LineCompleted":
        return styles.statusCompleted;
      case "Skipped":
        return styles.statusSkipped;
      case "Unknown":
        return styles.statusUnknown;
      default:
        return styles.statusDefault;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading skipline reports...</p>
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
          <button onClick={fetchSkiplineReports} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Navigation */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <ArrowLeft
              className={styles.backButton}
              size={20}
              onClick={() => window.history.back()}
            />
            <div className={styles.headerTitleSection}>
              <h1 className={styles.headerTitle}>🚛 SkipLine Validation</h1>
              {selectedCity?.city && (
                <span className={styles.contextBadge}>📍 {selectedCity.city}</span>
              )}
              {selectedDate && (
                <span className={styles.contextBadge}>📅 {selectedDate}</span>
              )}
            </div>
          </div>
          
          <div className={styles.headerActions}>
            {/* Desktop Navigation */}
            <div className={styles.desktopNav}>
              <button
                onClick={() => navigateWithContext('/skipline-summary')}
                className={styles.navButton}
                title="Summary Report"
              >
                <BarChart3 size={18} />
                <span>Summary</span>
              </button>
              
              <button
                onClick={() => navigateWithContext('/fuel-validation-report')}
                className={styles.navButton}
                title="Fuel Report"
              >
                <Fuel size={18} />
                <span>Fuel</span>
              </button>
              
              <button
                onClick={() => navigateWithContext('/sop-te-report')}
                className={styles.navButton}
                title="SOP Report"
              >
                <FileText size={18} />
                <span>SOP</span>
              </button>
              
              <button
                onClick={() => navigateWithContext('/trip-validation-report')}
                className={styles.navButton}
                title="Trip Report"
              >
                <Route size={18} />
                <span>Trip</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowNavMenu(!showNavMenu)}
              className={styles.mobileMenuButton}
            >
              {showNavMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterButton}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showNavMenu && (
          <div className={styles.mobileNavMenu}>
            <button
              onClick={() => navigateWithContext('/skipline-summary')}
              className={styles.mobileNavItem}
            >
              <BarChart3 size={18} />
              <span>Summary Report</span>
            </button>
            
            <button
              onClick={() => navigateWithContext('/fuel-validation-report')}
              className={styles.mobileNavItem}
            >
              <Fuel size={18} />
              <span>Fuel Validation</span>
            </button>
            
            <button
              onClick={() => navigateWithContext('/sop-te-report')}
              className={styles.mobileNavItem}
            >
              <FileText size={18} />
              <span>SOP Report</span>
            </button>
            
            <button
              onClick={() => navigateWithContext('/trip-validation-report')}
              className={styles.mobileNavItem}
            >
              <Route size={18} />
              <span>Trip Validation</span>
            </button>
          </div>
        )}
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
                  onChange={handleDateChange}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <MapPin size={16} />
                  Site Name
                </label>
                <input
                  type="text"
                  placeholder="Enter site name"
                  // value={siteFilter}
                  // onChange={handleSiteChange}
                  className={styles.filterInput}
                />
              </div>
            </div>

            <div className={styles.filtersBottom}>
              <div className={styles.checkboxGroup}>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showRepeatedOnly}
                    onChange={(e) => setShowRepeatedOnly(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Show only repeated lines</span>
                </label>
              </div>

              <button onClick={clearAllFilters} className={styles.clearButton}>
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className={styles.reportsSection}>
        {reports.length === 0 ? (
          <div className={styles.emptyState}>
            <Route className={styles.emptyStateIcon} size={48} />
            <p className={styles.emptyStateText}>No skipline reports found</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map((report, index) => {
              const isSkipped = report.status === "Skipped";
              const isRepeated = report.repeated;
              const hasIssue = isSkipped || report.status === "Unknown";

              return (
                <div
                  key={index}
                  className={`${styles.reportCard} ${getStatusClass(report.status)} ${
                    isRepeated ? styles.reportCardRepeated : ""
                  }`}
                >
                  <div className={styles.reportHeader}>
                    <div className={styles.reportHeaderContent}>
                      <div className={styles.reportTitleSection}>
                        <div className={styles.reportTitle}>
                          <Building size={16} />
                          <span>Ward: {report.ward_key}</span>
                          {isRepeated && (
                            <span className={styles.repeatedBadge}>
                              <RefreshCw size={12} />
                              Repeated
                            </span>
                          )}
                        </div>
                        <p className={styles.reportSubtitle}>
                          <MapPin size={14} />
                          {report.city} | Line {report.line_no} | {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={styles.statusIndicator}>
                        {getStatusIcon(report.status)}
                        <span className={styles.statusText}>{report.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportBody}>
                    <div className={styles.compactInfoRow}>
                      <div className={styles.basicDetails}>
                        <div className={styles.detailItem}>
                          <Car size={14} />
                          <span>{report.vehicle_number || "N/A"}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <Hash size={14} />
                          <span>Line {report.line_no}</span>
                        </div>
                        <div className={styles.wardSummaryCompact}>
                          <span className={styles.completionText}>
                            {report.ward_summary?.completed || 0}/{report.ward_summary?.total || 0} 
                            ({report.ward_summary?.completion_rate || 0}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.mainContentArea}>
                      {report.image_url && (
                        <div className={styles.imageSection}>
                          <img
                            src={report.image_url}
                            alt="Line Evidence"
                            className={styles.evidenceImage}
                            onError={(e) => {
                              e.target.src = "/api/placeholder/400/300";
                              e.target.className = `${styles.evidenceImage} ${styles.imageError}`;
                            }}
                            onClick={() => window.open(report.image_url, '_blank')}
                          />
                          <div className={styles.imageHint}>
                            <Eye size={14} />
                            <span>Tap image to view full size</span>
                          </div>
                        </div>
                      )}

                      <div className={styles.teamActions}>
                        <div className={styles.teamMemberCompact}>
                          <div className={styles.memberInfo}>
                            <User size={16} />
                            <div>
                              <p className={styles.memberName}>{report.driver_details?.name || "N/A"}</p>
                              <p className={styles.memberRole}>Driver</p>
                            </div>
                          </div>
                          {report.driver_details?.mobile && (
                            <a
                              href={`tel:${report.driver_details.mobile}`}
                              className={styles.callButton}
                            >
                              <Phone size={14} />
                              Call
                            </a>
                          )}
                        </div>

                        <div className={styles.teamMemberCompact}>
                          <div className={styles.memberInfo}>
                            <Users size={16} />
                            <div>
                              <p className={styles.memberName}>{report.helper_details?.name || "N/A"}</p>
                              <p className={styles.memberRole}>Helper</p>
                            </div>
                          </div>
                          {report.helper_details?.mobile && (
                            <a
                              href={`tel:${report.helper_details.mobile}`}
                              className={styles.callButton}
                            >
                              <Phone size={14} />
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {report.reason && (
                      <div className={styles.reasonCompact}>
                        <AlertTriangle size={16} />
                        <span className={styles.reasonText}>{report.reason}</span>
                      </div>
                    )}

                    <div className={`${styles.statusMessage} ${getStatusClass(report.status)}`}>
                      {report.status === "LineCompleted" && (
                        <span>✅ Line completed successfully</span>
                      )}
                      {report.status === "Skipped" && (
                        <span>⚠️ Line was skipped</span>
                      )}
                      {report.status === "Unknown" && (
                        <span>❓ Status requires verification</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.resultsCount}>
        Showing {reports.length} skipline reports
        {stats.total && ` (${stats.total} total)`}
      </div>
    </div>
  );
};

export default SkiplineValidationReport;