import BASE_URL from "../constant/BaseUrl";
export async function fetchCities() {
  try {
    const response = await fetch(`${BASE_URL}/mobile-api/cities`);

    if (!response.ok) {
      throw new Error("Failed to fetch cities");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error fetching city data:", error);
    throw error; // rethrow so component knows it failed
  }
}