import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import jwtDecode from "jwt-decode";
import useAuth from "./useAuth";

const url = `${process.env.REACT_APP_API_URL}/auth/authenticate`;

function useAuthenticate() {
    const { setAuth } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string>("");

    const storeUser = async (token: string): Promise<boolean> => {
        const jwtData: JwtData = jwtDecode(token);
        let result: boolean = false;
        await axios
            .get(`${process.env.REACT_APP_API_URL}/users/get/${jwtData.sub}`)
            .then((response: AxiosResponse<User, any>) => {
                setAuth(response.data);
                result = true;
            })
            .catch((_) => {
                result = false;
            });
        return result;
    };

    const handleError = (error: any) => {
        const apiError: ApiError | undefined = error.response?.data;
        const message: string =
            apiError?.statusCode && apiError.statusCode < 500
                ? "Invalid username or password!"
                : "Oops! Something went wrong on the server. Please try again later.";
        setErrorMessage(message);
    };

    const authenticate = async (
        username: string,
        password: string
    ): Promise<boolean> => {
        setErrorMessage("");
        username = username.trim();
        password = password.trim();
        if (!username || !password) {
            setErrorMessage("Both username and password are required!");
            return false;
        }
        let isAuthenticated: boolean = false;
        let token: string = "";
        await axios
            .post(url, {
                username: username,
                password: password,
            })
            .then((response: AxiosResponse<{ token: string }, any>) => {
                token = response.data.token;
                isAuthenticated = true;
            })
            .catch(handleError);
        if (isAuthenticated) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            sessionStorage.setItem("token", token); // TODO: better token storage
            await storeUser(token);
        }
        return isAuthenticated;
    };

    return { authenticate, storeUser, errorMessage };
}

export default useAuthenticate;
