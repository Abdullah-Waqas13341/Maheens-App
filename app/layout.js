import "./globals.css";

export const metadata = {
  title: "do i really care?",
  description: "be honest. one of these buttons refuses to let you lie. 💅",
  openGraph: {
    title: "do i really care?",
    description: "be honest. one of these buttons refuses to let you lie. 💅",
    type: "website",
  },
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
