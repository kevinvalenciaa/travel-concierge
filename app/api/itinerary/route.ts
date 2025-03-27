import { NextRequest, NextResponse } from 'next/server';
import { VoyentraAI } from '@/app/services/ai/voyentra-ai';

// Create a singleton instance
let voyentraAI: VoyentraAI | null = null;

export async function POST(req: NextRequest) {
  try {
    // Check if API key is present
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('Missing Gemini API key in environment variables');
      return NextResponse.json(
        { 
          error: "Unable to access travel API. Please try again later." 
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { destination, startDate, endDate, budget, travelers, travelerDemographics } = body;

    if (!destination || !startDate || !endDate || !budget || !travelers) {
      return NextResponse.json(
        { 
          error: "Missing required trip information." 
        },
        { status: 400 }
      );
    }

    // Initialize the AI instance if it doesn't exist
    if (!voyentraAI) {
      try {
        console.log('Initializing VoyentraAI instance for itinerary generation...');
        voyentraAI = new VoyentraAI();
        console.log('VoyentraAI instance created successfully');
      } catch (initError) {
        console.error('Failed to initialize VoyentraAI:', initError);
        return NextResponse.json(
          { 
            error: "Failed to initialize travel planner." 
          },
          { status: 500 }
        );
      }
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const tripDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    
    // Format date range for prompt
    const dateRange = `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;

    // Create the AI prompt
    const prompt = `Create a personalized detailed travel itinerary for a ${tripDuration}-day trip to ${destination} for ${travelers} travelers with a budget of $${budget}. 
    
    Traveler information: ${travelerDemographics || "General travelers"}
    
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

    console.log('Sending itinerary request to AI...');
    const aiResponse = await voyentraAI.sendMessage(prompt);
    console.log('Received AI response for itinerary');
    
    try {
      // Try to extract JSON from the response
      let jsonString = aiResponse;
      
      // If there's text before or after the JSON, extract just the JSON part
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
      
      // Clean the string (sometimes AI adds extra characters)
      jsonString = jsonString.trim();
      
      // Try to parse the JSON
      let itineraryData;
      try {
        itineraryData = JSON.parse(jsonString);
      } catch (initialParseError) {
        // If parsing fails, try to fix common JSON issues and try again
        console.error('Failed first JSON parse attempt, trying to fix JSON string');
        
        // Replace single quotes with double quotes
        jsonString = jsonString.replace(/'/g, '"');
        
        // Try to find and fix missing quotes around property names
        jsonString = jsonString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
        
        // Try to parse again
        itineraryData = JSON.parse(jsonString);
      }
      
      // Make sure the data has the expected structure
      if (!itineraryData || !itineraryData.itinerary || !Array.isArray(itineraryData.itinerary)) {
        // If itinerary is missing, create a basic structure
        console.error('Parsed JSON but missing correct structure');
        
        // Create a fallback itinerary with basic information
        itineraryData = {
          itinerary: generateFallbackItinerary(tripDuration, destination)
        };
      }
      
      return NextResponse.json(itineraryData);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI response was:', aiResponse);
      
      // Create a fallback itinerary instead of just returning an error
      const fallbackItinerary = {
        itinerary: generateFallbackItinerary(tripDuration, destination)
      };
      
      return NextResponse.json(fallbackItinerary);
    }
  } catch (error) {
    console.error('Itinerary API Error:', error);
    return NextResponse.json(
      { 
        error: "An error occurred while generating your itinerary." 
      },
      { status: 500 }
    );
  }
}

// Function to generate a basic fallback itinerary if AI fails
function generateFallbackItinerary(days: number, destination: string) {
  const itinerary = [];
  
  // Get destination-specific activities based on common tourist attractions
  const destinationAttractions = getDestinationActivities(destination);
  
  for (let day = 1; day <= days; day++) {
    const activities = [];
    
    // Morning activity
    activities.push({
      id: `${day}-1`,
      icon: "attraction",
      time: "09:00",
      title: destinationAttractions.morningActivities[day % destinationAttractions.morningActivities.length],
      description: `Explore this famous attraction in ${destination}`,
      priceRange: "€€"
    });
    
    // Lunch
    activities.push({
      id: `${day}-2`,
      icon: "food",
      time: "13:00",
      title: destinationAttractions.restaurants[day % destinationAttractions.restaurants.length],
      description: `Enjoy delicious local cuisine in ${destination}`,
      priceRange: "€€"
    });
    
    // Afternoon activity or hotel check-in on first day
    if (day === 1) {
      activities.push({
        id: `${day}-3`,
        icon: "hotel",
        time: "15:00",
        title: "Hotel Check-in",
        description: `Check in to your accommodation in ${destinationAttractions.neighborhoods[0]}`,
        priceRange: "€€€"
      });
    } else {
      activities.push({
        id: `${day}-3`,
        icon: "attraction",
        time: "15:00",
        title: destinationAttractions.afternoonActivities[(day - 1) % destinationAttractions.afternoonActivities.length],
        description: `Experience this popular attraction in ${destination}`,
        priceRange: "€€"
      });
    }
    
    // Dinner - not on last day
    if (day !== days) {
      activities.push({
        id: `${day}-4`,
        icon: "food",
        time: "19:00",
        title: destinationAttractions.dinnerSpots[day % destinationAttractions.dinnerSpots.length],
        description: `Dinner at this well-known restaurant in ${destination}`,
        priceRange: "€€"
      });
      
      // Evening activity - not on first or last day
      if (day !== 1) {
        activities.push({
          id: `${day}-5`,
          icon: "entertainment",
          time: "21:00",
          title: destinationAttractions.eveningActivities[(day - 1) % destinationAttractions.eveningActivities.length],
          description: `Experience the nightlife and entertainment in ${destination}`,
          priceRange: "€€"
        });
      }
    }
    
    itinerary.push({
      day: day,
      activities: activities
    });
  }
  
  return itinerary;
}

// Helper function to provide destination-specific activities
function getDestinationActivities(destination: string) {
  // Default activities for any destination
  const defaultActivities = {
    morningActivities: ["City Tour", "Museum Visit", "Local Market Tour"],
    afternoonActivities: ["Historical District Tour", "Cultural Experience", "Shopping District"],
    eveningActivities: ["Cultural Show", "Local Music Venue", "Sunset Cruise"],
    restaurants: ["Local Cuisine Restaurant", "Popular Eatery", "Traditional Dining Experience"],
    dinnerSpots: ["Highly-Rated Restaurant", "Authentic Local Dining", "Scenic Dinner Spot"],
    neighborhoods: ["Downtown", "Tourist District", "Popular Area"]
  };

  // Lowercase the destination for easier matching
  const lowerDestination = destination.toLowerCase();
  
  // Destination-specific activities
  if (lowerDestination.includes("hawaii") || lowerDestination.includes("honolulu") || lowerDestination.includes("maui")) {
    return {
      morningActivities: ["Diamond Head Hike", "Pearl Harbor Visit", "Hanauma Bay Snorkeling", "Waikiki Beach Morning", "Polynesian Cultural Center"],
      afternoonActivities: ["North Shore Beaches", "Dole Plantation Tour", "Iolani Palace Visit", "Waimea Valley Hike", "Kualoa Ranch Tour"],
      eveningActivities: ["Waikiki Sunset Viewing", "Luau Experience", "Kuhio Beach Torch Lighting", "Live Hawaiian Music", "Honolulu Night Market"],
      restaurants: ["Duke's Waikiki", "Mama's Fish House", "Helena's Hawaiian Food", "Marukame Udon", "Ono Hawaiian Foods"],
      dinnerSpots: ["Morio's Sushi Bistro", "Alan Wong's Restaurant", "Merriman's", "Roy's Waikiki", "House Without a Key"],
      neighborhoods: ["Waikiki", "Kailua", "Lahaina", "North Shore", "Kapahulu"]
    };
  } 
  else if (lowerDestination.includes("paris") || lowerDestination.includes("france")) {
    return {
      morningActivities: ["Eiffel Tower Visit", "Louvre Museum Tour", "Notre-Dame Cathedral", "Arc de Triomphe", "Montmartre Walk"],
      afternoonActivities: ["Seine River Cruise", "Musée d'Orsay", "Luxembourg Gardens", "Champs-Élysées Shopping", "Palace of Versailles"],
      eveningActivities: ["Moulin Rouge Show", "Paris Opera Performance", "Seine River Night Cruise", "Eiffel Tower Light Show", "Le Marais Nightlife"],
      restaurants: ["Café de Flore", "Les Deux Magots", "L'As du Fallafel", "Bistrot Paul Bert", "Le Comptoir du Relais"],
      dinnerSpots: ["Le Jules Verne", "Chez L'Ami Jean", "Septime", "Le Chateaubriand", "Brasserie Lipp"],
      neighborhoods: ["Le Marais", "Saint-Germain-des-Prés", "Montmartre", "Latin Quarter", "Opera District"]
    };
  }
  else if (lowerDestination.includes("new york") || lowerDestination.includes("nyc")) {
    return {
      morningActivities: ["Statue of Liberty Visit", "Central Park Walk", "Empire State Building", "Metropolitan Museum", "Brooklyn Bridge Walk"],
      afternoonActivities: ["Times Square Exploration", "High Line Park", "Chelsea Market", "Museum of Modern Art", "Grand Central Terminal"],
      eveningActivities: ["Broadway Show", "Jazz Club in Harlem", "Rooftop Bar Experience", "Greenwich Village Tour", "Comedy Club Show"],
      restaurants: ["Katz's Delicatessen", "Peter Luger Steak House", "Russ & Daughters", "Lombardi's Pizza", "Shake Shack"],
      dinnerSpots: ["Gramercy Tavern", "Le Bernardin", "Balthazar", "Carbone", "Keens Steakhouse"],
      neighborhoods: ["Manhattan", "Brooklyn", "SoHo", "Upper East Side", "Lower East Side"]
    };
  }
  else if (lowerDestination.includes("tokyo") || lowerDestination.includes("japan")) {
    return {
      morningActivities: ["Meiji Shrine", "Tsukiji Fish Market", "Senso-ji Temple", "Tokyo Skytree", "Imperial Palace Gardens"],
      afternoonActivities: ["Harajuku Shopping", "Ueno Park", "Akihabara Electronics District", "Roppongi Hills", "Tokyo National Museum"],
      eveningActivities: ["Robot Restaurant Show", "Izakaya Hopping in Shinjuku", "Tokyo Bay Cruise", "Karaoke in Shibuya", "Golden Gai Bars"],
      restaurants: ["Ichiran Ramen", "Sushi Dai", "Tonkatsu Maisen", "Tempura Kondo", "Tsukiji Sushisay"],
      dinnerSpots: ["Sukiyabashi Jiro", "Gonpachi", "Kyubey", "Ukai-tei", "Tapas Molecular Bar"],
      neighborhoods: ["Shinjuku", "Shibuya", "Ginza", "Asakusa", "Roppongi"]
    };
  }
  else if (lowerDestination.includes("london") || lowerDestination.includes("uk") || lowerDestination.includes("england")) {
    return {
      morningActivities: ["Tower of London", "British Museum", "Buckingham Palace", "Westminster Abbey", "St. Paul's Cathedral"],
      afternoonActivities: ["London Eye", "Tate Modern", "Hyde Park", "Covent Garden", "National Gallery"],
      eveningActivities: ["West End Show", "Shakespeare's Globe Theatre", "Soho Nightlife", "Jack the Ripper Tour", "River Thames Cruise"],
      restaurants: ["Borough Market Eateries", "Dishoom", "The Ivy", "The Wolseley", "Gordon Ramsay Restaurant"],
      dinnerSpots: ["Rules Restaurant", "Dinner by Heston Blumenthal", "Duck & Waffle", "Sketch", "The Ledbury"],
      neighborhoods: ["Westminster", "Soho", "Notting Hill", "Kensington", "Camden"]
    };
  }
  else if (lowerDestination.includes("rome") || lowerDestination.includes("italy")) {
    return {
      morningActivities: ["Colosseum Tour", "Vatican Museums", "Roman Forum", "Trevi Fountain", "Pantheon Visit"],
      afternoonActivities: ["Spanish Steps", "Villa Borghese", "Piazza Navona", "Trastevere Walk", "Castel Sant'Angelo"],
      eveningActivities: ["Opera at Teatro dell'Opera", "Campo de' Fiori Nightlife", "Trastevere Dining", "Tiber River Walk", "Piazza Navona at Night"],
      restaurants: ["Da Enzo al 29", "Roscioli", "La Pergola", "Armando al Pantheon", "Pizzarium"],
      dinnerSpots: ["Antica Pesa", "Il Pagliaccio", "La Pergola", "Glass Hostaria", "Ad Hoc"],
      neighborhoods: ["Vatican", "Trastevere", "Monti", "Centro Storico", "Testaccio"]
    };
  }
  // Return default if no specific destination match found
  return defaultActivities;
} 