const generateAIItinerary = async (tripDetails: TripDetails) => {
  setIsGenerating(true);
  setGenerationAttempt(1);
  setIsError(false);
  setErrorMessage('');

  try {
    const response = await fetch('/api/itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: tripDetails.destination,
        startDate: tripDetails.startDate,
        endDate: tripDetails.endDate,
        budget: tripDetails.budget,
        travelers: tripDetails.travelers,
        travelerDemographics: getTravelerDemographics(tripDetails),
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    updateItineraryState(data.itinerary);
    setIsGenerating(false);
  } catch (error) {
    console.error('Failed to generate AI itinerary:', error);
    
    // If first or second attempt, try again
    if (generationAttempt < 3) {
      setGenerationAttempt(generationAttempt + 1);
      setTimeout(() => generateAIItinerary(tripDetails), 2000);
    } else {
      setIsError(true);
      setErrorMessage('We were unable to generate a complete AI itinerary. You can try again or continue with a basic itinerary.');
      // Use fallback
      const response = await fetch('/api/itinerary/fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: tripDetails.destination,
          days: getDateDifference(tripDetails.startDate, tripDetails.endDate),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateItineraryState(data.itinerary);
      }
      
      setIsGenerating(false);
    }
  }
};

// Helper function to generate traveler demographics description
const getTravelerDemographics = (tripDetails: TripDetails) => {
  const { travelers, tripType } = tripDetails;
  
  let demographicInfo = "";
  
  // Trip type information
  if (tripType === "family") {
    demographicInfo += "Family vacation with children";
  } else if (tripType === "couple") {
    demographicInfo += "Romantic couple's getaway";
  } else if (tripType === "friends") {
    demographicInfo += `Group of ${travelers} friends traveling together`;
  } else if (tripType === "solo") {
    demographicInfo += "Solo traveler";
  } else if (tripType === "business") {
    demographicInfo += "Business trip";
  } else {
    demographicInfo += `Group of ${travelers} general travelers`;
  }
  
  // Add interests if they exist
  if (tripDetails.interests && tripDetails.interests.length > 0) {
    demographicInfo += ` interested in ${tripDetails.interests.join(', ')}`;
  }
  
  return demographicInfo;
}; 