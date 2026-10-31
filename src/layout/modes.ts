import { useOutletContext } from "react-router";

/** The app's modes, in menu order. */
export const MODES = [
  { path: "/play", name: "Play" },
  { path: "/test", name: "Test" },
] as const;

/** What the layout shares with the page inside it. */
export interface PageContext {
  /** True while the learner has this page's settings open. */
  settingsOpen: boolean;
  closeSettings: () => void;
  /** Disables the settings button, for example during a test. */
  setSettingsDisabled: (disabled: boolean) => void;
}

/** Lets a page use what the layout shares with it. */
export const usePageContext = () => useOutletContext<PageContext>();
