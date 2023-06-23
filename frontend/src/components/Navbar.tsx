import { NavLink, Outlet } from "react-router-dom";
import "./Navbar.css";

interface NavItem {
    name: string;
    path: string;
}

function Navbar() {
    const navItems: NavItem[] = [{ name: "Home", path: "/" }];

    return (
        <div className="page">
            <header>
                <nav className="navbar">
                    {navItems.map((value, index) => (
                        <NavLink key={index} to={value.path}>
                            {value.name}
                        </NavLink>
                    ))}
                </nav>
            </header>
            <main className="nav-outlet">
                <Outlet />
            </main>
        </div>
    );
}

export default Navbar;
