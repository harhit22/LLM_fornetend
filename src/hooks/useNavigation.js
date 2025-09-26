import { useNavigate, useSearchParams } from "react-router-dom";
import { useGlobalContext } from "../context/CityContext"; // Import the combined hook

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { getGlobalParams } = useGlobalContext();

  const buildUrlWithGlobalContext = (path, localParams = {}) => {
    const params = new URLSearchParams();
    
    // Add ONLY global context parameters (city, date, date range)
    const globalParams = getGlobalParams();
    Object.entries(globalParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value);
      }
    });
    
    // Add local parameters specific to this report
    Object.entries(localParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value);
      }
    });
    
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  const navigateWithGlobalContext = (path, localParams = {}) => {
    const fullPath = buildUrlWithGlobalContext(path, localParams);
    navigate(fullPath);
  };

  const generateShareableUrl = (path, localParams = {}) => {
    const fullUrl = buildUrlWithGlobalContext(path, localParams);
    return `${window.location.origin}${fullUrl}`;
  };

  return {
    navigateWithGlobalContext,
    buildUrlWithGlobalContext,
    generateShareableUrl
  };
};
