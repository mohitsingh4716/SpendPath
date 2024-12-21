import{ Inter} from "next/font/google"
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({subset: ["latin"]});

export const metadata = {
  title: "SpendPath",
  description: "Effortless spending management",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${inter.className}`}
      >
        {/* {header} */}
        <Header/>

        <main className="min-h-screen">
        {children}
        </main>
      
        {/* Footer */}
        <footer className="bg-blue-50 py-12">
           <div className="container mx-auto px-4 text-center text-gray-600 flex justify-evenly">
            <p>© 2024 Welth. All rights reserved.</p>
            <p>Made with 💖  By Mohit</p>
           </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
