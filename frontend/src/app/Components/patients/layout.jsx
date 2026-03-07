import UserNavbar from "@/components/UserNavbar";
import Navbar from "../common/Navbar/Navbar";

export default function UserLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
