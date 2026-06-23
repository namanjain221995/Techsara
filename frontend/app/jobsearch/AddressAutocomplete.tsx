"use client";

import { useEffect, useRef, useState } from "react";
import { COUNTRY_OPTIONS, US_STATE_OPTIONS } from "@/lib/application";

type Suggestion = { placeId: string; label: string };

/**
 * Address block for the apply form, powered by AWS Location Service (proxied
 * through /api/places/*). Typing in "Address" shows live suggestions; picking
 * one auto-fills Street / City / State / Zip / Country. All fields stay editable
 * so a user can still correct or type an address manually. Field `name`s match
 * what the form submits, so the parent's FormData handling is unchanged.
 */
export default function AddressAutocomplete() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);

  // Auto-filled (but editable) structured fields.
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");

  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // When we programmatically set the search box (after a pick), skip the next fetch.
  const skipNextRef = useRef(false);

  // Fetch suggestions (debounced) whenever the search text changes.
  useEffect(() => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = search.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q }),
          signal: ctrl.signal,
        });
        const json = (await res.json()) as { suggestions?: Suggestion[] };
        setSuggestions(json.suggestions || []);
        setOpen(true);
        setActive(-1);
      } catch {
        /* aborted or network error - ignore */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function selectSuggestion(s: Suggestion) {
    setOpen(false);
    setSuggestions([]);
    skipNextRef.current = true;
    setSearch(s.label);
    try {
      const res = await fetch(`/api/places/place?id=${encodeURIComponent(s.placeId)}`);
      if (!res.ok) return;
      const a = (await res.json()) as {
        label?: string;
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
      };
      if (a.street) setStreet(a.street);
      if (a.city) setCity(a.city);
      // Only set the state <select> if AWS's value is one we offer.
      if (a.state && (US_STATE_OPTIONS as readonly string[]).includes(a.state)) {
        setStateVal(a.state);
      }
      if (a.zip) setZip(a.zip);
      if (a.country && (COUNTRY_OPTIONS as readonly string[]).includes(a.country)) {
        setCountry(a.country);
      }
    } catch {
      /* lookup failed - user can fill manually */
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (active >= 0 && active < suggestions.length) {
        e.preventDefault();
        selectSuggestion(suggestions[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <fieldset className="apply-fieldset">
      <legend>Address</legend>
      <div className="apply-grid">
        {/* Search box + suggestions (not wrapped in <label> so the dropdown is a sibling) */}
        <div className="apply-field full apply-autocomplete" ref={wrapRef}>
          <span className="apply-label">
            Address<span className="apply-req"> *</span>
          </span>
          <div className="apply-autocomplete-input">
            <input
              name="addressSearch"
              type="text"
              placeholder="Start typing your address…"
              autoComplete="off"
              required
              value={search}
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
              aria-controls="apply-suggest-list"
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => suggestions.length && setOpen(true)}
              onKeyDown={onKeyDown}
            />
            {loading ? <span className="apply-autocomplete-spinner" aria-hidden="true" /> : null}
          </div>
          {open && suggestions.length > 0 ? (
            <ul className="apply-suggest" id="apply-suggest-list" role="listbox">
              {suggestions.map((s, i) => (
                <li
                  key={s.placeId}
                  role="option"
                  aria-selected={i === active}
                  className={i === active ? "is-active" : undefined}
                  // onMouseDown (not onClick) so it fires before the input blurs.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s);
                  }}
                  onMouseEnter={() => setActive(i)}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <label className="apply-field">
          <span className="apply-label">Country<span className="apply-req"> *</span></span>
          <select name="country" value={country} required onChange={(e) => setCountry(e.target.value)}>
            {COUNTRY_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>

        <label className="apply-field">
          <span className="apply-label">Street<span className="apply-req"> *</span></span>
          <input
            name="street"
            type="text"
            autoComplete="address-line1"
            required
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </label>

        <label className="apply-field">
          <span className="apply-label">City<span className="apply-req"> *</span></span>
          <input
            name="city"
            type="text"
            autoComplete="address-level2"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>

        <label className="apply-field">
          <span className="apply-label">State<span className="apply-req"> *</span></span>
          <select name="state" value={stateVal} required onChange={(e) => setStateVal(e.target.value)}>
            <option value="">Select…</option>
            {US_STATE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>

        <label className="apply-field">
          <span className="apply-label">Zip / Postal Code<span className="apply-req"> *</span></span>
          <input
            name="zip"
            type="text"
            autoComplete="postal-code"
            required
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
        </label>
      </div>
    </fieldset>
  );
}
