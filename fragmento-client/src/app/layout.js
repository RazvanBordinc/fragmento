/** @format */

import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata = {
  title: "Fragmento - Share your fragrances",
  description: "Social platform for fragrance enthusiasts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
