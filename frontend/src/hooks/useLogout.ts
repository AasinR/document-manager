import axios from "axios";
import { useNavigate } from "react-router-dom";

function useLogout() {
    const navigate = useNavigate();

    return () => {
        sessionStorage.removeItem("token");
        axios.defaults.headers.common["Authorization"] = null;
        navigate("/login");
    };
}

export default useLogout;
