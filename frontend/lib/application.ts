/**
 * CANDIDATE APPLICATION CONTRACT
 * ──────────────────────────────
 * Shape + dropdown options for the "Apply" form shown when a candidate applies
 * to a Job Requirement.
 *
 * IMPORTANT: every option list below is mirrored EXACTLY from the Salesforce Lead
 * picklists (restricted), discovered via the Lead describe API. The values are
 * submitted verbatim to the Salesforce "Create Lead" endpoint, so they must match
 * Salesforce character-for-character (including "Onsite" without a hyphen and the
 * en-dash "–" in the training schedule) or Salesforce rejects the lead.
 *
 * `appliedJobRequirementId` is hidden in the UI but submitted - it links the
 * application back to the Job Requirement record (used for verification).
 */

export interface ApplicationPayload {
  appliedJobRequirementId: string; // hidden - = JobRequirement.id
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  niche: string;
  nicheOther: string; // only relevant when niche === "Other"
  addressSearch: string;
  country: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  preferredWorkMode: string;
  primaryTechnology: string;
  // resume is sent as a File via multipart/form-data, not part of this JSON shape
  genderIdentity: string;
  yearsOfExperience: string;
  visaStatus: string;
  trainingSchedule: string;
}

// Salesforce: Niche__c (restricted picklist)
export const NICHE_OPTIONS = [
  "AI ML Engineer",
  "Python Developer/Engineer",
  "Java Fullstack Developer/Engineer",
  "Product/Project Manager",
  "Marketing Manager",
  "Finance Analyst",
  "Other",
] as const;

// Salesforce: Preferred_Work_Mode__c (restricted) - note "Onsite", no hyphen.
export const WORK_MODE_OPTIONS = ["Remote", "Hybrid", "Onsite"] as const;

// Salesforce: GenderIdentity (restricted picklist)
export const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Nonbinary",
  "Not Listed",
  "I choose not to disclose",
] as const;

// yearsOfExperience is a NUMBER in Salesforce; the /api/apply route parses the
// leading integer from these range labels before submitting.
export const EXPERIENCE_OPTIONS = [
  "0–1 years",
  "1–3 years",
  "3–5 years",
  "5–8 years",
  "8–12 years",
  "12+ years",
] as const;

// Salesforce: Visa_Status__c / Current_Visa_Status__c (restricted picklist)
export const VISA_STATUS_OPTIONS = [
  "US Citizen",
  "Green Card / Permanent Resident",
  "Green Card EAD",
  "H1B",
  "H4 EAD",
  "STEM OPT Extension",
  "OPT",
  "CPT",
  "B2",
  "TN",
] as const;

// Salesforce: Training_Schedule__c (restricted) - the "–" is an EN DASH (U+2013).
export const TRAINING_SCHEDULE_OPTIONS = [
  "9:30 AM – 11:30 AM EST",
  "11:30 AM – 1:30 PM EST",
  "2:30 PM – 4:30 PM EST",
  "4:30 PM – 6:30 PM EST",
] as const;

// Salesforce org only has US enabled (CountryCode restricted to [US]).
export const COUNTRY_OPTIONS = ["United States"] as const;

// Salesforce: State__c (restricted picklist) - full state names, exact spelling.
export const US_STATE_OPTIONS = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "Washington D.C.", "West Virginia", "Wisconsin", "Wyoming",
] as const;
