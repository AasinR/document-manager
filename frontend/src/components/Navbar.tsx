import { NavLink, Outlet } from "react-router-dom";
import "./Navbar.css";

interface NavItem {
    name: string;
    path: string;
}

function Navbar() {
    const navItems: NavItem[] = [
        { name: "Home", path: "/" },
        { name: "Page 1", path: "page1" },
        { name: "Page 2", path: "page2" },
    ];

    return (
        <div>
            <header>
                <nav className="navbar">
                    {navItems.map((value, index) => (
                        <NavLink key={index} to={value.path}>
                            {value.name}
                        </NavLink>
                    ))}
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Navbar;
