import { NextRequest, NextResponse } from 'next/server';
import { VoyentraAI } from '@/app/services/ai/voyentra-ai';

// Create a singleton instance
let voyentraAI: VoyentraAI | null = null;

// Update the Places API key to use the Gemini API key if no specific key is defined
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '';

// Helper function to get activity details when API calls fail
function getActivityDetails(activityName: string, destination: string, type: "attraction" | "restaurant" | "hotel" | "entertainment" | string) {
  // City and country extraction
  const cityName = destination.split(',')[0].trim();
  const countryName = destination.split(',').length > 1 ? destination.split(',')[1].trim() : '';
  
  // Generate reasonable fallback details based on activity type
  switch (type) {
    case "restaurant":
      return {
        name: activityName,
        address: `Near the center of ${cityName}`,
        openingHours: ["11:00 - 22:00 (estimated)"],
        phoneNumber: "Not available",
        cuisine: `Local ${cityName} specialties${countryName ? ` and ${countryName} cuisine` : ''}`,
        rating: "Not rated",
        priceLevel: "€€",
        website: "Not available"
      };
    case "attraction":
      return {
        name: activityName,
        address: `${cityName} ${activityName.includes("Museum") ? "Cultural District" : "Tourist Area"}`,
        openingHours: ["09:00 - 17:00 daily (estimated)"],
        cost: "Admission fees may vary",
        rating: "Not rated",
        website: "Not available"
      };
    case "hotel":
      return {
        name: activityName,
        address: `Central location in ${cityName}`,
        phoneNumber: "Not available",
        rating: "Not rated",
        website: "Not available",
        priceLevel: "€€"
      };
    case "entertainment":
      return {
        name: activityName,
        address: `Entertainment district, ${cityName}`,
        openingHours: ["18:00 - 00:00 (estimated)"],
        cost: "Prices vary",
        rating: "Not rated",
        website: "Not available",
        priceLevel: "€€"
      };
    default:
      return {
        name: activityName,
        address: `${cityName} center`,
        openingHours: ["Hours not available"],
        rating: "Not rated",
        website: "Not available"
      };
  }
}

// Helper function to fetch real-world place details from Google Places API
async function fetchPlaceDetails(query: string, type: string, location: string) {
  try {
    // First, let's try to find the place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' ' + location)}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      return null;
    }
    
    // Get details for the top result
    const placeId = searchData.results[0].place_id;
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,rating,website,opening_hours,price_level,photos&key=${GOOGLE_PLACES_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.result) {
      return null;
    }
    
    return {
      name: detailsData.result.name,
      address: detailsData.result.formatted_address,
      phoneNumber: detailsData.result.formatted_phone_number || 'Not available',
      website: detailsData.result.website || 'Not available',
      rating: detailsData.result.rating ? `${detailsData.result.rating}/5` : 'Not rated',
      priceLevel: detailsData.result.price_level ? '€'.repeat(detailsData.result.price_level) : '€€',
      openingHours: detailsData.result.opening_hours?.weekday_text || ['Hours not available'],
      photoReference: detailsData.result.photos?.[0]?.photo_reference || null
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

// Helper function to repair malformed JSON strings from AI responses
function repairJsonString(aiResponse: string): string {
  let jsonString = aiResponse;
  
  // If the response is wrapped in code blocks, extract just the JSON
  const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    jsonString = jsonMatch[1];
  } else {
    // Try to find JSON object within the response
    const objectMatch = aiResponse.match(/(\{[\s\S]*\})/);
    if (objectMatch && objectMatch[1]) {
      jsonString = objectMatch[1];
    }
  }
  
  // Clean the string
  jsonString = jsonString.trim();
  
  // Replace single quotes with double quotes
  jsonString = jsonString.replace(/'/g, '"');
  
  // Fix missing quotes around property names
  jsonString = jsonString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
  
  // Fix trailing commas in arrays and objects
  jsonString = jsonString.replace(/,(\s*[\]}])/g, '$1');
  
  // Fix missing commas between array items or object properties
  jsonString = jsonString.replace(/}(\s*){/g, '},\n$1{');
  jsonString = jsonString.replace(/](\s*)\[/g, '],\n$1[');
  
  return jsonString;
}

// Enhanced function to generate a fallback itinerary with real-world place lookup
async function generateFallbackItinerary(destination: string, tripLength: number, interests: string) {
  const days = [];
  const cityName = destination.split(',')[0].trim();
  
  for (let day = 1; day <= tripLength; day++) {
    const dailyActivities = [];
    
    // Morning activity - typically attraction or sightseeing
    const morningActivityName = `${cityName} ${day === 1 ? "Historical Center" : day === 2 ? "Museum" : day === 3 ? "Park" : "Popular Attraction"}`;
    const morningDetails = await fetchPlaceDetails(morningActivityName, 'tourist_attraction', destination);
    
    dailyActivities.push({
      id: `${day}-1`,
      time: "09:00",
      title: morningDetails?.name || morningActivityName,
      description: `Explore ${morningDetails?.name || morningActivityName} - ${morningDetails?.rating || 'a popular attraction'} in ${destination}`,
      icon: "attraction",
      priceRange: morningDetails?.priceLevel || "€€",
      details: morningDetails || getActivityDetails(morningActivityName, destination, "attraction")
    });
    
    // Lunch - restaurant
    const lunchActivityName = `Best Restaurant in ${cityName}`;
    const lunchDetails = await fetchPlaceDetails(lunchActivityName, 'restaurant', destination);
    
    dailyActivities.push({
      id: `${day}-2`,
      time: "13:00",
      title: lunchDetails?.name || `Local Restaurant in ${cityName}`,
      description: `Enjoy delicious cuisine at ${lunchDetails?.name || 'this local restaurant'} - ${lunchDetails?.rating || 'a popular dining spot'}`,
      icon: "food",
      priceRange: lunchDetails?.priceLevel || "€€",
      details: lunchDetails || getActivityDetails(lunchActivityName, destination, "restaurant")
    });
    
    // Afternoon activity
    const afternoonType = day === 1 ? "hotel" : "entertainment";
    const afternoonActivityName = day === 1 
      ? `Best Hotel in ${cityName}` 
      : `${interests || 'Popular'} activity in ${cityName}`;
    const afternoonDetails = await fetchPlaceDetails(afternoonActivityName, day === 1 ? 'lodging' : 'tourist_attraction', destination);
    
    dailyActivities.push({
      id: `${day}-3`,
      time: day === 1 ? "15:00" : "16:00",
      title: afternoonDetails?.name || (day === 1 ? `Hotel Check-in in ${cityName}` : `${cityName} Experience`),
      description: day === 1 
        ? `Check in and relax at ${afternoonDetails?.name || 'your hotel'} in ${destination}` 
        : `Experience ${afternoonDetails?.name || 'local culture'} in ${destination}`,
      icon: afternoonType,
      priceRange: afternoonDetails?.priceLevel || "€€",
      details: afternoonDetails || getActivityDetails(afternoonActivityName, destination, afternoonType)
    });
    
    // Add dinner for days other than arrival and departure
    if (day !== 1 && day !== tripLength) {
      const dinnerActivityName = `Best Dinner Restaurant in ${cityName}`;
      const dinnerDetails = await fetchPlaceDetails(dinnerActivityName, 'restaurant', destination);
      
      dailyActivities.push({
        id: `${day}-4`,
        time: "19:00",
        title: dinnerDetails?.name || `Evening Dining in ${cityName}`,
        description: `Enjoy dinner at ${dinnerDetails?.name || 'this restaurant'} - ${dinnerDetails?.rating || 'a great dinner option'} in ${destination}`,
        icon: "food",
        priceRange: dinnerDetails?.priceLevel || "€€€",
        details: dinnerDetails || getActivityDetails(dinnerActivityName, destination, "restaurant")
      });
    }
    
    days.push({
      day,
      activities: dailyActivities
    });
  }
  
  return {
    itinerary: days
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { destination, startDate, endDate, budget, travelers, tripType, interests } = body;

  if (!destination) {
    return NextResponse.json({ error: "Destination is required" }, { status: 400 });
  }

  // Calculate number of days
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start);
  end.setDate(start.getDate() + 5); // default to 5 days if no end date
  const numberOfDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Initialize Gemini AI if not already initialized
  if (!voyentraAI) {
    voyentraAI = new VoyentraAI();
  }

  let itineraryData = null;
  let attemptCount = 0;
  const maxAttempts = 2;
  let lastError = null;

  try {
    // Start with AI-generated itinerary
    while (attemptCount < maxAttempts) {
      try {
        console.log(`Sending itinerary request to AI... (Attempt ${attemptCount + 1})`);
        const prompt = `Create a personalized detailed travel itinerary for a ${numberOfDays}-day trip to ${destination} for ${travelers} travelers with a budget of $${budget}. 
    
    Traveler information: ${tripType || 'General vacation'} ${interests ? `with interests in ${interests}` : ''}
    
    Your task:
    - Create a realistic, day-by-day itinerary with specific activities and dining options unique to ${destination}
    - Include famous landmarks AND local hidden gems that aren't well-known to tourists
    - Provide authentic cultural experiences specific to ${destination}
    - Include SPECIFIC restaurant names, attraction names, and activity names (not generic placeholders)
    - Mention specific neighborhoods, districts, or areas within ${destination}
    - Adjust activities to match the budget level of $${budget}
    - Consider seasonal activities appropriate for the current time of year
    - Space activities appropriately throughout each day with realistic timing
    - If possible, suggest accommodations in an interesting area of ${destination}
    
    IMPORTANT GUIDELINES:
    - NEVER use generic placeholders like "Local Restaurant" or "City Tour" - always use specific names
    - Include exact names of attractions, restaurants, and venues that actually exist in ${destination}
    - Provide specific descriptions that mention actual attractions and dining experiences
    - Ensure activities make geographical sense (don't schedule activities far apart on same day)
    - Each activity should have a specific title that clearly indicates what it is
    - For less common destinations, BE ESPECIALLY THOROUGH in researching and providing authentic, specific attractions and restaurants
    - If you're unfamiliar with the destination, use your knowledge to provide realistic, plausible, and specific activities that would likely exist there
    
    Format your response as a JSON object with this structure:
    {
      "itinerary": [
        {
          "day": 1,
          "activities": [
            {
              "id": "1-1",
              "time": "09:00",
              "title": "SPECIFIC ACTIVITY NAME",
              "description": "SPECIFIC DESCRIPTION",
              "icon": "attraction/food/hotel/entertainment/relaxation",
              "priceRange": "€/€€/€€€"
            },
            ... more activities for day 1 ...
          ]
        },
        ... more days ...
      ]
    }
    
    ONLY output valid JSON! Do not include any text before or after the JSON. Each day should have 3-5 activities.`;

        console.log("Sending message to Gemini:", prompt);
        
        const aiResponse = await voyentraAI.sendMessage(prompt);
        console.log("Received AI response for itinerary");
        
        try {
          itineraryData = JSON.parse(aiResponse);
        } catch (parseError) {
          console.log("Failed first JSON parse attempt, trying to fix JSON string");
          
          // Try to clean and repair the JSON
          const jsonString = repairJsonString(aiResponse);
          
          // Try to parse again
          itineraryData = JSON.parse(jsonString);
        }
        
        // Make sure the data has the expected structure
        if (!itineraryData || !itineraryData.itinerary || itineraryData.itinerary.length === 0) {
          throw new Error("Invalid itinerary data structure");
        }
        
        // Successfully got itinerary data
        break;
      } catch (error) {
        lastError = error;
        console.log(`Error on attempt ${attemptCount + 1}:`, error);
        attemptCount++;
        
        // Wait briefly before trying again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If all AI attempts failed, generate a fallback itinerary with real-world data
    if (!itineraryData || !itineraryData.itinerary || itineraryData.itinerary.length === 0) {
      console.log('All AI generation attempts failed, generating fallback with real-world data');
      itineraryData = await generateFallbackItinerary(destination, numberOfDays, interests || '');
    }
    
    return NextResponse.json({
      success: true,
      itinerary: itineraryData.itinerary,
      usingFallback: attemptCount >= maxAttempts
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    
    // If an error occurs, still try to provide a fallback itinerary with real data
    console.log('Error occurred, generating fallback with real-world data');
    try {
      itineraryData = await generateFallbackItinerary(destination, numberOfDays, interests || '');
      
      return NextResponse.json({
        success: true,
        itinerary: itineraryData.itinerary,
        usingFallback: true,
        error: `AI generation failed after ${attemptCount} attempts. Using fallback data.`
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { 
          error: "Failed to generate itinerary after multiple attempts. Please try again later.",
          details: lastError ? String(lastError) : null
        }, 
        { status: 500 }
      );
    }
  }
} 