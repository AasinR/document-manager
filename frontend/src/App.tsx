import React from "react";
import { Route, Routes } from "react-router-dom";
import {
    AuthenticationFilter,
    Navbar,
    PermissionFilter,
    SettingsSidebar,
} from "./components";
import {
    ErrorPage,
    HomePage,
    LoginPage,
    AccountPage,
    SearchPage,
    DocumentPage,
    MetadataPage,
    DocumentViewPage,
} from "./pages";
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
                            <Route path="search" element={<SearchPage />} />
                            <Route path="document">
                                <Route path=":id">
                                    <Route path="" element={<DocumentPage />} />
                                    <Route
                                        path="metadata"
                                        element={<MetadataPage />}
                                    />
                                    <Route
                                        path="view"
                                        element={<DocumentViewPage />}
                                    />
                                </Route>
                                <Route path="" element={<ErrorPage />} />
                            </Route>
                            <Route
                                path="settings"
                                element={<SettingsSidebar />}
                            >
                                <Route
                                    path="account"
                                    element={<AccountPage />}
                                />
                            </Route>
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
