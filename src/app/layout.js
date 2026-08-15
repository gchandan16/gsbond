import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";

import Clarity from '@microsoft/clarity'

export const metadata = {
  title: "GSBC CRM",
  description: "GSBC CRM",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

Clarity.init(clarityId)

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
