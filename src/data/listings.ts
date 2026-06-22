export type ListingStatus = "available" | "pending" | "sold";

export type Listing = {
  id: string;
  name: string;
  neighborhood?: string;
  propertyType?: string;
  status?: ListingStatus;
  priceUsd: number;
  address: string;
  city: string;
  state: "VA" | "NC";
  sqft: number;
  bedrooms: number;
  bathroomsFull: number;
  bathroomsHalf: number;
  yearBuilt?: number;
  garageSpaces?: number;
  lotSqft?: number;
  imageUrl?: string;
  gallery?: string[];
  description?: string;
  features?: string[];
  floorPlanUrl?: string;
};

export const seedListings: Listing[] = [
  {
    id: "oakmont-manor",
    name: "Oakmont Manor",
    neighborhood: "Norfolk, Granby Street Corridor",
    propertyType: "Residential · Detached",
    status: "available",
    priceUsd: 370000,
    address: "3033 Somme Avenue",
    city: "Norfolk",
    state: "VA",
    sqft: 2092,
    bedrooms: 4,
    bathroomsFull: 2,
    bathroomsHalf: 1,
    yearBuilt: 1998,
    garageSpaces: 2,
    description:
      "Welcome to Oakmont Manor — a spacious four-bedroom home nestled in one of Norfolk's most sought-after neighborhoods. This beautifully maintained property features an open-concept main floor with abundant natural light, an updated kitchen with granite countertops, and a generous primary suite with walk-in closet. The backyard offers a private retreat perfect for entertaining, while the two-car garage provides ample storage. Walking distance to top-rated schools, parks, and local dining.",
    features: [
      "Updated kitchen with granite countertops and stainless appliances",
      "Primary suite with walk-in closet and en-suite bath",
      "Open-concept living and dining area",
      "Hardwood floors throughout main level",
      "Private fenced backyard with patio",
      "Two-car attached garage",
      "Central HVAC (2021)",
      "Zoned for top-rated Norfolk schools",
    ],
  },
  {
    id: "westfield-house-locust",
    name: "Westfield House",
    neighborhood: "Norfolk, Ghent / Park Place",
    propertyType: "Residential · Detached",
    status: "available",
    priceUsd: 299900,
    address: "3154 Locust Avenue",
    city: "Norfolk",
    state: "VA",
    sqft: 1206,
    bedrooms: 4,
    bathroomsFull: 2,
    bathroomsHalf: 0,
    yearBuilt: 1985,
    description:
      "A well-priced gem in a charming Norfolk neighborhood. This four-bedroom home offers a functional floor plan ideal for families or investors seeking strong rental potential in the Hampton Roads market. Recent updates include fresh interior paint, new flooring in the main living areas, and a refreshed kitchen. Conveniently located near major employers, military bases, and interstate access.",
    features: [
      "Four bedrooms on one level",
      "Two full bathrooms",
      "Updated flooring in living areas",
      "Refreshed kitchen cabinetry and fixtures",
      "Spacious backyard",
      "Close to military bases and employers",
      "Easy interstate access",
    ],
  },
  {
    id: "westfield-house-central",
    name: "Westfield House",
    neighborhood: "Central Suffolk, Lloyd Place",
    propertyType: "Residential · Detached",
    status: "available",
    priceUsd: 149900,
    address: "307 Central Avenue",
    city: "Suffolk",
    state: "VA",
    sqft: 840,
    bedrooms: 3,
    bathroomsFull: 1,
    bathroomsHalf: 0,
    yearBuilt: 1972,
    description:
      "An affordable entry point into Suffolk's growing real estate market. This cozy three-bedroom home is ideal for first-time buyers or investors looking to capitalize on the area's rapid appreciation. The layout is efficient and livable, with a bright living space, eat-in kitchen, and a generous yard. Priced to move — don't miss this opportunity.",
    features: [
      "Three bedrooms",
      "Eat-in kitchen",
      "Bright living area with large windows",
      "Generous backyard — ideal for outdoor living",
      "Low-maintenance exterior",
      "Priced below market for quick sale",
      "Near schools, shops, and transit",
    ],
  },
];
