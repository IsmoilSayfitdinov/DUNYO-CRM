import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProviders } from "./providers";
import { OfflineStatus } from "@/shared/ui/OfflineStatus";
import "@/app/styles/fonts.css";

export default function App() {
  return (
    <AppProviders>
      <OfflineStatus />
      <RouterProvider router={router} />
    </AppProviders>
  );
}
