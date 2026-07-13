// ============================================
// TECHSARA - Blog content
// Long-form, US-focused B2B editorial. Each post targets a keyword cluster for one of
// Techsara's service areas and links internally to the relevant /solutions and /services
// pages. Paragraph/list text supports inline **bold** and [label](/path) links, expanded
// by components/BlogContent.tsx. Types and helpers live in lib/blog.ts.
// ============================================

import type { Author, BlogPost } from "@/lib/blog";

const PRIYA: Author = { name: "Priya Nair", title: "VP, Talent Solutions", initials: "PN" };
const SOFIA: Author = { name: "Sofia Reyes", title: "Lead Generative AI Engineer", initials: "SR" };
const MARCUS: Author = { name: "Marcus Chen", title: "Principal Cloud Architect", initials: "MC" };
const DANIEL: Author = { name: "Daniel Park", title: "Industry Solutions Partner", initials: "DP" };

export const POSTS: BlogPost[] = [];
