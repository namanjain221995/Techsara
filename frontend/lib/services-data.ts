import { readFileSync } from "fs";
import { join } from "path";

/**
 * Server-side access to the service catalogue.
 *
 * content/service-data.js is a plain `window.SERVICES = { … }` assignment written
 * for the browser. Rather than maintain a second hand-typed copy that can drift,
 * this evaluates that one file and hands back the object, typed.
 *
 * Reading it here is what lets /services/[slug] render on the server. The page
 * used to ship an empty <div id="service-root"> and fill it from the browser,
 * which is why a slow or missing script could leave it blank or claim the
 * service did not exist.
 */

export type Capability = { title: string; desc: string };
export type Metric = { num: string; lbl: string };

export type Service = {
  category: string;
  name: string;
  headline: string;
  intro: string;
  /** Raw inner SVG markup (paths only) for the aside icon. */
  icon: string;
  capabilities: Capability[];
  stack: string[];
  deliverables: string[];
  metrics: Metric[];
  related: string[];
};

let cache: Record<string, Service> | null = null;

export function getServices(): Record<string, Service> {
  if (cache) return cache;

  const source = readFileSync(
    join(process.cwd(), "content", "service-data.js"),
    "utf8",
  ).replace(/^﻿/, "");

  // The file only assigns to `window`, so give it one and take the result.
  const host: { SERVICES?: Record<string, Service> } = {};
  new Function("window", source)(host);

  if (!host.SERVICES || typeof host.SERVICES !== "object") {
    throw new Error("service-data.js did not define window.SERVICES");
  }

  cache = host.SERVICES;
  return cache;
}

export function getService(slug: string): Service | null {
  return getServices()[slug] ?? null;
}

export function getServiceSlugList(): string[] {
  return Object.keys(getServices());
}
