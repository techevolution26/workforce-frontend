import "./globals.css";
import { SessionBootstrap } from "@/components/auth/session-bootstrap";

export const metadata = {
  title: "Workforce Marketplace",
  description: "Hire skilled and general workers fast",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionBootstrap />
        {children}
      </body>
    </html>
  );
}