import type { Metadata } from "next";
import { lusitana } from "./ui/fonts";
import "./globals.css";
import Navbar from "./ui/general/Navbar";
import { Providers } from "./providers"; 

export const metadata: Metadata = {
  title: "Ecovida",
  description: "Creado por el equipo de Ecovida",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lusitana.className} antialiased`}>
        <Providers>
          <Navbar />
          
          {children}
        </Providers>
      </body>
    </html>
  );
}

