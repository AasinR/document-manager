import { createContext, ReactNode, useState } from "react";

const AuthContext = createContext<UseAuthType>({
    auth: null,
    setAuth: () => {},
});

export function AuthProvider({ children }: { children?: ReactNode }) {
    const [auth, setAuth] = useState<User | null>(null);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
