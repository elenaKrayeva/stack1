import { Stack } from "@mui/material";
import { EditUsernameCard } from "./EditUsernameCard";
import { ChangePasswordCard } from "./ChangePasswordCard";

export const EditProfileSection = ({ initialUsername }: { initialUsername: string }) => {
  return (
    <Stack className="gap-4">
      <EditUsernameCard initialUsername={initialUsername} />
      <ChangePasswordCard />
    </Stack>
  );
};
