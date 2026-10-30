import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Remove anything a component test rendered, so tests don't affect each other.
afterEach(cleanup);
