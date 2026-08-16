import "./globals.css";

export const metadata = {
  title: "Is Abdullah your coolest cousin?",
  description: "There is only one correct answer. The other button knows it.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#120024",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
