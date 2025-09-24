import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

import { schema as createSchema } from "@/features/snippets/components/CreateSnippetForm";
import {
  useSnippet,
  useSnippetLanguages,
  useUpdateSnippet,
} from "@/features/snippets/queries";
import type { UpdateSnippetDto } from "@/features/snippets/types";

type FormValues = {
  language: string;
  code: string;
};

export const EditPage = () => {
  const params = useParams();
  const id = useMemo(() => Number(params.id), [params.id]);
  const navigate = useNavigate();

  const { data: snippet, status, error } = useSnippet(id);
  const { data: languagesData, isLoading: isLanguagesLoading } =
    useSnippetLanguages();
  const languages: string[] = languagesData ?? [];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting, isValid },
    reset,
    setValue,
  } = useForm<FormValues>({
    defaultValues: { language: "", code: "" },
    resolver: zodResolver(createSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (snippet) {
      reset({ language: snippet.language, code: snippet.code });
    }
  }, [snippet, reset]);

  useEffect(() => {
    if (!languages.length || !snippet) return;
    if (!languages.includes(snippet.language)) {
      setValue("language", languages[0], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [languages, snippet, setValue]);

  const updateMutation = useUpdateSnippet();
  const [snackbar, setSnackbar] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const onSubmit = (values: FormValues) => {
    const dto: UpdateSnippetDto = {
      language: values.language,
      code: values.code,
    };

    updateMutation.mutate(
      { id, dto },
      {
        onSuccess: () => {
          setSnackbar({ type: "success", message: "Snippet updated!" });
          navigate(`/snippets/${id}`);
        },
        onError: (event: any) => {
          const msg =
            event?.response?.data?.message ??
            event?.message ??
            "Error while updating snippet";
          setSnackbar({ type: "error", message: msg });
        },
      }
    );
  };

  if (status === "pending") {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "error" || !snippet) {
    return (
      <Typography color="error">
        {(error as Error)?.message ?? "Failed to load snippet"}
      </Typography>
    );
  }

  return (
    <Paper elevation={2} className="max-w-3xl mx-auto my-6 p-4 sm:p-6 md:p-8">
      <Typography variant="h5" className="font-semibold mb-2">
        Edit Snippet #{snippet.id}
      </Typography>

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <Controller
          name="language"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Language"
              fullWidth
              {...field}
              disabled={isLanguagesLoading}
              error={!!errors.language}
              helperText={errors.language?.message}
            >
              {languages.map((language) => (
                <MenuItem key={language} value={language}>
                  {language}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          label="Code"
          placeholder="// Edit your code"
          multiline
          minRows={10}
          fullWidth
          {...register("code")}
          error={!!errors.code}
          helperText={errors.code?.message}
          slotProps={{
            input: { spellCheck: "false", className: "font-mono" },
          }}
        />

        <Box className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outlined" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              isSubmitting ||
              updateMutation.isPending ||
              !isValid ||
              !isDirty ||
              isLanguagesLoading
            }
          >
            Save
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={() => setSnackbar(null)}
            severity={snackbar.type}
            variant="filled"
            className="w-full"
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Paper>
  );
};
