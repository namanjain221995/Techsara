import LegacyScripts from "@/components/LegacyScripts";
import SpectrumOfSolutions from "@/components/SpectrumOfSolutions";
import { getLegacyBody } from "@/lib/legacy-html";

const SPECTRUM_PLACEHOLDER = "<!-- TECHSARA_SPECTRUM_PLACEHOLDER -->";

export default function HomePage() {
  const body = getLegacyBody("index.html");
  const [beforeSpectrum, afterSpectrum = ""] = body.split(SPECTRUM_PLACEHOLDER);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: beforeSpectrum }} />
      <SpectrumOfSolutions />
      <div dangerouslySetInnerHTML={{ __html: afterSpectrum }} />
      <LegacyScripts page="home" />
    </>
  );
}
