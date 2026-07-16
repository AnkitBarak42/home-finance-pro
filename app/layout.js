import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata = {
  title: "Home Finance Pro",
  description: "Realtime family finance tracker",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-ink min-h-screen flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen relative flex flex-col">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
