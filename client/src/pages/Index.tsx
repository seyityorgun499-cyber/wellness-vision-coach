/**
 * Legacy Index page — replaced by AppLayout with React Router nested routes.
 * Kept as a redirect for any stale references.
 */
import { Navigate } from "react-router-dom";

const Index = () => <Navigate to="/" replace />;

export default Index;
