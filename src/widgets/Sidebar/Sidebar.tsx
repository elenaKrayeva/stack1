import * as React from "react";
import { styled, type Theme, type CSSObject } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Tooltip,
  Divider,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PostAddIcon from "@mui/icons-material/PostAdd";
import SnippetFolderIcon from "@mui/icons-material/SnippetFolder";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import GroupIcon from "@mui/icons-material/Group";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/store";

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_MINI = 72;

const openedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: DRAWER_WIDTH_MINI,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
});

interface StyledDrawerProps {
  open: boolean;
}

export const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<StyledDrawerProps>(({ theme, open }) => ({
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

type MenuItem = {
  label: string;
  to: string;
  icon: React.ReactNode;
};

const menu: MenuItem[] = [
  { label: "Home", to: "/", icon: <HomeIcon /> },
  { label: "My Account", to: "/account", icon: <AccountCircleIcon /> },
  { label: "Post snippet", to: "/snippets/new", icon: <PostAddIcon /> },
  { label: "My snippets", to: "/snippets", icon: <SnippetFolderIcon /> },
  { label: "Questions", to: "/questions", icon: <HelpCenterIcon /> },
  { label: "Users", to: "/users", icon: <GroupIcon /> },
];

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = React.useState(true);
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => {
    const { pathname } = location;

    if (path === "/") {
      return pathname === "/";
    }

    if (path === "/snippets") {
      return pathname === "/snippets";
    }

    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <Drawer variant="permanent" open={open}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          gap: 1,
        }}
      >
        {open ? (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                overflow: "hidden",
              }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircleIcon />
              </Avatar>
              <Box
                sx={{
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: 140,
                }}
              >
                {user.username ?? "User"}
              </Box>
            </Box>
            <IconButton aria-label="Collapse" onClick={() => setOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          <IconButton aria-label="Expand" onClick={() => setOpen(true)}>
            <KeyboardArrowRightIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      <List sx={{ px: open ? 1 : 0 }}>
        {menu.map((item) => {
          const selected = isActive(item.to);
          const button = (
            <ListItemButton
              component={NavLink}
              to={item.to}
              selected={selected}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                ...(selected && {
                  bgcolor: "action.selected",
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              {open && <ListItemText primary={item.label} />}
            </ListItemButton>
          );

          return (
            <Box key={item.to}>
              {open ? (
                button
              ) : (
                <Tooltip title={item.label} placement="right">
                  {button}
                </Tooltip>
              )}
            </Box>
          );
        })}
      </List>
    </Drawer>
  );
};
