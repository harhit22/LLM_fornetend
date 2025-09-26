import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Phone,
  User,
  AlertTriangle,
  Truck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCity } from "../../context/CityContext";
import styles from "./TripValidationReport.module.css";
import { Navigate } from "react-router-dom";

const TripValidationReport = () => {
  const { selectedCity } = useCity();
  console.log("Selected City in TripValidationReport:", selectedCity); // Debug log
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);

  // New state for image viewing
  const [showAllImages, setShowAllImages] = useState(false); // Toggle between showing all images or only incorrect

  // Filters
  const [dateFilter, setDateFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const naviagte = useNavigate();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    incorrect: 0,
    today: 0,
    thisWeek: 0,
  });
  const location = useLocation();

  useEffect(() => {
    fetchTripReports();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const city = params.get("city");
    const date = params.get("date");

    if (city) {
      // Override context if needed
      console.log("City from URL:", city);
    }
    if (date) {
      setDateFilter(date);
    }
  }, [location.search]);

  useEffect(() => {
    applyFilters();
  }, [reports, dateFilter, driverFilter, showOnlyIncorrect, selectedCity]);

  const fetchTripReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:8000/mobile-api/trip-validation-reports/"
      );
      const data = await response.json();
      setReports(data.reports || []);
      calculateStats(data.reports || []);
    } catch (err) {
      setError("Failed to fetch trip reports");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reportsData) => {
    const today = new Date().toDateString();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const total = reportsData.length;
    const incorrect = reportsData.filter(
      (report) =>
        !report.image01_correct ||
        !report.image02_correct ||
        !report.image03_correct ||
        !report.image04_correct
    ).length;

    const todayReports = reportsData.filter(
      (report) => new Date(report.date).toDateString() === today
    ).length;

    const thisWeekReports = reportsData.filter(
      (report) => new Date(report.date) >= oneWeekAgo
    ).length;

    setStats({
      total,
      incorrect,
      today: todayReports,
      thisWeek: thisWeekReports,
    });
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (dateFilter) {
      filtered = filtered.filter((report) => report.date === dateFilter);
    }

    if (driverFilter) {
      filtered = filtered.filter((report) =>
        report.driver_name.toLowerCase().includes(driverFilter.toLowerCase())
      );
    }

    if (selectedCity && selectedCity.city) {
      filtered = filtered.filter((report) =>
        report.site_name.toLowerCase().includes(selectedCity.city.toLowerCase())
      );
    }

    if (showOnlyIncorrect) {
      filtered = filtered.filter(
        (report) =>
          !report.image01_correct ||
          !report.image02_correct ||
          !report.image03_correct ||
          !report.image04_correct
      );
    }

    setFilteredReports(filtered);
  };

  // Enhanced function to get all images (correct and incorrect)
  const getAllImages = (report) => {
    const images = [];

    // Image 01
    images.push({
      path: report.image01_path,
      state: report.image01_state,
      description: "Trash without tripal in vehicle",
      number: "01",
      isCorrect: report.image01_correct,
    });

    // Image 02
    images.push({
      path: report.image02_path,
      state: report.image02_state,
      description: "Trash covered with tripal in vehicle",
      number: "02",
      isCorrect: report.image02_correct,
    });

    // Image 03
    images.push({
      path: report.image03_path,
      state: report.image03_state,
      description: "No trash in vehicle",
      number: "03",
      isCorrect: report.image03_correct,
    });

    // Image 04
    images.push({
      path: report.image04_path,
      state: report.image04_state,
      description: "Trash without any tripal",
      number: "04",
      isCorrect: report.image04_correct,
    });

    return images;
  };

  const getIncorrectImages = (report) => {
    const incorrect = [];
    if (!report.image01_correct) {
      incorrect.push({
        path: report.image01_path,
        state: report.image01_state,
        description: "Trash without tripal in vehicle",
        number: "01",
        isCorrect: false,
      });
    }
    if (!report.image02_correct) {
      incorrect.push({
        path: report.image02_path,
        state: report.image02_state,
        description: "Trash covered with tripal in vehicle",
        number: "02",
        isCorrect: false,
      });
    }
    if (!report.image03_correct) {
      incorrect.push({
        path: report.image03_path,
        state: report.image03_state,
        description: "No trash in vehicle",
        number: "03",
        isCorrect: false,
      });
    }
    if (!report.image04_correct) {
      incorrect.push({
        path: report.image04_path,
        state: report.image04_state,
        description: "Trash without any tripal",
        number: "04",
        isCorrect: false,
      });
    }
    return incorrect;
  };

  const clearAllFilters = () => {
    setDateFilter("");
    setDriverFilter("");
    setShowOnlyIncorrect(false);
  };

  const getState = () => {
    naviagte("/driver-trip-summary");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading trip reports...</p>
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
          <button onClick={fetchTripReports} className={styles.retryButton}>
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
            <h1 className={styles.headerTitle}>🚛 Trip Validation Report</h1>
          </div>
          <div className={styles.headerActions}>
            {/* Image View Toggle Button */}
            <button
              onClick={() => setShowAllImages(!showAllImages)}
              className={`${styles.imageToggleButton} ${
                showAllImages ? styles.imageToggleActive : ""
              }`}
              title={
                showAllImages ? "Show only incorrect images" : "Show all images"
              }
            >
              {showAllImages ? <Eye size={20} /> : <EyeOff size={20} />}
              <span className={styles.imageToggleText}>
                {showAllImages ? "All Images" : "Issues Only"}
              </span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterButton}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statsGrid} onClick={getState}>
          <div className={`${styles.statCard} ${styles.statCardBlue}`}>
            <p className={styles.statLabel}>full summary</p>
          
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
                  Driver Name
                </label>
                <input
                  type="text"
                  placeholder="Enter driver name"
                  value={driverFilter}
                  onChange={(e) => setDriverFilter(e.target.value)}
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
                  Show only incorrect trips
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
            <Truck className={styles.emptyStateIcon} size={48} />
            <p className={styles.emptyStateText}>No trip reports found</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {filteredReports.map((report, index) => {
              const allImages = getAllImages(report);
              const incorrectImages = getIncorrectImages(report);
              const hasIncorrectImages = incorrectImages.length > 0;

              // Determine which images to show based on toggle
              const imagesToShow = showAllImages ? allImages : incorrectImages;

              return (
                <div
                  key={index}
                  className={`${styles.reportCard} ${
                    hasIncorrectImages
                      ? styles.reportCardIncorrect
                      : styles.reportCardCorrect
                  }`}
                >
                  <div
                    className={`${styles.reportHeader} ${
                      hasIncorrectImages
                        ? styles.reportHeaderIncorrect
                        : styles.reportHeaderCorrect
                    }`}
                  >
                    <div className={styles.reportHeaderContent}>
                      <div>
                        <h3 className={styles.reportTitle}>
                          {report.site_name} | Zone: {report.zone}
                        </h3>
                        <p className={styles.reportSubtitle}>
                          Trip: {report.trip_number}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportBody}>
                    <div className={styles.reportDetails}>
                      <div className={styles.driverInfo}>
                        <div className={styles.driverName}>
                          <User size={16} />
                          <span>{report.driver_name}</span>
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

                      {/* Show images based on toggle state */}
                      {imagesToShow.length > 0 && (
                        <div className={styles.issuesSection}>
                          <div className={styles.issuesGrid}>
                            {/* Render image cards */}
                            {imagesToShow.map((img, imgIndex) => (
                              <div
                                key={imgIndex}
                                className={`${styles.issueCard} ${
                                  img.isCorrect
                                    ? styles.issueCardCorrect
                                    : styles.issueCardIncorrect
                                }`}
                              >
                                <img
                                  src={img.path}
                                  alt={`Image ${img.number}`}
                                  className={styles.issueImage}
                                  onError={(e) => {
                                    e.target.src =
                                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTE2IDEwTDggMTAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                                    e.target.className = `${styles.issueImage} bg-gray-100`;
                                  }}
                                />
                                <div className={styles.issueDetails}>
                                  <p className={styles.issueDescription}>
                                    Exp. - {img.description}
                                  </p>
                                  <p
                                    className={`${styles.issueTitle} ${
                                      img.isCorrect
                                        ? styles.issueTitleCorrect
                                        : styles.issueTitleIncorrect
                                    }`}
                                  >
                                    AI🤖 - {img.state}
                                  </p>
                                </div>
                                <div
                                  className={`${styles.imgNumberBadge} ${
                                    img.isCorrect
                                      ? styles.imgNumberBadgeCorrect
                                      : styles.imgNumberBadgeIncorrect
                                  }`}
                                >
                                  {img.number}
                                  {img.isCorrect && (
                                    <span className={styles.correctIndicator}>
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Fill remaining cells when showing all images (2x2 grid) */}
                            {showAllImages &&
                              imagesToShow.length < 4 &&
                              Array.from(
                                { length: 4 - imagesToShow.length },
                                (_, index) => (
                                  <div
                                    key={`empty-${index}`}
                                    className={styles.emptyGridCell}
                                  >
                                    <span>No Image</span>
                                  </div>
                                )
                              )}
                          </div>
                        </div>
                      )}

                      {/* Show message when no images to display */}
                      {!showAllImages && incorrectImages.length === 0 && (
                        <div className={styles.noIssuesMessage}>
                          <span>✅ All images are correct for this trip</span>
                        </div>
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
        Showing {filteredReports.length} of {reports.length} trips
        {showAllImages && (
          <span className={styles.viewModeIndicator}>
            {" "}
            • Viewing all images
          </span>
        )}
      </div>
    </div>
  );
};

export default TripValidationReport;
