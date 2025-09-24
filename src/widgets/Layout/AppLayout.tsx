import { AppBar, Toolbar, Box, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/store";
import { Logout } from "./Logout";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/widgets/Sidebar/Sidebar";

const linkClass = "text-white no-underline";

export const AppLayout = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const onQuestionsList = location.pathname === "/questions";
  const onCreateQuestion = location.pathname === "/questions/new";

  return (
    <Box className="min-h-screen flex">
      {user && <Sidebar />}
      <Box className="flex flex-col flex-1 min-w-0">
        <AppBar position="sticky">
          <Toolbar className="w-full">
            <Link to="/" className={`${linkClass} text-xl font-semibold`}>
              StackLite
            </Link>

            <div className="ml-auto flex items-center gap-3">
              {user && onQuestionsList && !onCreateQuestion && (
                <Button
                  component={Link}
                  to="/questions/new"
                  color="inherit"
                  variant="outlined"
                >
                  Ask question
                </Button>
              )}

              {user ? (
                <Logout />
              ) : (
                <>
                  <Button component={Link} to="/login" color="inherit" className={linkClass}>
                    Login
                  </Button>
                  <Button component={Link} to="/register" color="inherit" className={linkClass}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </Toolbar>
        </AppBar>

        <Box component="main" className="p-4 flex-1 w-full">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
