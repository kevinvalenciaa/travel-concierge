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
        address: `${activityName} is located in a central area of ${cityName}`,
        openingHours: ["11:00 - 22:00 (Mon-Thu)", "11:00 - 23:00 (Fri-Sat)", "12:00 - 21:00 (Sun)"],
        phoneNumber: "Contact information available onsite",
        cuisine: `Local ${cityName} specialties${countryName ? ` and ${countryName} cuisine` : ''}`,
        ratings: "Ratings available upon visit",
        priceLevel: "€€",
        websiteUrl: "Search online for current website",
        specialFeatures: [
          `Authentic ${cityName} dining experience`,
          `Popular among locals and visitors`,
          `Known for regional specialties`
        ]
      };
    case "attraction":
      return {
        name: activityName,
        address: `${activityName} is located in the ${activityName.includes("Museum") ? "Cultural District" : "Tourist Area"} of ${cityName}`,
        openingHours: ["09:00 - 17:00 (Tue-Sun)", "Closed on Mondays"],
        cost: "Admission fees may vary by season. Check at entrance.",
        ratings: "A popular attraction in the area",
        websiteUrl: "Search online for current website",
        specialFeatures: [
          `One of ${cityName}'s notable sites`,
          `Offers insight into local culture and history`,
          `Worth visiting according to travel guides`
        ]
      };
    case "hotel":
      return {
        name: activityName,
        address: `Located in a convenient area of ${cityName}`,
        phoneNumber: "Contact information available online",
        ratings: "Ratings available on major booking sites",
        websiteUrl: "Search major booking sites for availability",
        priceLevel: "€€",
        specialFeatures: [
          `Convenient location for exploring ${cityName}`,
          `Comfortable accommodations`,
          `Standard amenities for travelers`
        ]
      };
    case "entertainment":
      return {
        name: activityName,
        address: `Located in the entertainment district of ${cityName}`,
        openingHours: ["18:00 - 00:00 (Thu-Sat)", "Closed Sun-Wed"],
        cost: "Prices vary by event and seating",
        ratings: "Popular entertainment venue",
        websiteUrl: "Search online for current schedule",
        priceLevel: "€€",
        specialFeatures: [
          `Authentic ${cityName} entertainment experience`,
          `Frequented by locals and visitors alike`,
          `Features regional cultural elements`
        ]
      };
    default:
      return {
        name: activityName,
        address: `Located in ${cityName}`,
        openingHours: ["Hours vary seasonally"],
        ratings: "Information available upon visit",
        websiteUrl: "Search online for current information",
        specialFeatures: [
          `Part of the ${cityName} experience`,
          `Worth including in your itinerary`
        ]
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
    
    // Get details for the top result - expand fields to get more comprehensive information
    const placeId = searchData.results[0].place_id;
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,rating,user_ratings_total,website,opening_hours,price_level,photos,reviews,url,vicinity,international_phone_number,address_components&key=${GOOGLE_PLACES_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.result) {
      return null;
    }
    
    // Extract opening hours in a more readable format
    const formattedHours = detailsData.result.opening_hours?.weekday_text || ['Hours not available'];
    
    // Extract review information if available
    const reviews = detailsData.result.reviews || [];
    const reviewHighlights = reviews.slice(0, 2).map((review: { text: string }) => review.text);
    
    // Format address components for better display
    const addressComponents = detailsData.result.address_components || [];
    const neighborhood = addressComponents.find((component: { types: string[], long_name: string }) => 
      component.types.includes('neighborhood') || 
      component.types.includes('sublocality_level_1')
    )?.long_name || '';
    
    // Extract and format price level
    let priceLevel = '€€';
    if (detailsData.result.price_level) {
      priceLevel = '€'.repeat(detailsData.result.price_level);
    }
    
    // Determine the main type/category of the place
    let placeType = type;
    if (type === 'restaurant') {
      placeType = 'restaurant';
    } else if (type === 'tourist_attraction' || type === 'museum' || type === 'park') {
      placeType = 'attraction';
    } else if (type === 'lodging') {
      placeType = 'hotel';
    }
    
    // Compile special features based on the place type
    const specialFeatures = [];
    if (neighborhood) {
      specialFeatures.push(`Located in the ${neighborhood} area`);
    }
    
    if (detailsData.result.rating >= 4.5) {
      specialFeatures.push(`Highly rated (${detailsData.result.rating}/5)`);
    }
    
    if (placeType === 'restaurant' && priceLevel) {
      specialFeatures.push(`${priceLevel} price range`);
    }
    
    if (placeType === 'attraction' && detailsData.result.user_ratings_total > 1000) {
      specialFeatures.push('Popular attraction with numerous reviews');
    }
    
    if (reviewHighlights.length > 0) {
      specialFeatures.push('Well reviewed by visitors');
    }
    
    return {
      name: detailsData.result.name,
      address: detailsData.result.formatted_address,
      phoneNumber: detailsData.result.formatted_phone_number || detailsData.result.international_phone_number || 'Not available',
      websiteUrl: detailsData.result.website || detailsData.result.url || 'Not available',
      ratings: detailsData.result.rating ? `${detailsData.result.rating}/5 (${detailsData.result.user_ratings_total || 'N/A'} reviews)` : 'Not rated',
      priceLevel: priceLevel,
      openingHours: formattedHours,
      photoReference: detailsData.result.photos?.[0]?.photo_reference || null,
      mapUrl: detailsData.result.url || null,
      reviewHighlights: reviewHighlights.length > 0 ? reviewHighlights : undefined,
      specialFeatures: specialFeatures,
      placeType: placeType,
      vicinity: detailsData.result.vicinity || null
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
  
  // Fix common issues with Gemini responses:
  
  // 1. Fix unescaped quotes in strings
  jsonString = jsonString.replace(/"([^"]*?)\\?"([^"]*?)"/g, (match, p1, p2) => {
    return `"${p1}\\\"${p2}"`;
  });
  
  // 2. Fix line breaks within string values
  jsonString = jsonString.replace(/"([^"]*)(\n|\r\n|\r)([^"]*)"/g, (match, p1, p2, p3) => {
    return `"${p1} ${p3}"`;
  });
  
  // 3. Fix double quotes within already quoted strings
  let inString = false;
  let result = '';
  
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString[i];
    const prevChar = i > 0 ? jsonString[i - 1] : '';
    
    if (char === '"' && prevChar !== '\\') {
      inString = !inString;
      result += char;
    } else if (char === '"' && prevChar !== '\\' && inString) {
      result += '\\"'; // Escape inner quotes
    } else {
      result += char;
    }
  }
  
  // If conversion worked, use the result
  if (result) {
    jsonString = result;
  }
  
  // Convert JavaScript-style comments to empty strings
  jsonString = jsonString.replace(/\/\/.*$/gm, '');
  jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // As a last resort, try to fix the most common JSON errors:
  try {
    JSON.parse(jsonString);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const errorMessage = error.message;
      const position = error.message.match(/position (\d+)/);
      
      if (position && position[1]) {
        const errorPos = parseInt(position[1]);
        const problemArea = jsonString.substring(Math.max(0, errorPos - 20), Math.min(jsonString.length, errorPos + 20));
        console.log(`JSON error near: ${problemArea}`);
        
        // Check for common errors and fix them
        if (errorMessage.includes("Expected ',' or '}'")) {
          // Missing comma or extra property - try removing the problematic property
          const beforeError = jsonString.substring(0, errorPos);
          const afterError = jsonString.substring(errorPos);
          const propertyMatch = beforeError.match(/,?\s*"[^"]+"\s*:\s*("[^"]*"|[\d.]+|true|false|null|\{[\s\S]*\}|\[[\s\S]*\])$/);
          
          if (propertyMatch) {
            // Remove the property that's causing the issue
            jsonString = beforeError.substring(0, beforeError.length - propertyMatch[0].length) + afterError;
          } else {
            // Try adding a closing bracket
            jsonString = beforeError + "}" + afterError;
          }
        } else if (errorMessage.includes("Unexpected token")) {
          // Try removing the unexpected token
          jsonString = jsonString.substring(0, errorPos) + jsonString.substring(errorPos + 1);
        } else if (errorMessage.includes("JSON.parse: unexpected character")) {
          // Try removing the character
          jsonString = jsonString.substring(0, errorPos) + jsonString.substring(errorPos + 1);
        }
      }
    }
  }
  
  return jsonString;
}

// Enhanced function to generate a fallback itinerary with real-world place lookup
async function generateFallbackItinerary(destination: string, tripLength: number, interests: string) {
  const days = [];
  const cityName = destination.split(',')[0].trim();
  
  // Define different activity types to search for more diverse options
  const activityTypes = [
    { type: 'tourist_attraction', query: 'popular attraction', icon: 'attraction' },
    { type: 'museum', query: 'museum', icon: 'attraction' },
    { type: 'park', query: 'park', icon: 'attraction' },
    { type: 'restaurant', query: 'best restaurant', icon: 'food' },
    { type: 'restaurant', query: 'local food', icon: 'food' },
    { type: 'shopping_mall', query: 'shopping', icon: 'entertainment' },
    { type: 'night_club', query: 'nightlife', icon: 'nightlife' },
    { type: 'cafe', query: 'cafe', icon: 'food' },
    { type: 'art_gallery', query: 'gallery', icon: 'attraction' },
    { type: 'lodging', query: 'hotel', icon: 'hotel' },
  ];
  
  // Build a cache of activities to avoid duplicates
  const activityCache = new Map();
  
  // Preload some popular attractions
  for (const activityType of activityTypes) {
    try {
      const searchTerm = `${activityType.query} in ${destination}`;
      const details = await fetchPlaceDetails(searchTerm, activityType.type, destination);
      if (details && details.name) {
        const cacheKey = `${details.name}-${activityType.type}`;
        if (!activityCache.has(cacheKey)) {
          activityCache.set(cacheKey, {
            ...details,
            icon: activityType.icon
          });
        }
      }
    } catch (error) {
      console.error(`Error preloading ${activityType.type}:`, error);
    }
  }
  
  // Add interest-specific activities if interests are provided
  if (interests) {
    const interestsList = interests.split(',').map(i => i.trim());
    for (const interest of interestsList) {
      try {
        const interestQuery = `${interest} in ${destination}`;
        const details = await fetchPlaceDetails(interestQuery, 'point_of_interest', destination);
        if (details && details.name) {
          const cacheKey = `${details.name}-interest`;
          if (!activityCache.has(cacheKey)) {
            activityCache.set(cacheKey, {
              ...details,
              icon: 'attraction'
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching interest-specific activity:`, error);
      }
    }
  }
  
  // Create activities for each day
  for (let day = 1; day <= tripLength; day++) {
    // Define the activity type to avoid type errors
    interface Activity {
      id: string;
      time: string;
      title: string;
      description: string;
      icon: string;
      priceRange: string;
      details: any;
    }

    const dailyActivities: Activity[] = [];
    
    // Morning activity - typically attraction or sightseeing
    // For first day, prioritize a major attraction
    let morningActivity;
    if (day === 1) {
      const majorAttractionQuery = `most famous attraction in ${destination}`;
      const morningDetails = await fetchPlaceDetails(majorAttractionQuery, 'tourist_attraction', destination);
      
      morningActivity = {
        id: `${day}-1`,
        time: "09:00",
        title: morningDetails?.name || `${cityName} Major Attraction`,
        description: `Explore ${morningDetails?.name || `a popular attraction`} in ${destination}`,
        icon: "attraction",
        priceRange: morningDetails?.priceLevel || "€€",
        details: morningDetails || getActivityDetails(`Major Attraction in ${cityName}`, destination, "attraction")
      };
    } else {
      // For other days, rotate through different attraction types
      const attractionTypes = ['tourist_attraction', 'museum', 'park'];
      const attractionType = attractionTypes[(day - 1) % attractionTypes.length];
      
      // Try to get a cached attraction or fetch a new one
      let morningDetails;
      const cachedAttractions = Array.from(activityCache.values())
        .filter(act => act.placeType === 'attraction')
        .filter(act => !dailyActivities.some(a => a.title === act.name));
      
      if (cachedAttractions.length > 0) {
        // Use a cached attraction
        morningDetails = cachedAttractions[day % cachedAttractions.length];
      } else {
        // Fetch a new attraction
        const morningQuery = day % 3 === 0 
          ? `hidden gem in ${destination}` 
          : `popular ${attractionType} in ${destination}`;
        morningDetails = await fetchPlaceDetails(morningQuery, attractionType, destination);
      }
      
      morningActivity = {
        id: `${day}-1`,
        time: "09:00",
        title: morningDetails?.name || `${cityName} ${attractionType.replace('_', ' ')}`,
        description: `Explore ${morningDetails?.name || `a popular ${attractionType.replace('_', ' ')}`} in ${destination}`,
        icon: "attraction",
        priceRange: morningDetails?.priceLevel || "€€",
        details: morningDetails || getActivityDetails(`${attractionType} in ${cityName}`, destination, "attraction")
      };
    }
    
    dailyActivities.push(morningActivity);
    
    // Lunch activity - always a restaurant
    // Try to get a restaurant near the morning activity if possible
    let lunchDetails;
    const lunchNearby = `restaurant near ${morningActivity.title} in ${destination}`;
    lunchDetails = await fetchPlaceDetails(lunchNearby, 'restaurant', destination);
    
    if (!lunchDetails) {
      // Fallback to general restaurant search
      const lunchQuery = day % 2 === 0 ? `best restaurant in ${destination}` : `local cuisine in ${destination}`;
      lunchDetails = await fetchPlaceDetails(lunchQuery, 'restaurant', destination);
    }
    
    dailyActivities.push({
      id: `${day}-2`,
      time: "13:00",
      title: lunchDetails?.name || `Restaurant in ${cityName}`,
      description: `Enjoy ${lunchDetails?.name || 'local'} cuisine in ${destination}`,
      icon: "food",
      priceRange: lunchDetails?.priceLevel || "€€",
      details: lunchDetails || getActivityDetails(`Restaurant in ${cityName}`, destination, "restaurant")
    });
    
    // Afternoon activity
    if (day === 1) {
      // First day: Hotel check-in
      const hotelDetails = await fetchPlaceDetails(`best hotel in ${destination}`, 'lodging', destination);
      
      dailyActivities.push({
        id: `${day}-3`,
        time: "15:00",
        title: hotelDetails?.name || `Hotel Check-in in ${cityName}`,
        description: `Check in and relax at your accommodation in ${destination}`,
        icon: "hotel",
        priceRange: hotelDetails?.priceLevel || "€€",
        details: hotelDetails || getActivityDetails(`Hotel in ${cityName}`, destination, "hotel")
      });
    } else {
      // Other days: Rotate between cultural, outdoor, and shopping activities
      const afternoonActivities = [
        { type: 'shopping_mall', query: 'shopping area', icon: 'entertainment' },
        { type: 'art_gallery', query: 'art or culture', icon: 'attraction' },
        { type: 'park', query: 'park or nature', icon: 'attraction' },
        { type: 'cafe', query: 'cafe or relaxing spot', icon: 'food' },
      ];
      
      const activityIndex = (day - 2) % afternoonActivities.length;
      const activityChoice = afternoonActivities[activityIndex];
      
      // Try to find something related to user interests if provided
      let afternoonDetails;
      if (interests && day % 3 === 0) {
        const interestsList = interests.split(',').map(i => i.trim());
        const selectedInterest = interestsList[day % interestsList.length];
        const interestQuery = `${selectedInterest} activity in ${destination}`;
        afternoonDetails = await fetchPlaceDetails(interestQuery, 'point_of_interest', destination);
      }
      
      // If no interest-specific activity or no interests provided
      if (!afternoonDetails) {
        afternoonDetails = await fetchPlaceDetails(
          `${activityChoice.query} in ${destination}`, 
          activityChoice.type, 
          destination
        );
      }
      
      dailyActivities.push({
        id: `${day}-3`,
        time: "15:30",
        title: afternoonDetails?.name || `${activityChoice.query} in ${cityName}`,
        description: `Experience ${afternoonDetails?.name || activityChoice.query} in ${destination}`,
        icon: activityChoice.icon,
        priceRange: afternoonDetails?.priceLevel || "€€",
        details: afternoonDetails || getActivityDetails(
          `${activityChoice.query} in ${cityName}`, 
          destination, 
          activityChoice.icon
        )
      });
    }
    
    // Evening activity (for all days except day 1 which has hotel check-in)
    if (day !== 1) {
      const eveningOptions = [
        { type: 'restaurant', query: 'fine dining', icon: 'food' },
        { type: 'night_club', query: 'nightlife', icon: 'nightlife' },
        { type: 'bar', query: 'popular bar', icon: 'nightlife' },
        { type: 'movie_theater', query: 'entertainment', icon: 'entertainment' },
      ];
      
      const eveningChoice = eveningOptions[day % eveningOptions.length];
      const eveningDetails = await fetchPlaceDetails(
        `${eveningChoice.query} in ${destination}`, 
        eveningChoice.type, 
        destination
      );
      
      dailyActivities.push({
        id: `${day}-4`,
        time: "19:00",
        title: eveningDetails?.name || `Evening ${eveningChoice.query} in ${cityName}`,
        description: `Enjoy ${eveningDetails?.name || eveningChoice.query} in ${destination}`,
        icon: eveningChoice.icon,
        priceRange: eveningDetails?.priceLevel || "€€€",
        details: eveningDetails || getActivityDetails(
          `${eveningChoice.query} in ${cityName}`, 
          destination, 
          eveningChoice.icon
        )
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
  const maxAttempts = 3;
  let lastError = null;
  let usingFallback = false;

  try {
    // Start with AI-generated itinerary using the dedicated itinerary method
    console.log(`Generating itinerary for ${destination} (${numberOfDays} days)`);

    // Make multiple attempts if needed
    while (attemptCount < maxAttempts && !itineraryData) {
      try {
        console.log(`Attempt ${attemptCount + 1} of ${maxAttempts}`);
        
        // Use the specialized itinerary generation method
        const aiResponse = await voyentraAI.generateItinerary(
          destination,
          numberOfDays,
          budget || 1000,
          travelers || 2,
          interests,
          tripType
        );
        
        console.log("Received AI response for itinerary");
        
        // Try to parse the response as JSON
        try {
          // Direct parse first
          itineraryData = JSON.parse(aiResponse);
          console.log("Successfully parsed response as JSON");
        } catch (parseError) {
          console.log("Failed direct JSON parse, attempting repair");
          
          // Apply JSON repair function
          const repairedJson = repairJsonString(aiResponse);
          
          // Second attempt with repaired JSON
          try {
            itineraryData = JSON.parse(repairedJson);
            console.log("Successfully parsed repaired JSON");
          } catch (secondError) {
            console.log("JSON repair failed, will try fallback");
            throw secondError;
          }
        }
        
        // Validate the parsed data structure
        if (!itineraryData || !itineraryData.itinerary || !Array.isArray(itineraryData.itinerary) || itineraryData.itinerary.length === 0) {
          console.log("Invalid itinerary structure received from AI");
          throw new Error("Invalid itinerary data structure");
        }
        
        console.log(`Successfully generated itinerary with ${itineraryData.itinerary.length} days`);
        break;
        
      } catch (error) {
        lastError = error;
        console.log(`Error on attempt ${attemptCount + 1}:`, error);
        attemptCount++;
        
        if (attemptCount < maxAttempts) {
          // Wait before trying again (exponential backoff)
          const waitTime = 1000 * attemptCount;
          console.log(`Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If all AI attempts failed, use fallback with real-world data
    if (!itineraryData) {
      console.log('All AI generation attempts failed, using fallback with real-world data');
      itineraryData = await generateFallbackItinerary(destination, numberOfDays, interests || '');
      usingFallback = true;
    }
    
    return NextResponse.json({
      success: true,
      itinerary: itineraryData.itinerary,
      usingFallback
    });
  } catch (error) {
    console.error("Error generating itinerary:", error);
    
    // If an error occurs, still try to provide a fallback itinerary with real data
    console.log('Error occurred, using fallback with real-world data');
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