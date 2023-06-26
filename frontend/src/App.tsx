import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthenticationFilter, Navbar, PermissionFilter } from "./components";
import { ErrorPage, HomePage, LoginPage } from "./pages";
import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/">
                {/* public */}
                <Route path="login" element={<LoginPage />} />

                {/* authenticated routes */}
                <Route element={<AuthenticationFilter />}>
                    <Route element={<Navbar />}>
                        {/* permission: all */}
                        <Route element={<PermissionFilter />}>
                            <Route path="" element={<HomePage />} />
                        </Route>
                    </Route>
                </Route>

                {/* non existent routes */}
                <Route path="*" element={<ErrorPage />} />
            </Route>
        </Routes>
    );
}

export default App;
