import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import jwtDecode from "jwt-decode";
import { LoadingPage, ErrorPage } from "../pages";
import { UserPermission } from "../utils/data";

function AuthenticationFilter({ allowed }: { allowed: UserPermission[] }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    useEffect(() => {
        const redirect = (): void => {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            navigate("/login", { state: { from: location }, replace: true });
        };

        const token: string | null = sessionStorage.getItem("token");
        if (!isValidToken(token)) {
            redirect();
            return;
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        (async () => {
            const { isStored, user } = await storeUserData(token!);
            if (!isStored) {
                redirect();
                return;
            }
            if (user !== null && allowed.includes(user.permission)) {
                setIsAuthorized(true);
            }
            setIsLoading(false);
        })();
    }, [allowed, location, navigate]);

    const isValidToken = (token: string | null): boolean => {
        if (token === null) {
            return false;
        }
        const jwtData: JwtData = jwtDecode(token);
        return new Date() < new Date(jwtData.exp * 1000);
    };

    const storeUserData = async (
        token: string
    ): Promise<{ isStored: boolean; user: User | null }> => {
        const jwtData: JwtData = jwtDecode(token);
        let isStored: boolean = false;
        let user: User | null = null;
        await axios
            .get(`${process.env.REACT_APP_API_URL}/users/get/${jwtData.sub}`)
            .then((response: AxiosResponse<User, any>) => {
                user = response.data;
                sessionStorage.setItem("user", JSON.stringify(user));
                isStored = true;
            })
            .catch((_) => {
                isStored = false;
            });
        return { isStored, user };
    };

    return (
        <>
            {isLoading ? (
                <LoadingPage />
            ) : isAuthorized ? (
                <Outlet />
            ) : (
                <ErrorPage error="Unauthorized Access!" code={401} />
            )}
        </>
    );
}

export default AuthenticationFilter;
