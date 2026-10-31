import { useEffect } from "react";
import { usePageContext } from "../../layout/modes";

/** Placeholder until the timed test is built. */
export default function TestPage() {
  const { setSettingsDisabled } = usePageContext();

  // Test settings don't exist yet, so there is nothing to open.
  useEffect(() => {
    setSettingsDisabled(true);
    return () => setSettingsDisabled(false);
  }, [setSettingsDisabled]);

  return <p className="placeholder">The timed test is coming soon.</p>;
}
