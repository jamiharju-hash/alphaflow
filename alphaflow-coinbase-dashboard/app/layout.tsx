import "./globals.css";

export const metadata = {
  title: "AlphaFlow Coinbase Dashboard",
  description: "Portfolio dashboard with Coinbase Advanced Trade API connection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
