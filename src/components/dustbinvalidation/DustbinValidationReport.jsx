import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  User,
  AlertTriangle,
  Trash2,
  MapPin,
  Building2,
} from "lucide-react";
import { useCity } from "../../context/CityContext";

import CommonReportHeader from "../comman/ReportHeader";
import styles from "./DustbinValidationReport.module.css";
import BASE_URL from "../../api/constant/BaseUrl";
// ✅ Helper to get yesterday's date in YYYY-MM-DD format
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
};

const DustbinValidationReport = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);

  const currentReport = {
    id: "automatedsop_dustbinvalidationreport",
    name: "dustbin validation report",
    icon: "🗑️"
  };

  // ✅ Initialize dateFilter with yesterday's date
  const [dateFilter, setDateFilter] = useState(getYesterdayDate());
  const [planNameFilter, setPlanNameFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [planStats, setPlanStats] = useState([]);

  // ✅ Fetch reports from backend (always includes city + date)
  const fetchDustbinReports = useCallback(async () => {
    if (!selectedCity || !selectedCity.city) {
      setReports([]);
      setPlanStats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.set("city", selectedCity.city);
      params.set("date", dateFilter || getYesterdayDate());
      
      const queryString = params.toString();
      const url = `${BASE_URL}/mobile-api/dustbin_validation_reports/?${queryString}`;
      
      console.log('Fetching dustbin reports:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Dustbin reports response:', data);
      
      if (data.success) {
        let filteredReports = data.reports || [];
        
        // Filter by city
        filteredReports = filteredReports.filter(
          (report) => report.city && report.city.toLowerCase() === selectedCity.city.toLowerCase()
        );
        
        // Filter by plan name if selected
        if (planNameFilter) {
          filteredReports = filteredReports.filter(
            (report) => report.plan_name && report.plan_name.toLowerCase().includes(planNameFilter.toLowerCase())
          );
        }
        
        // Filter by driver name if provided
        if (driverFilter) {
          filteredReports = filteredReports.filter(
            (report) => report.driver_name && report.driver_name.toLowerCase().includes(driverFilter.toLowerCase())
          );
        }
        
        // Filter to show only incorrect reports if checkbox is checked
        if (showOnlyIncorrect) {
          filteredReports = filteredReports.filter(
            (report) =>
              !report.image01_correct ||
              !report.image02_correct ||
              !report.image03_correct ||
              !report.image04_correct
          );
        }
        
        setReports(filteredReports);
        
        // Filter plan stats by city
        const cityPlanStats = (data.zone_stats || []).filter(
          (stat) => stat.city && stat.city.toLowerCase() === selectedCity.city.toLowerCase()
        );
        setPlanStats(cityPlanStats);
        
        console.log(`Loaded ${filteredReports.length} reports for ${selectedCity.city}${planNameFilter ? ` - Plan: ${planNameFilter}` : ''}`);
      } else {
        setError("Failed to fetch dustbin reports");
        setReports([]);
        setPlanStats([]);
      }
    } catch (err) {
      setError("Failed to fetch dustbin reports");
      console.error("Error:", err);
      setReports([]);
      setPlanStats([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, dateFilter, planNameFilter, driverFilter, showOnlyIncorrect]);

  // ✅ Re-fetch when date or filters change
  useEffect(() => {
    fetchDustbinReports();
  }, [fetchDustbinReports, dateFilter]);

  // ✅ Handle refresh from CommonReportHeader (receives city and date)
  const handleCityRefresh = (city, date) => {
    setPlanNameFilter("");
    setDriverFilter("");
    setShowOnlyIncorrect(false);
    setReports([]);
    setPlanStats([]);
    setError(null);
    
    // If date is provided from header, update it
    if (date) {
      setDateFilter(date);
    }
  };

  const getAllImages = (report) => {
    console.log('need to check thus',report)
    console.log("called")
    const cacheKey = report.date ? report.date.replace(/-/g, '') : Date.now();
    console.log('sdf')
    const addCacheBuster = (url) => {
      console.log(url)
      if (!url) return '';
      console.log("somthng",url)
      return `${url}${url.includes('?') ? '&' : '?'}v=${cacheKey}`;
    };
  
    return [
      {
        path: addCacheBuster(report.image01_path),
        state: report.image01_state,
        description: "Filled dustbin - Top view",
        number: "01",
        isCorrect: report.image01_correct,
      },
      {
        path: addCacheBuster(report.image02_path),
        state: report.image02_state,
        description: "Trash outside - Far view",
        number: "02",
        isCorrect: report.image02_correct,
      },
      {
        path: addCacheBuster(report.image03_path),
        state: report.image03_state,
        description: "Empty dustbin - Top view",
        number: "03",
        isCorrect: report.image03_correct,
      },
      {
        path: addCacheBuster(report.image04_path),
        state: report.image04_state,
        description: "No trash outside - Far view",
        number: "04",
        isCorrect: report.image04_correct,
      },
    ];
  };

  const getIncorrectImages = (report) => {
    const incorrect = [];
    const images = getAllImages(report);
    images.forEach((img) => {
      if (!img.isCorrect) incorrect.push(img);
    });
    return incorrect;
  };

  const clearAllFilters = () => {
    setDateFilter(getYesterdayDate());
    setPlanNameFilter("");
    setDriverFilter("");
    setShowOnlyIncorrect(false);
  };

  // City selection screen
  if (!selectedCity || !selectedCity.city) {
    return (
      <div className={styles.container}>
        <CommonReportHeader
          currentReport={currentReport}
          showAllImages={showAllImages}
          setShowAllImages={setShowAllImages}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          showImageToggle={false}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          showDateFilter={false}
          onRefresh={handleCityRefresh}
        />
        <div className={styles.citySelectionPrompt}>
          <Building2 size={64} className={styles.cityPromptIcon} />
          <h2 className={styles.cityPromptTitle}>Select a City</h2>
          <p className={styles.cityPromptText}>
            Please select a city from the header to view {currentReport.name}s
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <CommonReportHeader
          currentReport={currentReport}
          showAllImages={showAllImages}
          setShowAllImages={setShowAllImages}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          showDateFilter={true}
          onRefresh={handleCityRefresh}
        />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading {currentReport.name}s for {selectedCity.city}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <CommonReportHeader
          currentReport={currentReport}
          showAllImages={showAllImages}
          setShowAllImages={setShowAllImages}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          showDateFilter={true}
          onRefresh={handleCityRefresh}
        />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <AlertTriangle className={styles.errorIcon} size={48} />
            <p className={styles.errorText}>{error}</p>
            <button onClick={() => fetchDustbinReports()} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Common Header with Date Filter */}
      <CommonReportHeader
        currentReport={currentReport}
        showAllImages={showAllImages}
        setShowAllImages={setShowAllImages}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        showImageToggle={true}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        showDateFilter={true}
        onRefresh={handleCityRefresh}
      />

      {/* Plan-wise Stats */}
      <div className={styles.statsContainer}>
        <div className={styles.statsHeader}>
          <h2 className={styles.statsTitle}>Plan-wise Incorrect Reports</h2>
          <div className={styles.dateDisplay}>
            <span className={styles.dateLabel}>Date:</span>
            <span className={styles.dateValue}>{dateFilter}</span>
          </div>
        </div>
        <div className={styles.statsGrid}>
          {planStats.length === 0 ? (
            <div className={styles.noZonesMessage}>
              <p>No plans available for {selectedCity.city}</p>
            </div>
          ) : (
            planStats.map((stat, index) => (
              <div
                key={`${stat.plan_name}-${index}`}
                className={`${styles.statCard} ${
                  stat.incorrect_count > 0 ? styles.statCardRed : styles.statCardGreen
                }`}
                onClick={() => setPlanNameFilter(stat.plan_name)}
                style={{ cursor: 'pointer' }}
              >
                <p className={styles.statLabel}>{stat.plan_name}</p>
                <p className={styles.statValue}>
                  {stat.incorrect_count} / {stat.total_count}
                </p>
                <p className={styles.statSubtext}>Incorrect / Total</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filters (without date - now in header) */}
      {showFilters && (
        <div className={styles.filtersSection}>
          <div className={styles.filtersContent}>
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <MapPin size={16} />
                  Plan Name
                </label>
                <input
                  type="text"
                  placeholder="Enter plan name"
                  value={planNameFilter}
                  onChange={(e) => setPlanNameFilter(e.target.value)}
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
                  Show only incorrect dustbins
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
            <Trash2 className={styles.emptyStateIcon} size={48} />
            <p className={styles.emptyStateText}>
              No {currentReport.name}s found for {selectedCity.city}
              {planNameFilter && ` in Plan ${planNameFilter}`}
            </p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map((report) => {
              const allImages = getAllImages(report);
              const incorrectImages = getIncorrectImages(report);
              const hasIncorrectImages = incorrectImages.length > 0;
              const imagesToShow = showAllImages ? allImages : incorrectImages;

              return (
                <div
                  key={report.id}
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
                          {report.city} | Plan: {report.plan_name}
                        </h3>
                        <p className={styles.reportSubtitle}>
                          <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {report.ward_address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportBody}>
                    <div className={styles.reportDetails}>
                      <div className={styles.teamInfo}>
                        <div className={styles.infoRow}>
                          <div className={styles.driverInfo}>
                            <User size={16} />
                            <span>Driver: {report.driver_name}</span>
                          </div>
                          {report.driver_mobile && report.driver_mobile !== "N/A" && (
                            <a
                              href={`tel:${report.driver_mobile}`}
                              className={styles.callButton}
                            >
                              <Phone size={14} />
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                        
                        {report.helper_name && (
                          <div className={styles.infoRow}>
                            <div className={styles.driverInfo}>
                              <User size={16} />
                              <span>Helper: {report.helper_name}</span>
                            </div>
                            {report.helper_mobile && report.helper_mobile !== "N/A" && (
                              <a
                                href={`tel:${report.helper_mobile}`}
                                className={styles.callButton}
                              >
                                <Phone size={14} />
                                <span>Call</span>
                              </a>
                            )}
                          </div>
                        )}

                        {report.second_helper_name && (
                          <div className={styles.infoRow}>
                            <div className={styles.driverInfo}>
                              <User size={16} />
                              <span>Helper 2: {report.second_helper_name}</span>
                            </div>
                            {report.second_helper_mobile && report.second_helper_mobile !== "N/A" && (
                              <a
                                href={`tel:${report.second_helper_mobile}`}
                                className={styles.callButton}
                              >
                                <Phone size={14} />
                                <span>Call</span>
                              </a>
                            )}
                          </div>
                        )}

                        <div className={styles.vehicleInfo}>
                          🚛 Vehicle: {report.vehicle_number}
                        </div>
                      </div>

                      {imagesToShow.length > 0 && (
                        <div className={styles.issuesSection}>
                          <div className={styles.issuesGrid}>
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
                                  alt={`Dustbin ${img.number}: ${img.description}`}
                                  className={styles.issueImage}
                                  onError={(e) => {
                                    e.target.src =
                                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTE2IDEwTDggMTAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                                  }}
                                />
                                <div className={styles.issueDetails}>
                                  <p className={styles.issueDescription}>
                                    Expected: {img.description}
                                  </p>
                                  <p
                                    className={`${styles.issueTitle} ${
                                      img.isCorrect
                                        ? styles.issueTitleCorrect
                                        : styles.issueTitleIncorrect
                                    }`}
                                  >
                                    AI Detected: {img.state}
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
                                    <span className={styles.correctIndicator}>✓</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!showAllImages && incorrectImages.length === 0 && (
                        <div className={styles.noIssuesMessage}>
                          <span>✅ All images are correct for this dustbin</span>
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
        Showing {reports.length} {currentReport.name}s for {selectedCity.city}
        {planNameFilter && ` in Plan ${planNameFilter}`}
        {showAllImages && (
          <span className={styles.viewModeIndicator}> • Viewing all images</span>
        )}
      </div>
    </div>
  );
};

export default DustbinValidationReport;