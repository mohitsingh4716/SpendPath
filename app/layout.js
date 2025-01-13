import{ Inter} from "next/font/google"
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/themeProvider";
import Header from "@/components/header";

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
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        {/* {header} */}
         <Header/>

        <main className="min-h-screen">
        {children}
        </main>
        <Toaster richColors />
      
        {/* Footer */}
        <footer className=" py-12 border-t-2">
           <div className="container mx-auto px-4 text-center text-gray-600 flex justify-evenly ">
            <p>© 2024 SpendPath. All rights reserved.</p>
            <p>Made with 💖  By Mohit</p>
           </div>
        </footer>

        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
