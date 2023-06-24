import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import menuImage from "../assets/icons/hamburger.png";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [isDropdown, setIsDropdown] = useState<boolean>(false);

    const navList: NavItem[] = [{ name: "Home", path: "/" }];
    const dropdownItemList: NavItem[] = [{ name: "Test", path: "/test" }];

    useEffect(() => {
        const userString: string | null = sessionStorage.getItem("user");
        setUser(JSON.parse(userString!));
    }, []);

    const handleDropdown = (event: React.FocusEvent<HTMLButtonElement>) => {
        if (!event.relatedTarget?.classList.contains("nav-dropdown-item")) {
            setIsDropdown(false);
        }
    };

    const handleLogout = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="page">
            <header>
                <nav id="navbar">
                    <div id="nav-left">
                        {navList.map((item) => (
                            <NavLink
                                className="nav-item"
                                key={item.name}
                                to={item.path}
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                    <div id="nav-right">
                        <button
                            id="nav-user"
                            onClick={() => setIsDropdown(!isDropdown)}
                            onBlur={handleDropdown}
                        >
                            <div>
                                <p id="nav-user-shown">{user?.shownName}</p>
                                <p id="nav-username">@{user?.username}</p>
                            </div>
                            <div id="nav-menu-icon">
                                <img src={menuImage} alt="menu" />
                            </div>
                        </button>
                    </div>
                </nav>
                {isDropdown ? (
                    <div id="nav-dropdown">
                        {dropdownItemList.map((item) => (
                            <NavLink
                                className="nav-dropdown-item"
                                key={item.name}
                                to={item.path}
                            >
                                {item.name}
                            </NavLink>
                        ))}
                        <button
                            className="nav-dropdown-item"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                ) : null}
            </header>
            <main className="nav-outlet">
                <Outlet />
            </main>
        </div>
    );
}

export default Navbar;
