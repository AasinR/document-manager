import React from "react";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import { AuthenticationFilter, Navbar } from "./components";
import { ErrorPage, HomePage, LoginPage } from "./pages";
import { UserPermission } from "./utils/data";
import "./App.css";

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/">
                {/* public */}
                <Route path="login" element={<LoginPage />} />

                {/* authenticated routes */}
                <Route element={<Navbar />}>
                    <Route
                        element={
                            <AuthenticationFilter
                                allowed={[
                                    UserPermission.USER,
                                    UserPermission.ADMIN,
                                ]}
                            />
                        }
                    >
                        <Route path="" element={<HomePage />} />
                    </Route>
                </Route>
                <Route path="*" element={<ErrorPage />} />
            </Route>
        )
    );

    return <RouterProvider router={router} />;
}

export default App;
