import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
}

const withAuth = (WrappedComponent ) => {
    const AuthComponent = (props) => {
        const router = useNavigate();

        useEffect(() => {
            if(!isAuthenticated()) {
                router("/auth")
            }
        }, [])

        return <WrappedComponent {...props} />
    }

    return AuthComponent;
}

export default withAuth;