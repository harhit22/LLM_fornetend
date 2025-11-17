import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  Building2,
  FileText,
  Calendar,
} from "lucide-react";
import { useCity } from "../../context/CityContext";
import BASE_URL from "../../api/constant/BaseUrl";
import styles from "./ReportHeader.module.css";

const CommonReportHeader = ({
  currentReport,
  showAllImages,
  setShowAllImages,
  showFilters,
  setShowFilters,
  showImageToggle = true,
  onRefresh,
  dateFilter,
  setDateFilter,
  showDateFilter = true,
}) => {
  const { selectedCity, setSelectedCity } = useCity();
  const navigate = useNavigate();

  // pick yesterday first selector
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  };

  // City selector
  const [cities, setCities] = useState([]);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Report type selector
  const [reportTypes, setReportTypes] = useState([]);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [loadingReportTypes, setLoadingReportTypes] = useState(false);

  // Initialize internal date state if not provided via props
  const [internalDateFilter, setInternalDateFilter] = useState(getYesterdayDate());
  
  // Use provided dateFilter prop or internal state
  const currentDateFilter = dateFilter !== undefined ? dateFilter : internalDateFilter;
  const handleDateChange = dateFilter !== undefined ? setDateFilter : setInternalDateFilter;

  // Fetch report types
  const fetchReportTypes = useCallback(async () => {
    try {
      setLoadingReportTypes(true);
      const url = `${BASE_URL}/mobile-api/reports/`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && Array.isArray(data.report_types)) {
        setReportTypes(data.report_types);
      } else {
        setReportTypes([]);
      }
    } catch (err) {
      console.error("Error fetching report types:", err);
      setReportTypes([]);
    } finally {
      setLoadingReportTypes(false);
    }
  }, []);

  // Fetch cities
  const fetchCities = useCallback(async () => {
    try {
      setLoadingCities(true);
      const url = `${BASE_URL}/mobile-api/cities/`;
      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setCities(data);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  // Handle report type change
  const handleReportChange = (reportType) => {
    setShowReportMenu(false);

    // Navigate to different report pages based on report type
    const reportRoutes = {
      "trip validation report": "/trip-validation-report",
      "fuel validation report": "/fuel-validation-report",
      "employee sop report": "/transport-executive-login-validation",
      "duty on off report": "/DutyOnOffReport",
      "skip lines report": "/skipline-validation-report",
      "dustbin validation report": "/dustbin-validation-report",
      "duty on off report" : "/Duty-OnOff-Report"
    };

    const route = reportRoutes[reportType.name.toLowerCase()];
    if (route) {
      navigate(route);
    } else {
      console.warn("Unknown report type:", reportType.id);
    }
  };

  // Handle city change
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setShowCityMenu(false);

    // Call onRefresh if provided
    if (onRefresh) {
      onRefresh(city, currentDateFilter);
    }
  };

  // Handle date change
  const onDateChange = (e) => {
    const newDate = e.target.value;
    handleDateChange(newDate);
    
    // Call onRefresh if provided
    if (onRefresh) {
      onRefresh(selectedCity, newDate);
    }
  };

  // Quick date selection helpers
  const setToday = () => {
    const today = new Date().toISOString().split("T")[0];
    handleDateChange(today);
    if (onRefresh) {
      onRefresh(selectedCity, today);
    }
  };

  const setYesterday = () => {
    const yesterday = getYesterdayDate();
    handleDateChange(yesterday);
    if (onRefresh) {
      onRefresh(selectedCity, yesterday);
    }
  };

  useEffect(() => {
    fetchReportTypes();
    fetchCities();
  }, [fetchReportTypes, fetchCities]);

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        {/* Left Section - Back button and Title */}
        <div className={styles.headerLeft}>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.headerTitle}>
            <span className={styles.reportIcon}>{currentReport.icon}</span>
            <span className={styles.reportName}>{currentReport.name}</span>
          </h1>
        </div>

        {/* Right Section - Actions */}
        <div className={styles.headerActions}>
          {/* Report Type Selector */}
          <div className={styles.dropdownWrapper}>
            <button
              onClick={() => setShowReportMenu(!showReportMenu)}
              className={styles.dropdownButton}
              disabled={loadingReportTypes}
              aria-label="Select report type"
            >
              <FileText size={18} />
              <span className={styles.dropdownText}>Reports</span>
              <ChevronDown
                size={16}
                className={`${styles.chevron} ${
                  showReportMenu ? styles.chevronUp : ""
                }`}
              />
            </button>

            {showReportMenu && (
              <>
                <div
                  className={styles.dropdownOverlay}
                  onClick={() => setShowReportMenu(false)}
                />
                <div className={styles.dropdownMenu}>
                  {reportTypes.length === 0 ? (
                    <div className={styles.dropdownItem}>
                      <span>No reports available</span>
                    </div>
                  ) : (
                    reportTypes.map((reportType) => (
                      <div
                        key={reportType.id}
                        className={`${styles.dropdownItem} ${
                          currentReport.id === reportType.id
                            ? styles.dropdownItemActive
                            : ""
                        }`}
                        onClick={() => handleReportChange(reportType)}
                      >
                        <span className={styles.itemIcon}>{reportType.icon}</span>
                        <span className={styles.itemName}>{reportType.name}</span>
                        {currentReport.id === reportType.id && (
                          <span className={styles.checkmark}>✓</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* City Selector */}
          <div className={styles.dropdownWrapper}>
            <button
              onClick={() => setShowCityMenu(!showCityMenu)}
              className={styles.dropdownButton}
              disabled={loadingCities}
              aria-label="Select city"
            >
              <Building2 size={18} />
              <span className={styles.dropdownText}>
                {selectedCity?.city || "Select City"}
              </span>
              <ChevronDown
                size={16}
                className={`${styles.chevron} ${
                  showCityMenu ? styles.chevronUp : ""
                }`}
              />
            </button>

            {showCityMenu && (
              <>
                <div
                  className={styles.dropdownOverlay}
                  onClick={() => setShowCityMenu(false)}
                />
                <div className={styles.dropdownMenu}>
                  {cities.length === 0 ? (
                    <div className={styles.dropdownItem}>
                      <span>No cities available</span>
                    </div>
                  ) : (
                    cities.map((city) => (
                      <div
                        key={city.id}
                        className={`${styles.dropdownItem} ${
                          selectedCity?.city === city.city
                            ? styles.dropdownItemActive
                            : ""
                        }`}
                        onClick={() => handleCityChange(city)}
                      >
                        <Building2 size={16} />
                        <span>{city.city}</span>
                        {selectedCity?.city === city.city && (
                          <span className={styles.checkmark}>✓</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Date Filter */}
          {showDateFilter && (
            <div className={styles.dateFilterWrapper}>
              <div className={styles.dateInputWrapper}>
                <Calendar size={18} className={styles.calendarIcon} />
                <input
                  type="date"
                  value={currentDateFilter}
                  onChange={onDateChange}
                  className={styles.dateInput}
                  aria-label="Select date"
                />
              </div>
            </div>
          )}

          {/* Image Toggle Button (Optional) */}
          {showImageToggle && (
            <button
              onClick={() => setShowAllImages(!showAllImages)}
              className={`${styles.actionButton} ${
                showAllImages ? styles.actionButtonActive : ""
              }`}
              title={showAllImages ? "Show only incorrect images" : "Show all images"}
              aria-label={
                showAllImages ? "Show only incorrect images" : "Show all images"
              }
            >
              {showAllImages ? <Eye size={20} /> : <EyeOff size={20} />}
              <span className={styles.actionButtonText}>
                {showAllImages ? "All" : "Issues"}
              </span>
            </button>
          )}

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.actionButton} ${
              showFilters ? styles.actionButtonActive : ""
            }`}
            aria-label="Toggle filters"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonReportHeader;