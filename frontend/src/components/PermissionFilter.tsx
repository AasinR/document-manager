import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ErrorPage } from "../pages";
import { useAuth } from "../hooks";
import { UserPermission } from "../utils/data";

function PermissionFilter({ allowed }: { allowed?: UserPermission[] }) {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        <>
            {auth ? (
                allowed!.includes(auth.permission) ? (
                    <Outlet />
                ) : (
                    <ErrorPage code={401} error="Unauthorized Access!" />
                )
            ) : (
                <Navigate to="/login" state={{ from: location }} replace />
            )}
        </>
    );
}

PermissionFilter.defaultProps = {
    allowed: [UserPermission.ADMIN, UserPermission.USER],
};

export default PermissionFilter;
