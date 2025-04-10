/** @format */

import Navbar from "@/components/app/shared/Navbar";
import "../globals.css";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function AappLayout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
