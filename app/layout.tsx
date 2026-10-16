import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";


import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "SHIFT_TECH MOD V1.0 | Precision Engineering Redefined",
  description:
    "Next-generation automotive visualizer, workshop configurator, and telemetry analytics platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
