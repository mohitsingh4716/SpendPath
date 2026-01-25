import{ Inter} from "next/font/google"
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/themeProvider";
import Header from "@/components/header";
import Footer from "@/components/footer";

const inter = Inter({subsets: ['latin'],preload: true,});

export const metadata = {
  title: "SpendPath",
  description: "Effortless spending management",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
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
        <Footer/>
        {/* <footer className=" py-8 border-t-2">
           <div className="container mx-auto px-4 text-center text-gray-600 flex justify-evenly ">
            <p>© {new Date().getFullYear()} SpendPath. All rights reserved.</p>
            <p>Made with 💖  By Mohit</p>
           </div>
        </footer> */}

        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
