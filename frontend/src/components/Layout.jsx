import { Outlet } from "react-router";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar className="navbar-frame" />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
