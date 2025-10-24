import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CityProvider } from "./context/CityContext";
import Home from "./pages/home/Home";
import Report from "./pages/report/Report";
import TripValidationReport from "./components/tripValidationReport/TripValidationReport ";
import DriverTripSummary from "./components/driverTripSummery/DriverTripSummary ";
import FuelValidationReport from "./components/fuelValidationReport/FuelValidationReport"
import SkiplineValidationReport from "./components/skiplineValidationReport/SkiplineValidationReport";
import TransportExecutiveLoginValidation from "./components/TransportExecutiveLoginValidation/TransportExecutiveLoginValidation";
import { DateProvider } from "./context/DateContext";
import DutyOnOffReport from "./components/dutyonoffvalidation/DutyOnOffReport";
function App() {
  return (
    <CityProvider>
      <DateProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/trip-validation-report" element={<TripValidationReport />} />
            <Route path="/driver-trip-summary" element={<DriverTripSummary />} />
            <Route path="/fuel-validation-report" element={<FuelValidationReport />} />
            <Route path="/skipline-validation-report" element={<SkiplineValidationReport />} />
            <Route path="/transport-executive-login-validation" element={<TransportExecutiveLoginValidation />} />
            <Route path="/DutyOnOffReport" element={<DutyOnOffReport />} />
          
        </Routes>
      </Router>
    </DateProvider>
    </CityProvider>
  );
}

export default App;