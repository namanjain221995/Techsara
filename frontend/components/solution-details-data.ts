export type SolutionDetail = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  heroImage: string;
  defaultTopic: string;
  /** Full <title> (absolute - no "| Techsara" template applied on top). */
  metaTitle: string;
  /** Complete-sentence meta description, kept under 155 characters. */
  metaDescription: string;
};

export const solutionDetails: Record<string, SolutionDetail> = {
  talent: {
    slug: "talent",
    title: "Talent Solutions",
    tagline: "Specialist engineers, embedded on your team",
    description:
      "Save time finding the right resource for your team while we connect you with the best talent in the marketplace. From ML engineers to data scientists and MLOps specialists, we source, vet and onboard the people you need to move your AI roadmap forward.",
    heroImage: "/uploads/techsara-office-meeting.png",
    defaultTopic: "ai-talent",
    metaTitle: "IT Talent Staffing Solutions | Techsara - Frisco, TX",
    metaDescription:
      "Hire vetted IT and AI engineers fast. Techsara talent staffing connects US enterprises with contract, contract-to-hire and direct-hire experts.",
  },
  team: {
    slug: "team",
    title: "Team Solutions",
    tagline: "A full pod running alongside yours",
    description:
      "Take charge of your most valued initiatives while we provide a dedicated team offering technical expertise and services. A complete AI pod - data engineers, ML scientists and platform specialists - running alongside your team with shared rituals, shared backlog and shared outcomes.",
    heroImage: "/uploads/hero_teamsolutions.webp",
    defaultTopic: "dedicated-team",
    metaTitle: "Dedicated Tech Team Solutions | Techsara USA",
    metaDescription:
      "Stand up a dedicated tech team that runs alongside yours. Techsara builds and manages skilled IT and AI pods for US enterprises, flexibly and accountably.",
  },
  project: {
    slug: "project",
    title: "Project Solutions",
    tagline: "Outcome-based delivery, fixed scope and timeline",
    description:
      "Transform your business while we help you connect strategy to execution to tackle your most challenging initiatives. Outcome-based engagements against a fixed scope, timeline and measurable business KPI - accountability and predictability built in from day one.",
    heroImage: "/uploads/hero_projectsolution.webp",
    defaultTopic: "ai-project",
    metaTitle: "Managed IT Project Solutions | Techsara - USA",
    metaDescription:
      "Outcome-based IT project delivery on a fixed scope, timeline and budget. Techsara manages your most critical initiatives end to end for US enterprises.",
  },
  international: {
    slug: "international",
    title: "International Talent Solutions",
    tagline: "Onshore and offshore teams, compliance handled",
    description:
      "Connect with the specialized onshore talent you need while we provide risk mitigation, immigration strategy and visa sponsorship. Distributed delivery across San Francisco, Dubai and Bangalore - you focus on the outcome, we handle the geography and the paperwork.",
    heroImage: "/uploads/international_Talent_Solutions.webp",
    defaultTopic: "international-talent",
    metaTitle: "International Talent Sourcing Solutions | Techsara",
    metaDescription:
      "Source onshore and offshore tech talent with visa sponsorship and compliance handled - Techsara staffs US enterprises with specialized global experts.",
  },
};

export const solutionSlugs = Object.keys(solutionDetails);
