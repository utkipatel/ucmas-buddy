import { NavLink } from "react-router";
import Drawer from "./Drawer";
import { MODES } from "./modes";

interface NavMenuProps {
  onClose: () => void;
}

/** Side menu listing the modes. The current one is highlighted. */
export default function NavMenu({ onClose }: NavMenuProps) {
  return (
    <Drawer
      title="UCMAS Buddy"
      closeLabel="Close menu"
      side="left"
      onClose={onClose}
    >
      {(close) => (
        <nav className="nav-menu" aria-label="Modes">
          {MODES.map((mode) => (
            <NavLink key={mode.path} to={mode.path} onClick={close}>
              {mode.name}
            </NavLink>
          ))}
        </nav>
      )}
    </Drawer>
  );
}
