import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Phone,
  User,
  AlertTriangle,
  Fuel,
  Eye,
  EyeOff,
  DollarSign,
  Droplets,
  MapPin,
  Car,
  BarChart3,
  FileText,
  Route,
  Menu,
  X
} from "lucide-react";
import { useCity } from "../../context/CityContext";
import { useDate } from "../../context/DateContext";
import styles from "./FuelValidationReport.module.css";
import BASE_URL from '../../api/constant/BaseUrl';
const FuelValidationReport = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const { selectedDate, setSelectedDate, dateRange, setDateRange } = useDate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState(selectedDate || "");
  const [siteFilter, setSiteFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    amountMismatch: 0,
    volumeMismatch: 0,
    bothMismatch: 0,
  });
  const location = useLocation();

  const fetchFuelReports = async () => {
    try {
      setLoading(true);
      
      // Build API URL with filters
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (selectedCity?.city) params.set("city", selectedCity.city);
      if (siteFilter) params.set("site", siteFilter);
      if (showOnlyIncorrect) params.set("only_incorrect", "true");
      
      const queryString = params.toString();
      const url = `${BASE_URL}/mobile-api/mobile-api/fuel-validation-reports/${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setReports(data.reports || []);
      setStats(data.stats || calculateStats(data.reports || []));
    } catch (err) {
      setError("Failed to fetch fuel reports");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reportsData) => {
    const total = reportsData.length;
    const amountMismatch = reportsData.filter(
      (report) => !report.amount_match
    ).length;
    const volumeMismatch = reportsData.filter(
      (report) => !report.volume_match
    ).length;
    const bothMismatch = reportsData.filter(
      (report) => !report.amount_match && !report.volume_match
    ).length;

    return {
      total,
      amountMismatch,
      volumeMismatch,
      bothMismatch,
    };
  };

  useEffect(() => {
    fetchFuelReports();
  }, [dateFilter, selectedCity, siteFilter, showOnlyIncorrect]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityFromUrl = params.get("city");
    const dateFromUrl = params.get("date");
    const startDateFromUrl = params.get("startDate");
    const endDateFromUrl = params.get("endDate");
    const siteFromUrl = params.get("site");

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

    if (siteFromUrl) {
      setSiteFilter(siteFromUrl);
    }
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

  const handleSiteChange = (e) => {
    setSiteFilter(e.target.value);
  };

  const clearAllFilters = () => {
    setDateFilter("");
    setSiteFilter("");
    setShowOnlyIncorrect(false);
  };

  const getState = () => {
    navigate("/fuel-summary");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading fuel reports...</p>
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
          <button onClick={fetchFuelReports} className={styles.retryButton}>
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
              <h1 className={styles.headerTitle}>⛽ Fuel Validation Report</h1>
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
                onClick={() => navigateWithContext('/skipline-validation-report')}
                className={styles.navButton}
                title="SkipLine Report"
              >
                <Route size={18} />
                <span>SkipLine</span>
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
              onClick={() => navigateWithContext('/skipline-validation-report')}
              className={styles.mobileNavItem}
            >
              <Route size={18} />
              <span>SkipLine Validation</span>
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

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statsGrid} onClick={getState}>
          <div className={`${styles.statCard} ${styles.statCardGreen}`}>
            <p className={styles.statLabel}>Full Summary</p>
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
                  value={siteFilter}
                  onChange={handleSiteChange}
                  className={styles.filterInput}
                />
              </div>
            </div>

            <div className={styles.filtersBottom}>
              <label className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  checked={showOnlyIncorrect}
                  onChange={(e) => setShowOnlyIncorrect(e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxLabel}>
                  Show only validation issues
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
        {reports.length === 0 ? (
          <div className={styles.emptyState}>
            <Fuel className={styles.emptyStateIcon} size={48} />
            <p className={styles.emptyStateText}>No fuel reports found</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map((report, index) => {
              const hasAmountIssue = !report.amount_match;
              const hasVolumeIssue = !report.volume_match;
              const hasAnyIssue = hasAmountIssue || hasVolumeIssue;

              return (
                <div
                  key={index}
                  className={`${styles.reportCard} ${
                    hasAnyIssue
                      ? styles.reportCardIncorrect
                      : styles.reportCardCorrect
                  }`}
                >
                  <div
                    className={`${styles.reportHeader} ${
                      hasAnyIssue
                        ? styles.reportHeaderIncorrect
                        : styles.reportHeaderCorrect
                    }`}
                  >
                    <div className={styles.reportHeaderContent}>
                      <div>
                        <h3 className={styles.reportTitle}>
                          {report.site_name}
                        </h3>
                        <p className={styles.reportSubtitle}>
                          <Car size={14} />
                          Vehicle: {report.vehicle} | ID: {report.key}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportBody}>
                    <div className={styles.reportDetails}>
                      <div className={styles.driverInfo}>
                        <div className={styles.driverName}>
                          <User size={16} />
                          <span>{report.driver_name || "N/A"}</span>
                        </div>
                        {report.driver_number &&
                          report.driver_number !== "N/A" && (
                            <a
                              href={`tel:${report.driver_number}`}
                              className={styles.callButton}
                            >
                              <Phone size={14} />
                              <span>Call</span>
                            </a>
                          )}
                      </div>

                      {/* Validation Details */}
                      <div className={styles.validationSection}>
                        <div className={styles.validationGrid}>
                          {/* Amount Validation */}
                          <div
                            className={`${styles.validationCard} ${
                              hasAmountIssue
                                ? styles.validationCardIncorrect
                                : styles.validationCardCorrect
                            }`}
                          >
                            <div className={styles.validationHeader}>
                              <DollarSign size={18} />
                              <span className={styles.validationTitle}>
                                Amount Match
                              </span>
                              <span
                                className={`${styles.validationStatus} ${
                                  hasAmountIssue
                                    ? styles.validationStatusIncorrect
                                    : styles.validationStatusCorrect
                                }`}
                              >
                                {report.amount_match ? "✓" : "✗"}
                              </span>
                            </div>
                            <div className={styles.validationDetails}>
                              <p className={styles.expectedValue}>
                                Expected: ₹{report.expected_amount}
                              </p>
                            </div>
                          </div>

                          {/* Volume Validation */}
                          <div
                            className={`${styles.validationCard} ${
                              hasVolumeIssue
                                ? styles.validationCardIncorrect
                                : styles.validationCardCorrect
                            }`}
                          >
                            <div className={styles.validationHeader}>
                              <Droplets size={18} />
                              <span className={styles.validationTitle}>
                                Volume Match
                              </span>
                              <span
                                className={`${styles.validationStatus} ${
                                  hasVolumeIssue
                                    ? styles.validationStatusIncorrect
                                    : styles.validationStatusCorrect
                                }`}
                              >
                                {report.volume_match ? "✓" : "✗"}
                              </span>
                            </div>
                            <div className={styles.validationDetails}>
                              <p className={styles.expectedValue}>
                                Expected: {report.expected_volume} L
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Fuel Slip Image */}
                        {report.image_path && (
                          <div className={styles.imageSection}>
                            <h4 className={styles.imageSectionTitle}>
                              Fuel Slip Image
                            </h4>
                            <div className={styles.fuelSlipContainer}>
                              <img
                                src={report.image_path}
                                alt="Fuel Slip"
                                className={`${styles.fuelSlipImage} ${
                                  hasAnyIssue
                                    ? styles.fuelSlipImageIncorrect
                                    : styles.fuelSlipImageCorrect
                                }`}
                                onError={(e) => {
                                  e.target.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTE2IDEwTDggMTAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                                  e.target.className = `${styles.fuelSlipImage} ${styles.fuelSlipImageError}`;
                                }}
                                onClick={() => window.open(report.image_path, '_blank')}
                              />
                              {hasAnyIssue && (
                                <div className={styles.imageWarning}>
                                  <AlertTriangle size={16} />
                                  <span>Validation Issue Detected</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Remarks */}
                        {report.remark && (
                          <div className={styles.remarksSection}>
                            <h4 className={styles.remarksSectionTitle}>
                              Remarks
                            </h4>
                            <p className={styles.remarksText}>{report.remark}</p>
                          </div>
                        )}

                        {/* Success Message */}
                        {!hasAnyIssue && (
                          <div className={styles.successMessage}>
                            <span>✅ All validations passed for this fuel slip</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.resultsCount}>
        Showing {reports.length} fuel reports
        {stats.total && ` (${stats.total} total)`}
      </div>
    </div>
  );
};

export default FuelValidationReport;