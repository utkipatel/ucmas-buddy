import { type ReactNode, useEffect, useId, useState } from "react";

interface DrawerProps {
  title: string;
  /** Accessible name of the × button, for example "Close settings". */
  closeLabel: string;
  /** The screen edge the drawer slides in from. */
  side: "left" | "right";
  /** Called once the closing animation has finished. */
  onClose: () => void;
  /** The drawer's content; `close` plays the closing animation. */
  children: (close: () => void) => ReactNode;
}

/** How long the closing animation runs; matches `.closing` in style.css. */
export const CLOSE_MS = 250;

/**
 * A panel that slides in over the screen. It closes with ×, Escape, or a
 * tap outside, playing a slide-out animation first.
 */
export default function Drawer({
  title,
  closeLabel,
  side,
  onClose,
  children,
}: DrawerProps) {
  const titleId = useId();
  const [closing, setClosing] = useState(false);
  const close = () => setClosing(true);

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(onClose, CLOSE_MS);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div
      className={closing ? "drawer-backdrop closing" : "drawer-backdrop"}
      data-testid="drawer-backdrop"
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <aside
        className={`drawer drawer-${side}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="drawer-header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label={closeLabel}
            onClick={close}
            autoFocus
          >
            ×
          </button>
        </div>
        {children(close)}
      </aside>
    </div>
  );
}
