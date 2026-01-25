
"use client";

export default function Footer() {
  return (
    <footer className="py-8 border-t-2">
      <div className="container mx-auto px-4 text-center text-gray-600 flex justify-evenly">
        <p>© {new Date().getFullYear()} SpendPath. All rights reserved.</p>
      </div>
    </footer>
  );
}

