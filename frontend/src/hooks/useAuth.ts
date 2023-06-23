import axios from "axios";
import { useState } from "react";

function useAuth() {
    const [errorMessage, setErrorMessage] = useState<string>("");

    const url = `${process.env.REACT_APP_API_URL}/auth/authenticate`;

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
        await axios
            .post(url, {
                username: username,
                password: password,
            })
            .then((value) => {
                const token = value.data.token;
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${token}`;
                sessionStorage.setItem("token", token); // TODO: better token storage
                isAuthenticated = true;
            })
            .catch((error) => {
                const apiError: ApiError | undefined = error.response?.data;
                const message: string =
                    apiError?.statusCode && apiError.statusCode < 500
                        ? "Invalid username or password!"
                        : "Oops! Something went wrong on the server. Please try again later.";
                setErrorMessage(message);
            });
        return isAuthenticated;
    };

    return { authenticate, errorMessage };
}

export default useAuth;
