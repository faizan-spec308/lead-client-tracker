import { render, screen } from "@testing-library/react";
import LeadsPage from "./Leads";

// mock api module so it doesn’t actually call backend
vi.mock("../api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

test("renders Leads page heading", async () => {
  render(<LeadsPage />);
  expect(screen.getByText("Leads")).toBeInTheDocument();
  expect(screen.getByText("All Leads")).toBeInTheDocument();
});
