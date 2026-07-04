/**
 * Shared domain models for Echoes of a Place.
 * These types describe both API contracts and Firestore documents.
 */

// ── Feature 1: AI Destination Discovery ─────────────────────────────────────

export type Budget = "shoestring" | "moderate" | "comfortable" | "luxury";

export type TravelStyle =
  | "slow-immersive"
  | "adventurous"
  | "family"
  | "solo-reflective"
  | "social";

export interface DiscoveryRequest {
  interests: string[];
  budget: Budget;
  durationDays: number;
  travelStyle: TravelStyle;
  emotionalGoal: string;
  homeRegion?: string;
}

export interface NamedNote {
  name: string;
  note: string;
}

export interface DestinationRecommendation {
  name: string;
  country: string;
  region: string;
  tagline: string;
  /** The reasoning: why THIS place answers THIS traveler's emotional goal. */
  whyItMatters: string;
  matchedDesires: string[];
  attractions: NamedNote[];
  hiddenGems: NamedNote[];
  localExperiences: NamedNote[];
  bestTimeToVisit: string;
  dailyBudgetEstimate: string;
}

export interface DiscoveryResponse {
  destinations: DestinationRecommendation[];
}

// ── Feature 2: Cultural Story Engine ────────────────────────────────────────

export interface StoryRequest {
  destination: string;
  focus?: "history" | "legends" | "traditions" | "folklore" | "all";
}

// ── Feature 3: Time Portal ──────────────────────────────────────────────────

export type Era = "present" | "fifty-years" | "hundred-years" | "ancient";

export const ERA_LABELS: Record<Era, string> = {
  present: "Present Day",
  "fifty-years": "50 Years Ago",
  "hundred-years": "100 Years Ago",
  ancient: "Ancient Era",
};

export interface TimePortalRequest {
  destination: string;
  era: Era;
}

export interface EraPortrait {
  era: Era;
  eraLabel: string;
  approximatePeriod: string;
  /** Second-person narrated opener: "You are standing..." */
  sceneSetting: string;
  dailyLife: string;
  culturalPractices: string[];
  majorEvents: { year: string; event: string }[];
  environment: string;
  whatSurvivesToday: string;
}

// ── Feature 4: Cultural Companion Personas ──────────────────────────────────

export type PersonaId =
  | "artisan"
  | "historian"
  | "storyteller"
  | "musician"
  | "food-vendor";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface CompanionChatRequest {
  destination: string;
  personaId: PersonaId;
  history: ChatMessage[];
  message: string;
}

export interface CompanionChatResponse {
  reply: string;
}

// ── Feature 5: Hidden Heritage Explorer ─────────────────────────────────────

export type HeritageCategory =
  | "craft"
  | "music"
  | "oral-tradition"
  | "neighborhood"
  | "ritual"
  | "cuisine"
  | "other";

export type HeritageUrgency =
  | "stable"
  | "declining"
  | "endangered"
  | "critically-endangered";

export interface HeritageItem {
  name: string;
  category: HeritageCategory;
  story: string;
  whyItMatters: string;
  whyItIsDisappearing: string;
  howVisitorsCanHelp: string[];
  urgency: HeritageUrgency;
  whereToExperience: string;
}

export interface HeritageResponse {
  destination: string;
  items: HeritageItem[];
}

// ── Feature 6: Cultural Events Discovery ────────────────────────────────────

export type EventType =
  | "festival"
  | "community-gathering"
  | "exhibition"
  | "performance"
  | "celebration"
  | "market"
  | "other";

export interface EventsRequest {
  destination: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
}

export interface CulturalEvent {
  name: string;
  timing: string;
  type: EventType;
  description: string;
  significance: string;
  localCustoms: string[];
  visitorEtiquette: string[];
}

export interface EventsResponse {
  destination: string;
  events: CulturalEvent[];
}

// ── Feature 7: AI Journey Storybook ─────────────────────────────────────────

export type JourneyEntryType =
  | "discovery"
  | "story"
  | "time-portal"
  | "companion-chat"
  | "heritage"
  | "events";

export interface JourneyEntry {
  id: string;
  type: JourneyEntryType;
  destination: string;
  summary: string;
  createdAt: number; // epoch ms
}

export interface StorybookChapter {
  heading: string;
  body: string;
}

export interface Storybook {
  id: string;
  title: string;
  dedication: string;
  chapters: StorybookChapter[];
  epilogue: string;
  createdAt: number;
}

// ── API envelope ────────────────────────────────────────────────────────────

export interface ApiErrorBody {
  error: { code: string; message: string };
}
