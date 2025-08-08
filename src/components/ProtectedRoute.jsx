import { Outlet } from "react-router";

export default function ProtectedRoute(){
    return(
        <>
            <main>
                <Outlet />
            </main>
        </>
    )
}