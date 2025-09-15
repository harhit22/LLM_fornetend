export async function fetchCities() {
  try {
    const response = await fetch("http://127.0.0.1:8000/mobile-api/cities");

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