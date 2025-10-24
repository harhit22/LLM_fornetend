import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Phone,
  User,
  AlertTriangle,
  Eye,
  MapPin,
  Car,
  CheckCircle,
  XCircle,
  Menu,
  X,
  Users,
  Building,
  Shield,
  Shirt,
  Volume2,
  Award
} from "lucide-react";
import { useCity } from "../../context/CityContext";
import styles from "./DutyOnOffReport.module.css";
import { useDate } from "../../context/DateContext";
import BASE_URL from '../../api/constent/BaseUrl';

const DutyOnOffReport = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const { selectedDate, setSelectedDate, dateRange, setDateRange } = useDate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Local filters
  const [dateFilter, setDateFilter] = useState(selectedDate || "");
  const [zoneFilter, setZoneFilter] = useState("");
  const [driverFilter, setDriverFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [complianceFilter, setComplianceFilter] = useState(""); // all, compliant, non-compliant
  const [showFilters, setShowFilters] = useState(false);
  
  // Compliance view mode: 'all' or 'non-compliant'
  const [complianceViewMode, setComplianceViewMode] = useState('all');
  
  // Individual compliance filters (checkboxes)
  const [filterHooter, setFilterHooter] = useState(false);
  const [filterLogo, setFilterLogo] = useState(false);
  const [filterUniform, setFilterUniform] = useState(false);
  const [filterNagarNigam, setFilterNagarNigam] = useState(false);
  
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    complianceRate: 0,
    hooterCompliance: 0,
    logoCompliance: 0,
    uniformCompliance: 0,
    nagarNigamCompliance: 0
  });

  const location = useLocation();

  const fetchDutyOnOffReports = async () => {
    try {
      setLoading(true);
      
      // Build API URL with filters
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (selectedCity?.city) params.set("city", selectedCity.city);
      if (zoneFilter) params.set("zone", zoneFilter);
      if (driverFilter) params.set("driver", driverFilter);
      if (vehicleFilter) params.set("vehicle", vehicleFilter);
      if (complianceFilter) params.set("compliance", complianceFilter);
      
      const queryString = params.toString();
      const url = `${BASE_URL}/mobile-api/duty-on-off-reports/${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setReports(data.reports || []);
      setStats(data.stats || {});
    } catch (err) {
      setError("Failed to fetch duty on/off reports");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDutyOnOffReports();
  }, [dateFilter, selectedCity, zoneFilter, driverFilter, vehicleFilter, complianceFilter]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityFromUrl = params.get("city");
    const dateFromUrl = params.get("date");
    const startDateFromUrl = params.get("startDate");
    const endDateFromUrl = params.get("endDate");
    const zoneFromUrl = params.get("zone");

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

    if (zoneFromUrl) setZoneFilter(zoneFromUrl);
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
    setZoneFilter("");
    setDriverFilter("");
    setVehicleFilter("");
    setComplianceFilter("");
    setComplianceViewMode('all');
    setFilterHooter(false);
    setFilterLogo(false);
    setFilterUniform(false);
    setFilterNagarNigam(false);
  };

  const isFullyCompliant = (report) => {
    return report.hooter && report.logo && report.proper_uniform && report.nagar_nigam;
  };

  const getComplianceCount = (report) => {
    let count = 0;
    if (report.hooter) count++;
    if (report.logo) count++;
    if (report.proper_uniform) count++;
    if (report.nagar_nigam) count++;
    return count;
  };

  const getComplianceClass = (report) => {
    const compliant = isFullyCompliant(report);
    return compliant ? styles.compliant : styles.nonCompliant;
  };

  // Filter reports based on compliance settings
  const filteredReports = reports.filter(report => {
    // Check if any specific compliance checkbox is selected
    const hasSpecificFilters = filterHooter || filterLogo || filterUniform || filterNagarNigam;

    if (hasSpecificFilters) {
      // If specific filters are selected, check each one
      let matchesFilters = true;

      if (filterHooter) {
        if (complianceViewMode === 'non-compliant') {
          // Show only non-compliant hooter
          matchesFilters = matchesFilters && !report.hooter;
        }
        // If 'all' mode, hooter checkbox means "show all hooter records" (both true and false)
        // So no additional filtering needed for 'all' mode
      }

      if (filterLogo) {
        if (complianceViewMode === 'non-compliant') {
          matchesFilters = matchesFilters && !report.logo;
        }
      }

      if (filterUniform) {
        if (complianceViewMode === 'non-compliant') {
          matchesFilters = matchesFilters && !report.proper_uniform;
        }
      }

      if (filterNagarNigam) {
        if (complianceViewMode === 'non-compliant') {
          matchesFilters = matchesFilters && !report.nagar_nigam;
        }
      }

      return matchesFilters;
    } else {
      // No specific filters selected, apply general compliance view mode
      if (complianceViewMode === 'non-compliant') {
        return !isFullyCompliant(report);
      }
      return true; // Show all for 'all' mode
    }
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading duty on/off reports...</p>
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
          <button onClick={fetchDutyOnOffReports} className={styles.retryButton}>
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
              <h1 className={styles.headerTitle}>👮 Duty On/Off Reports</h1>
              {selectedCity?.city && (
                <span className={styles.contextBadge}>📍 {selectedCity.city}</span>
              )}
              {selectedDate && (
                <span className={styles.contextBadge}>📅 {selectedDate}</span>
              )}
            </div>
          </div>
          
          <div className={styles.headerActions}>
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
              onClick={() => navigateWithContext('/duty-summary')}
              className={styles.mobileNavItem}
            >
              <Shield size={18} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}
      </div>

      {/* Statistics Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total || 0}</div>
          <div className={styles.statLabel}>Total Reports</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.compliant || 0}</div>
          <div className={styles.statLabel}>Fully Compliant</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.complianceRate || 0}%</div>
          <div className={styles.statLabel}>Compliance Rate</div>
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
                  Zone
                </label>
                <input
                  type="text"
                  placeholder="Enter zone"
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <User size={16} />
                  Driver
                </label>
                <input
                  type="text"
                  placeholder="Driver name"
                  value={driverFilter}
                  onChange={(e) => setDriverFilter(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Car size={16} />
                  Vehicle
                </label>
                <input
                  type="text"
                  placeholder="Vehicle number"
                  value={vehicleFilter}
                  onChange={(e) => setVehicleFilter(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <Shield size={16} />
                  Compliance
                </label>
                <select
                  value={complianceFilter}
                  onChange={(e) => setComplianceFilter(e.target.value)}
                  className={styles.filterInput}
                >
                  <option value="">All</option>
                  <option value="compliant">Fully Compliant</option>
                  <option value="non-compliant">Non-Compliant</option>
                </select>
              </div>
            </div>

            {/* Quick Compliance Filters */}
            <div className={styles.quickFiltersSection}>
              <div className={styles.quickFiltersHeader}>
                <span className={styles.quickFiltersTitle}>Compliance View Mode:</span>
                <div className={styles.viewModeToggle}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="complianceViewMode"
                      value="all"
                      checked={complianceViewMode === 'all'}
                      onChange={(e) => setComplianceViewMode(e.target.value)}
                      className={styles.radioInput}
                    />
                    <span>All</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="complianceViewMode"
                      value="non-compliant"
                      checked={complianceViewMode === 'non-compliant'}
                      onChange={(e) => setComplianceViewMode(e.target.value)}
                      className={styles.radioInput}
                    />
                    <span>Non-Compliant Only</span>
                  </label>
                </div>
              </div>
              
              <div className={styles.complianceFilters}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filterHooter}
                    onChange={(e) => setFilterHooter(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <Volume2 size={16} />
                  <span>Hooter</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filterLogo}
                    onChange={(e) => setFilterLogo(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <Award size={16} />
                  <span>Logo</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filterUniform}
                    onChange={(e) => setFilterUniform(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <Shirt size={16} />
                  <span>Uniform</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filterNagarNigam}
                    onChange={(e) => setFilterNagarNigam(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <Shield size={16} />
                  <span>Nagar Nigam</span>
                </label>
              </div>
            </div>

            <div className={styles.filtersBottom}>
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
            <Shield className={styles.emptyStateIcon} size={48} />
            <p className={styles.emptyStateText}>
              {reports.length === 0 
                ? "No duty on/off reports found"
                : "No reports match the selected filters"}
            </p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {filteredReports.map((report, index) => {
              const fullyCompliant = isFullyCompliant(report);
              const complianceCount = getComplianceCount(report);

              return (
                <div
                  key={index}
                  className={`${styles.reportCard} ${getComplianceClass(report)}`}
                >
                  <div className={styles.reportHeader}>
                    <div className={styles.reportHeaderContent}>
                      <div className={styles.reportTitleSection}>
                        <div className={styles.reportTitle}>
                          <Building size={16} />
                          <span>Zone: {report.zone}</span>
                        </div>
                        <p className={styles.reportSubtitle}>
                          <MapPin size={14} />
                          {report.city} | {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={styles.complianceIndicator}>
                        {fullyCompliant ? (
                          <CheckCircle size={20} className={styles.compliantIcon} />
                        ) : (
                          <XCircle size={20} className={styles.nonCompliantIcon} />
                        )}
                        <span className={styles.complianceText}>
                          {complianceCount}/4 Items
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.reportBody}>
                    {/* Team Members - Driver and Helper in single row */}
                    <div className={styles.teamRow}>
                      <div className={styles.teamMemberItem}>
                        <div className={styles.memberHeader}>
                          <User size={16} />
                          <div className={styles.memberDetails}>
                            <span className={styles.memberName}>{report.driver_name || "N/A"}</span>
                            {report.driver_id && (
                              <span className={styles.memberId}>ID: {report.driver_id}</span>
                            )}
                          </div>
                        </div>
                        {report.driver_mobile && (
                          <a
                            href={`tel:${report.driver_mobile}`}
                            className={styles.callIcon}
                            title="Call Driver"
                          >
                            <Phone size={18} />
                          </a>
                        )}
                      </div>

                      <div className={styles.teamMemberItem}>
                        <div className={styles.memberHeader}>
                          <Users size={16} />
                          <div className={styles.memberDetails}>
                            <span className={styles.memberName}>{report.helper_name || "N/A"}</span>
                            {report.helper_id && (
                              <span className={styles.memberId}>ID: {report.helper_id}</span>
                            )}
                          </div>
                        </div>
                        {report.helper_mobile && (
                          <a
                            href={`tel:${report.helper_mobile}`}
                            className={styles.callIcon}
                            title="Call Helper"
                          >
                            <Phone size={18} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Number - Small text below team */}
                    <div className={styles.vehicleInfo}>
                      <Car size={14} />
                      <span>{report.vehicle_number || "N/A"}</span>
                    </div>

                    {/* Compliance Icons - 4 in a row */}
                    <div className={styles.complianceIcons}>
                      <div className={`${styles.iconItem} ${report.hooter ? styles.iconActive : styles.iconInactive}`}>
                        <Volume2 size={24} />
                        <span>Hooter</span>
                      </div>
                      <div className={`${styles.iconItem} ${report.logo ? styles.iconActive : styles.iconInactive}`}>
                        <Award size={24} />
                        <span>Logo</span>
                      </div>
                      <div className={`${styles.iconItem} ${report.proper_uniform ? styles.iconActive : styles.iconInactive}`}>
                        <Shirt size={24} />
                        <span>Uniform</span>
                      </div>
                      <div className={`${styles.iconItem} ${report.nagar_nigam ? styles.iconActive : styles.iconInactive}`}>
                        <Shield size={24} />
                        <span>Nagar Nigam</span>
                      </div>
                    </div>

                    {/* Image Section */}
                    {report.image_url && (
                      <div className={styles.imageSection}>
                        <div className={styles.imageLabelContainer}>
                          <span className={styles.imageLabel}>Fuel Slip Image</span>
                        </div>
                        <img
                          src={report.image_url}
                          alt="Duty Evidence"
                          className={styles.evidenceImage}
                          onError={(e) => {
                            e.target.src = "/api/placeholder/400/300";
                            e.target.className = `${styles.evidenceImage} ${styles.imageError}`;
                          }}
                          onClick={() => window.open(report.image_url, '_blank')}
                        />
                      </div>
                    )}

                    {/* Status Message */}
                    <div className={`${styles.statusMessage} ${getComplianceClass(report)}`}>
                      {fullyCompliant ? (
                        <span>✅ All compliance requirements met</span>
                      ) : (
                        <span>⚠️ Compliance requirements not fully met ({complianceCount}/4)</span>
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
        Showing {filteredReports.length} duty on/off reports
        {reports.length !== filteredReports.length && ` (${reports.length} total)`}
        {stats.total && ` | ${stats.total} in database`}
      </div>
    </div>
  );
};

export default DutyOnOffReport;