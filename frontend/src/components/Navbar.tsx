import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import menuImage from "../assets/icons/hamburger.png";
import { useAuth, useLogout } from "../hooks";
import "./Navbar.css";
import { UserPermission } from "../utils/data";

const navList: NavItem[] = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
    { name: "Library", path: "/library" },
];
const dropdownItemList: NavItem[] = [
    { name: "Settings", path: "/settings" },
    { name: "Admin Panel", path: "/admin", permission: [UserPermission.ADMIN] },
];

function Navbar() {
    const { auth } = useAuth();
    const logout = useLogout();

    const [isDropdown, setIsDropdown] = useState<boolean>(false);

    const handleLogout = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault();
        logout();
    };

    return (
        <div className="page">
            <header>
                <nav id="navbar">
                    <div id="nav-left">
                        {navList
                            .filter(
                                (item) =>
                                    !item.permission ||
                                    item.permission.includes(auth!.permission)
                            )
                            .map((item) => (
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
                        >
                            <div>
                                <p id="nav-user-shown">{auth?.shownName}</p>
                                <p id="nav-username">@{auth?.username}</p>
                            </div>
                            <div
                                id="nav-menu-icon"
                                className={isDropdown ? "selected" : ""}
                            >
                                <img src={menuImage} alt="menu" />
                            </div>
                        </button>
                    </div>
                </nav>
                {isDropdown && (
                    <div id="nav-dropdown">
                        {dropdownItemList
                            .filter(
                                (item) =>
                                    !item.permission ||
                                    item.permission.includes(auth!.permission)
                            )
                            .map((item) => (
                                <NavLink
                                    className="nav-dropdown-item"
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsDropdown(false)}
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
                )}
                {isDropdown && (
                    <div
                        id="nav-dropdown-overlay"
                        onClick={() => setIsDropdown(false)}
                    ></div>
                )}
            </header>
            <main className="nav-outlet">
                <Outlet />
            </main>
        </div>
    );
}

export default Navbar;
