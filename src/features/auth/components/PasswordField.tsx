import { TextField, IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useCallback, useState } from "react";
import { Controller, type Control } from "react-hook-form";

type Props = {
  name: string;               
  label: string;
  control: Control<any>;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
};

export const PasswordField = ({ name, label, control, error, autoComplete, disabled }: Props) => {
  const [show, setShow] = useState(false);
  const toggle = useCallback(() => setShow(prevShow => !prevShow), []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          type={show ? "text" : "password"}
          label={label}
          error={!!error}
          helperText={error}
          autoComplete={autoComplete}
          disabled={disabled}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={toggle}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                    size="small"
                  >
                    {show ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}
