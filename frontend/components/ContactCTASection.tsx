import ContactForm from "@/components/ContactForm";

const EMAIL_TEAM_HREF =
  "https://mail.google.com/mail/?view=cm&fs=1&to=hello@techsarasolutions.com&cc=sales@techsarasolutions.com&su=Project%20inquiry%20%E2%80%94%20Techsara&body=Hi%20Techsara%20team%2C%0A%0AI%27d%20like%20to%20learn%20more%20about%20your%20services.%20A%20bit%20about%20my%20project%3A%0A%0A-%20Company%3A%0A-%20Role%3A%0A-%20What%20we%27re%20trying%20to%20solve%3A%0A-%20Timeline%20%2F%20budget%3A%0A%0ABest%2C";

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ContactCTASection() {
  return (
    <section id="contact" className="cta-banner-wrap cta-banner-wrap--wide">
      <div className="container">
        <div className="cta-banner cta-banner--form reveal">
          <div className="cta-banner-intro">
            <div>
              <h2>Ready to transform your business with AI?</h2>
              <p>
                Tell us about your goals. We&apos;ll come back within one business day with a
                tailored proposal and a no-obligation 30-minute call with a senior engineer.
              </p>
            </div>

            <div className="cta-banner-actions">
              <a href="/book" className="btn btn-primary btn-lg" data-magnetic="0.3">
                Book a free consultation
                <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href={EMAIL_TEAM_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-lg"
                data-magnetic="0.2"
              >
                Email the team
              </a>
              <div className="cta-meta">
                <div className="row">
                  <CheckIcon /> 30-min, no obligation
                </div>
                <div className="row">
                  <CheckIcon /> NDA on request
                </div>
                <div className="row">
                  <CheckIcon /> Senior engineer on every call
                </div>
              </div>
            </div>
          </div>

          <div className="cta-form-card">
            <header className="cta-form-card-head">
              <h3>Let&apos;s start a conversation</h3>
              <p>Tell us a bit about your initiative - a Techsara lead replies within one business day.</p>
            </header>
            <ContactForm variant="inline" />
          </div>
        </div>
      </div>
    </section>
  );
}
