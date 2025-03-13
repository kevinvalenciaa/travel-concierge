interface TouristAttraction {
  name: string
  distance: string
  walkingTime: string
  type: "landmark" | "shopping" | "museum" | "park" | "restaurant"
}

interface TransportRoute {
  type: "Bus" | "Metro" | "Train"
  number: string
  direction: string
  stops: string[]
  frequency: string
}

interface HotelLocation {
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  nearbyAttractions: TouristAttraction[]
  transportRoutes: TransportRoute[]
}

export const hotelLocations: Record<string, HotelLocation> = {
  "The Ritz Paris": {
    address: "15 Place Vendôme, 75001 Paris, France",
    coordinates: {
      lat: 48.8683,
      lng: 2.3282,
    },
    nearbyAttractions: [
      {
        name: "Louvre Museum",
        distance: "0.8 km",
        walkingTime: "10 min",
        type: "museum",
      },
      {
        name: "Tuileries Garden",
        distance: "0.4 km",
        walkingTime: "5 min",
        type: "park",
      },
      {
        name: "Place Vendôme",
        distance: "0.1 km",
        walkingTime: "1 min",
        type: "landmark",
      },
      {
        name: "Opéra Garnier",
        distance: "0.7 km",
        walkingTime: "9 min",
        type: "landmark",
      },
      {
        name: "Rue du Faubourg Saint-Honoré",
        distance: "0.3 km",
        walkingTime: "4 min",
        type: "shopping",
      },
    ],
    transportRoutes: [
      {
        type: "Bus",
        number: "72",
        direction: "Hotel de Ville ↔ Pont de Saint-Cloud",
        stops: ["Place Vendôme", "Tuileries", "Palais Royal"],
        frequency: "Every 8-12 minutes",
      },
      {
        type: "Metro",
        number: "1",
        direction: "La Défense ↔ Château de Vincennes",
        stops: ["Concorde", "Tuileries", "Palais Royal"],
        frequency: "Every 2-4 minutes",
      },
      {
        type: "Train",
        number: "RER A",
        direction: "Saint-Germain-en-Laye ↔ Boissy-Saint-Léger",
        stops: ["Charles de Gaulle - Étoile", "Auber", "Châtelet-Les Halles"],
        frequency: "Every 5-10 minutes",
      },
    ],
  },
  "Four Seasons George V": {
    address: "31 Avenue George V, 75008 Paris, France",
    coordinates: {
      lat: 48.8685,
      lng: 2.3008,
    },
    nearbyAttractions: [
      {
        name: "Eiffel Tower",
        distance: "1.2 km",
        walkingTime: "15 min",
        type: "landmark",
      },
      {
        name: "Champs-Élysées",
        distance: "0.4 km",
        walkingTime: "5 min",
        type: "shopping",
      },
      {
        name: "Arc de Triomphe",
        distance: "0.8 km",
        walkingTime: "10 min",
        type: "landmark",
      },
      {
        name: "Grand Palais",
        distance: "1.0 km",
        walkingTime: "12 min",
        type: "museum",
      },
      {
        name: "Lido de Paris",
        distance: "0.5 km",
        walkingTime: "6 min",
        type: "restaurant",
      },
    ],
    transportRoutes: [
      {
        type: "Bus",
        number: "32",
        direction: "Porte d'Auteuil ↔ Gare de l'Est",
        stops: ["George V", "Champs-Élysées", "Trocadéro"],
        frequency: "Every 10 minutes",
      },
      {
        type: "Bus",
        number: "80",
        direction: "Porte de Versailles ↔ Montmartre",
        stops: ["Avenue George V", "Alma-Marceau", "Iéna"],
        frequency: "Every 12 minutes",
      },
    ],
  },
  "Park Hyatt": {
    address: "3-7-1-2 Nishi Shinjuku, Shinjuku-Ku, Tokyo, Japan",
    coordinates: {
      lat: 35.6926,
      lng: 139.6901,
    },
    nearbyAttractions: [
      {
        name: "Shinjuku Gyoen National Garden",
        distance: "1.5 km",
        walkingTime: "18 min",
        type: "park",
      },
      {
        name: "Tokyo Metropolitan Government Building",
        distance: "0.3 km",
        walkingTime: "4 min",
        type: "landmark",
      },
      {
        name: "Shinjuku Station",
        distance: "0.8 km",
        walkingTime: "10 min",
        type: "landmark",
      },
      {
        name: "Takashimaya Times Square",
        distance: "1.0 km",
        walkingTime: "12 min",
        type: "shopping",
      },
      {
        name: "Robot Restaurant",
        distance: "1.2 km",
        walkingTime: "15 min",
        type: "restaurant",
      },
    ],
    transportRoutes: [
      {
        type: "Bus",
        number: "E33",
        direction: "Shinjuku Station ↔ Shibuya Station",
        stops: ["Nishi-Shinjuku", "Tokyo Metropolitan Government", "Yoyogi"],
        frequency: "Every 5-8 minutes",
      },
      {
        type: "Bus",
        number: "K54",
        direction: "Shinjuku West ↔ Nakano Station",
        stops: ["Park Hyatt", "Shinjuku Central Park", "Nakano Broadway"],
        frequency: "Every 10 minutes",
      },
    ],
  },
}

