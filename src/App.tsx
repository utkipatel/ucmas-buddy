import { HashRouter, Navigate, Route, Routes } from "react-router";
import Layout from "./layout/Layout";
import PlayPage from "./modes/play/PlayPage";
import TestPage from "./modes/test/TestPage";

/**
 * The pages and their addresses. Addresses go after a `#` (for example
 * `#/test`), because GitHub Pages can't serve other paths.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="play" element={<PlayPage />} />
          <Route path="test" element={<TestPage />} />
          <Route path="*" element={<Navigate to="/play" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
