import { useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { MODES, type PageContext } from "./modes";
import NavMenu from "./NavMenu";

/**
 * The header (menu button, app and mode name, settings button) around the current
 * page. The page itself shows its settings panel when asked to.
 */
export default function Layout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Remembers which page the settings were opened on, so they don't stay
  // open after moving to another page (for example with the back button).
  const [settingsOpenOn, setSettingsOpenOn] = useState<string | null>(null);
  const [settingsDisabled, setSettingsDisabled] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSettings = useCallback(() => setSettingsOpenOn(null), []);
  const settingsOpen = settingsOpenOn === pathname;
  const title = MODES.find((mode) => mode.path === pathname)?.name;

  const page: PageContext = {
    settingsOpen,
    closeSettings,
    setSettingsDisabled,
  };

  return (
    <>
      <header className="app-header">
        <button
          type="button"
          className="icon-button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        <h1>UCMAS Buddy</h1>
        <span className="mode-name" data-testid="mode-name">
          {title}
        </span>
        <button
          type="button"
          className="icon-button settings-button"
          aria-label="Open settings"
          aria-expanded={settingsOpen}
          disabled={settingsDisabled}
          onClick={() => setSettingsOpenOn(pathname)}
        >
          ⚙
        </button>
      </header>

      <Outlet context={page} />

      {menuOpen && <NavMenu onClose={closeMenu} />}
    </>
  );
}
