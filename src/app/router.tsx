import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/widgets/Layout/AppLayout";
import { HomePage } from "@/pages/HomePage/HomePage";
import { LoginPage } from "@/pages/LoginPage/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage/RegisterPage";
import { GuestOnly, PrivateOnly } from "@/shared/hooks/useAuthGuard";
import { AccountPage } from "@/pages/account/AccountPage";
import { MySnippetsPage } from "@/pages/snippets/MySnippetsPage";
import { NewPage } from "@/pages/snippets/NewPage";
import { QuestionsPage } from "@/pages/questions/QuestionsPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { PostPage } from "@/pages/snippets/PostPage";
import { QuestionPage } from "@/pages/questions/QuestionPage";
import { UserPage } from "@/pages/users/UserPage";
import { CreateQuestionPage } from "@/pages/questions/CreateQuestionPage";
import { EditPage } from "@/pages/snippets/EditPage";
import { EditQuestionPage } from "@/pages/questions/EditQuestionPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },

      {
        path: "login",
        element: (
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        ),
      },
      {
        path: "register",
        element: (
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        ),
      },
      {
        path: "account",
        element: (
          <PrivateOnly>
            <AccountPage />
          </PrivateOnly>
        ),
      },
      {
        path: "snippets/new",
        element: (
          <PrivateOnly>
            <NewPage />
          </PrivateOnly>
        ),
      },
      {
        path: "snippets",
        element: (
          <PrivateOnly>
            <MySnippetsPage />
          </PrivateOnly>
        ),
      },

      { path: "snippets/:id", element: <PostPage /> },
      {
        path: "snippets/:id/edit",
        element: (
          <PrivateOnly>
            <EditPage />
          </PrivateOnly>
        ),
      },

      {
        path: "questions",
        element: (
          <PrivateOnly>
            <QuestionsPage />
          </PrivateOnly>
        ),
      },
      {
        path: "questions/:id",
        element: (
          <PrivateOnly>
            <QuestionPage />
          </PrivateOnly>
        ),
      },
      {
        path: "questions/:id/edit",
        element: (
          <PrivateOnly>
            <EditQuestionPage />
          </PrivateOnly>
        ),
      },
      {
        path: "questions/new",
        element: (
          <PrivateOnly>
            <CreateQuestionPage />
          </PrivateOnly>
        ),
      },

      {
        path: "users",
        element: (
          <PrivateOnly>
            <UsersPage />
          </PrivateOnly>
        ),
      },
      {
        path: "users/:id",
        element: (
          <PrivateOnly>
            <UserPage />
          </PrivateOnly>
        ),
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
