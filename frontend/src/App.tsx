import React from "react";
import { Route, Routes } from "react-router-dom";
import {
    AuthenticationFilter,
    Navbar,
    PermissionFilter,
    Sidebar,
} from "./components";
import {
    AccountPage,
    DocumentPage,
    DocumentViewPage,
    ErrorPage,
    GroupPage,
    HomePage,
    LabelPage,
    LibraryPage,
    LoginPage,
    MetadataPage,
    SearchPage,
    UserManagerPage,
} from "./pages";
import { UserPermission } from "./utils/data";
import "./App.css";

const settingsNavList: NavItem[] = [{ name: "Account", path: "account" }];

const adminNavList: NavItem[] = [{ name: "User Manager", path: "users" }];

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
                            <Route path="label" element={<LabelPage />} />
                            <Route path="library" element={<LibraryPage />} />
                            <Route path="group">
                                <Route path=":id" element={<GroupPage />} />
                                <Route path="" element={<ErrorPage />} />
                            </Route>
                            <Route
                                path="settings"
                                element={
                                    <Sidebar
                                        path="settings"
                                        defaultPath="account"
                                        navItemList={settingsNavList}
                                    />
                                }
                            >
                                <Route
                                    path="account"
                                    element={<AccountPage />}
                                />
                            </Route>
                        </Route>

                        {/* permission: admin */}
                        <Route
                            element={
                                <PermissionFilter
                                    allowed={[UserPermission.ADMIN]}
                                />
                            }
                        >
                            <Route
                                path="admin"
                                element={
                                    <Sidebar
                                        path="admin"
                                        defaultPath="users"
                                        navItemList={adminNavList}
                                    />
                                }
                            >
                                <Route
                                    path="users"
                                    element={<UserManagerPage />}
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
