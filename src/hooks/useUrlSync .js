
export const useUrlSync = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const { selectedDate, setSelectedDate, dateRange, setDateRange } = useDate();
  const [searchParams, setSearchParams] = useSearchParams();

  const updateUrl = (updates = {}) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Add current context values
    if (selectedCity?.city) {
      newParams.set("city", selectedCity.city);
    }
    
    if (selectedDate) {
      newParams.set("date", selectedDate);
    }
    
    if (dateRange.start) {
      newParams.set("startDate", dateRange.start);
    }
    
    if (dateRange.end) {
      newParams.set("endDate", dateRange.end);
    }
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    setSearchParams(newParams, { replace: true });
  };

  const syncFromUrl = () => {
    const cityFromUrl = searchParams.get("city");
    const dateFromUrl = searchParams.get("date");
    const startDateFromUrl = searchParams.get("startDate");
    const endDateFromUrl = searchParams.get("endDate");

    if (cityFromUrl && (!selectedCity || selectedCity.city !== cityFromUrl)) {
      setSelectedCity({ city: cityFromUrl, name: cityFromUrl });
    }

    if (dateFromUrl && dateFromUrl !== selectedDate) {
      setSelectedDate(dateFromUrl);
    }

    if (startDateFromUrl || endDateFromUrl) {
      const newRange = {
        start: startDateFromUrl || dateRange.start,
        end: endDateFromUrl || dateRange.end
      };
      if (newRange.start !== dateRange.start || newRange.end !== dateRange.end) {
        setDateRange(newRange);
      }
    }
  };

  return { updateUrl, syncFromUrl };
};