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
  Award,
  RectangleHorizontal
} from "lucide-react";
import { useCity } from "../../context/CityContext";
import styles from "./DutyOnOffReport.module.css";
import { useDate } from "../../context/DateContext";
import BASE_URL from '../../api/constant/BaseUrl';

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
  const [complianceFilter, setComplianceFilter] = useState("all");
  
  // Display filters - which compliance items to show
  const [displayFilters, setDisplayFilters] = useState({
    hooter: true,
    logo: true,
    uniform: true,
    nagarNigam: true,
    numberPlate: true
  });
  
  // Temp display filters for UI
  const [tempDisplayFilters, setTempDisplayFilters] = useState({
    hooter: true,
    logo: true,
    uniform: true,
    nagarNigam: true,
    numberPlate: true
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    compliant1: 0,
    nonCompliant1: 0,
    complianceRate1: 0,
    compliant2: 0,
    nonCompliant2: 0,
    complianceRate2: 0
  });

  const location = useLocation();

  const fetchDutyOnOffReports = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (selectedCity?.city) params.set("city", selectedCity.city);
      if (zoneFilter) params.set("zone", zoneFilter);
      if (driverFilter) params.set("driver", driverFilter);
      if (vehicleFilter) params.set("vehicle", vehicleFilter);
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, selectedCity, zoneFilter, driverFilter, vehicleFilter, displayFilters]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setComplianceFilter("all");
    setTempDisplayFilters({
      hooter: true,
      logo: true,
      uniform: true,
      nagarNigam: true,
      numberPlate: true
    });
  };

  const applyDisplayFilters = () => {
    setDisplayFilters(tempDisplayFilters);
  };

  const hasActiveDisplayFilters = () => {
    return Object.values(tempDisplayFilters).some(val => val);
  };

  const toggleDisplayFilter = (filterName) => {
    setTempDisplayFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const isFullyCompliant1 = (report) => {
    let checks = [];
    if (displayFilters.hooter) checks.push(report.hooter_1);
    if (displayFilters.logo) checks.push(report.logo_1);
    if (displayFilters.uniform) checks.push(report.proper_uniform_1);
    if (displayFilters.nagarNigam) checks.push(report.nagar_nigam_1);
    if (displayFilters.numberPlate) checks.push(report.number_plate_1);
    
    return checks.length > 0 && checks.every(check => check);
  };

  const isFullyCompliant2 = (report) => {
    let checks = [];
    if (displayFilters.hooter) checks.push(report.hooter_2);
    if (displayFilters.logo) checks.push(report.logo_2);
    if (displayFilters.uniform) checks.push(report.proper_uniform_2);
    if (displayFilters.nagarNigam) checks.push(report.nagar_nigam_2);
    if (displayFilters.numberPlate) checks.push(report.number_plate_2);
    
    return checks.length > 0 && checks.every(check => check);
  };

  const getComplianceCount1 = (report) => {
    let count = 0;
    if (displayFilters.hooter && report.hooter_1) count++;
    if (displayFilters.logo && report.logo_1) count++;
    if (displayFilters.uniform && report.proper_uniform_1) count++;
    if (displayFilters.nagarNigam && report.nagar_nigam_1) count++;
    if (displayFilters.numberPlate && report.number_plate_1) count++;
    return count;
  };

  const getComplianceCount2 = (report) => {
    let count = 0;
    if (displayFilters.hooter && report.hooter_2) count++;
    if (displayFilters.logo && report.logo_2) count++;
    if (displayFilters.uniform && report.proper_uniform_2) count++;
    if (displayFilters.nagarNigam && report.nagar_nigam_2) count++;
    if (displayFilters.numberPlate && report.number_plate_2) count++;
    return count;
  };

  const getTotalDisplayFilters = () => {
    return Object.values(displayFilters).filter(val => val).length;
  };

  const getComplianceClass = (isCompliant) => {
    return isCompliant ? styles.compliant : styles.nonCompliant;
  };

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

        {showNavMenu && (
          <div className={styles.mobileNavMenu}>
            <button
              onClick={() => navigateWithContext('/skipline-summary')}
              className={styles.mobileNavItem}
            >
              <Shield size={18} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}
      </div>

      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total || 0}</div>
          <div className={styles.statLabel}>Total Reports</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.compliant1 || 0}</div>
          <div className={styles.statLabel}>Duty In Compliant</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.complianceRate1 || 0}%</div>
          <div className={styles.statLabel}>Duty In Rate</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.compliant2 || 0}</div>
          <div className={styles.statLabel}>Duty Out Compliant</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.complianceRate2 || 0}%</div>
          <div className={styles.statLabel}>Duty Out Rate</div>
        </div>
      </div>

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
                  <CheckCircle size={16} />
                  Compliance
                </label>
                <select
                  value={complianceFilter}
                  onChange={(e) => setComplianceFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="compliant">Compliant</option>
                  <option value="non-compliant">Non-Compliant</option>
                </select>
              </div>
            </div>

            {/* Display Filters - Select which compliance items to show */}
            <div className={styles.complianceFiltersSection}>
              <div className={styles.complianceFiltersTitle}>
                <Eye size={16} />
                <span>Select Compliance Items to Display</span>
              </div>
              <div className={styles.displayFiltersGrid}>
                <label className={styles.displayFilterLabel}>
                  <input
                    type="checkbox"
                    checked={tempDisplayFilters.hooter}
                    onChange={() => toggleDisplayFilter('hooter')}
                    className={styles.filterCheckbox}
                  />
                  <Volume2 size={16} />
                  <span>Hooter</span>
                </label>
                
                <label className={styles.displayFilterLabel}>
                  <input
                    type="checkbox"
                    checked={tempDisplayFilters.logo}
                    onChange={() => toggleDisplayFilter('logo')}
                    className={styles.filterCheckbox}
                  />
                  <Award size={16} />
                  <span>Logo</span>
                </label>
                
                <label className={styles.displayFilterLabel}>
                  <input
                    type="checkbox"
                    checked={tempDisplayFilters.uniform}
                    onChange={() => toggleDisplayFilter('uniform')}
                    className={styles.filterCheckbox}
                  />
                  <Shirt size={16} />
                  <span>Uniform</span>
                </label>
                
                <label className={styles.displayFilterLabel}>
                  <input
                    type="checkbox"
                    checked={tempDisplayFilters.nagarNigam}
                    onChange={() => toggleDisplayFilter('nagarNigam')}
                    className={styles.filterCheckbox}
                  />
                  <Shield size={16} />
                  <span>Nagar Nigam</span>
                </label>

                <label className={styles.displayFilterLabel}>
                  <input
                    type="checkbox"
                    checked={tempDisplayFilters.numberPlate}
                    onChange={() => toggleDisplayFilter('numberPlate')}
                    className={styles.filterCheckbox}
                  />
                  <RectangleHorizontal size={16} />
                  <span>Number Plate</span>
                </label>
              </div>
            </div>
              
            <div className={styles.complianceSubmitContainer}>
              <button 
                onClick={applyDisplayFilters} 
                className={styles.applyFiltersButton}
                disabled={!hasActiveDisplayFilters()}
              >
                <Filter size={16} />
                Apply Display Filters
              </button>
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
        {reports.length === 0 ? (
          <div className={styles.emptyState}>
            <Shield className={styles.emptyStateIcon} size={48} />
            <p className={styles.emptyStateText}>No duty on/off reports found</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map((report, index) => {
              const fullyCompliant1 = isFullyCompliant1(report);
              const fullyCompliant2 = isFullyCompliant2(report);
              const complianceCount1 = getComplianceCount1(report);
              const complianceCount2 = getComplianceCount2(report);
              const totalFilters = getTotalDisplayFilters();

              // Apply compliance filter
              const isCompliant = fullyCompliant1 && fullyCompliant2;
              if (complianceFilter === "compliant" && !isCompliant) return null;
              if (complianceFilter === "non-compliant" && isCompliant) return null;

              return (
                <div
                  key={index}
                  className={styles.reportCard}
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

                    {/* Dual Image Section with Compliance Icons */}
                    <div className={styles.dualImageSection}>
                      {/* Duty In Section */}
                      <div className={styles.imageColumn}>
                        <div className={styles.imageLabelContainer}>
                          <span className={styles.imageLabel}>Duty In</span>
                          <div className={`${styles.complianceIndicator} ${getComplianceClass(fullyCompliant1)}`}>
                            {fullyCompliant1 ? (
                              <CheckCircle size={16} className={styles.compliantIcon} />
                            ) : (
                              <XCircle size={16} className={styles.nonCompliantIcon} />
                            )}
                            <span className={styles.complianceText}>
                              {complianceCount1}/{totalFilters}
                            </span>
                          </div>
                        </div>
                        
                        {/* Compliance Icons for Duty In */}
                        <div className={styles.complianceItemsRow}>
                          {displayFilters.hooter && (
                            <div className={`${styles.complianceItem} ${report.hooter_1 ? styles.itemActive : styles.itemInactive}`}>
                              <Volume2 size={16} />
                              <span>Hooter</span>
                            </div>
                          )}
                          {displayFilters.logo && (
                            <div className={`${styles.complianceItem} ${report.logo_1 ? styles.itemActive : styles.itemInactive}`}>
                              <Award size={16} />
                              <span>Logo</span>
                            </div>
                          )}
                          {displayFilters.uniform && (
                            <div className={`${styles.complianceItem} ${report.proper_uniform_1 ? styles.itemActive : styles.itemInactive}`}>
                              <Shirt size={16} />
                              <span>Uniform</span>
                            </div>
                          )}
                          {displayFilters.nagarNigam && (
                            <div className={`${styles.complianceItem} ${report.nagar_nigam_1 ? styles.itemActive : styles.itemInactive}`}>
                              <Shield size={16} />
                              <span>Nagar Nigam</span>
                            </div>
                          )}
                          {displayFilters.numberPlate && (
                            <div className={`${styles.complianceItem} ${report.number_plate_1 ? styles.itemActive : styles.itemInactive}`}>
                              <RectangleHorizontal size={16} />
                              <span>Number Plate</span>
                            </div>
                          )}
                        </div>

                        {/* Image for Duty In */}
                        {report.image_url_1 ? (
                          <img
                            src={report.image_url_1}
                            alt="Duty In Evidence"
                            className={styles.evidenceImage}
                            onError={(e) => {
                              e.target.src = "/api/placeholder/400/300";
                              e.target.className = `${styles.evidenceImage} ${styles.imageError}`;
                            }}
                            onClick={() => window.open(report.image_url_1, '_blank')}
                          />
                        ) : (
                          <div className={styles.noImagePlaceholder}>
                            <Eye size={32} />
                            <span>No image available</span>
                          </div>
                        )}
                      </div>

                      {/* Duty Out Section */}
                      <div className={styles.imageColumn}>
                        <div className={styles.imageLabelContainer}>
                          <span className={styles.imageLabel}>Duty Out</span>
                          <div className={`${styles.complianceIndicator} ${getComplianceClass(fullyCompliant2)}`}>
                            {fullyCompliant2 ? (
                              <CheckCircle size={16} className={styles.compliantIcon} />
                            ) : (
                              <XCircle size={16} className={styles.nonCompliantIcon} />
                            )}
                            <span className={styles.complianceText}>
                              {complianceCount2}/{totalFilters}
                            </span>
                          </div>
                        </div>
                        
                        {/* Compliance Icons for Duty Out */}
                        <div className={styles.complianceItemsRow}>
                          {displayFilters.hooter && (
                            <div className={`${styles.complianceItem} ${report.hooter_2 ? styles.itemActive : styles.itemInactive}`}>
                              <Volume2 size={16} />
                              <span>Hooter</span>
                            </div>
                          )}
                          {displayFilters.logo && (
                            <div className={`${styles.complianceItem} ${report.logo_2 ? styles.itemActive : styles.itemInactive}`}>
                              <Award size={16} />
                              <span>Logo</span>
                            </div>
                          )}
                          {displayFilters.uniform && (
                            <div className={`${styles.complianceItem} ${report.proper_uniform_2 ? styles.itemActive : styles.itemInactive}`}>
                              <Shirt size={16} />
                              <span>Uniform</span>
                            </div>
                          )}
                          {displayFilters.nagarNigam && (
                            <div className={`${styles.complianceItem} ${report.nagar_nigam_2 ? styles.itemActive : styles.itemInactive}`}>
                              <Shield size={16} />
                              <span>Nagar Nigam</span>
                            </div>
                          )}
                          {displayFilters.numberPlate && (
                            <div className={`${styles.complianceItem} ${report.number_plate_2 ? styles.itemActive : styles.itemInactive}`}>
                              <RectangleHorizontal size={16} />
                              <span>Number Plate</span>
                            </div>
                          )}
                        </div>

                        {/* Image for Duty Out */}
                        {report.image_url_2 ? (
                          <img
                            src={report.image_url_2}
                            alt="Duty Out Evidence"
                            className={styles.evidenceImage}
                            onError={(e) => {
                              e.target.src = "/api/placeholder/400/300";
                              e.target.className = `${styles.evidenceImage} ${styles.imageError}`;
                            }}
                            onClick={() => window.open(report.image_url_2, '_blank')}
                          />
                        ) : (
                          <div className={styles.noImagePlaceholder}>
                            <Eye size={32} />
                            <span>No image available</span>
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
        Showing {reports.length} duty on/off reports
        {stats.total && ` (${stats.total} total)`}
      </div>
    </div>
  );
};

export default DutyOnOffReport;