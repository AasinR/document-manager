import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Sidebar.css";

function Sidebar({
    path,
    defaultPath,
    navItemList,
}: {
    path: string;
    defaultPath: string;
    navItemList: NavItem[];
}) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === `/${path}`) {
            navigate(`${location.pathname}/${defaultPath}`);
        }
    }, [defaultPath, location.pathname, navigate, path]);

    return (
        <div id="sidebar-page" className="page">
            <div id="sidebar-layout">
                <div id="sidebar">
                    {navItemList.map((item) => (
                        <NavLink
                            className="sidebar-item"
                            key={item.name}
                            to={item.path}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>
                <div id="sidebar-outlet">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

Sidebar.defaultProps = {
    defaultPath: "",
};

export default Sidebar;
