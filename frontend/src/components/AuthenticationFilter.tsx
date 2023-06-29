import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode";
import { LoadingPage } from "../pages";
import { useAuth, useAuthenticate } from "../hooks";

function AuthenticationFilter() {
    const { auth } = useAuth();
    const { storeUser } = useAuthenticate();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState<boolean>(true);

    const isValidToken = (token: string | null): boolean => {
        if (token === null) {
            return false;
        }
        const jwtData: JwtData = jwtDecode(token);
        return new Date() < new Date(jwtData.exp * 1000);
    };

    useEffect(() => {
        const token: string | null = sessionStorage.getItem("token");
        if (!isValidToken(token)) {
            sessionStorage.removeItem("token");
            navigate("/login", { state: { from: location }, replace: true });
            return;
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        (async () => {
            if (auth == null && !(await storeUser(token!))) {
                sessionStorage.removeItem("token");
                navigate("/login", {
                    state: { from: location },
                    replace: true,
                });
                return;
            }
            setLoading(false);
        })();
    }, [auth, location, navigate, storeUser]);

    return <>{loading ? <LoadingPage /> : <Outlet />}</>;
}

export default AuthenticationFilter;
