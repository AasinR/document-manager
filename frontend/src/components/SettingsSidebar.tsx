import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./SettingsSidebar.css";

const baseLink = "/settings";

function SettingsSidebar() {
    const navigate = useNavigate();

    const navItemList: NavItem[] = [
        { name: "Account", path: `${baseLink}/account` },
    ];

    useEffect(() => {
        const location = window.location.pathname.split("/")[1];
        if (location === "settings") {
            navigate("/settings/account");
        }
    }, []);

    return (
        <div id="setting-sidebar-layout" className="page">
            <div id="settings-sidebar">
                {navItemList.map((item) => (
                    <NavLink
                        className="setting-sidebar-item"
                        key={item.name}
                        to={item.path}
                    >
                        {item.name}
                    </NavLink>
                ))}
            </div>
            <div id="settings-outlet">
                <Outlet />
            </div>
        </div>
    );
}

export default SettingsSidebar;
