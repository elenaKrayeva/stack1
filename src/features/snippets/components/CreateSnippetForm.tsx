import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCreateSnippet } from "@/features/snippets/queries";
import type { CreateSnippetDto } from "@/features/snippets/types";
import { useSnippetLanguages } from "@/features/snippets/queries";

export const schema = z.object({
  language: z.string().trim().min(1, { message: "Select a language" }),
  code: z.string().trim().min(5, { message: "Code is too short" }),
});

type CreateSnippetFormValues = z.infer<typeof schema>;

export const CreateSnippetForm = () => {
  const navigate = useNavigate();

  const { data: languagesData, isLoading: isLanguagesLoading } =
    useSnippetLanguages();
  const languages: string[] = languagesData ?? [];

  const {
    control,
    register,
    handleSubmit,
    formState: {
      errors,
      isValid: isFormValid,
      isDirty: isFormDirty,
      isSubmitting: isFormSubmitting,
    },
    setValue,
    getValues,
  } = useForm<CreateSnippetFormValues>({
    defaultValues: { language: "JavaScript", code: "" },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!languages.length) return;
    const currentLanguage = getValues("language");
    if (!currentLanguage || !languages.includes(currentLanguage)) {
      setValue("language", languages[0], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [languages, getValues, setValue]);

  const [snackbarState, setSnackbarState] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const createSnippetMutation = useCreateSnippet();

  const onSubmit = (values: CreateSnippetFormValues) => {
    const createSnippetDto: CreateSnippetDto = {
      language: values.language,
      code: values.code,
    };

    createSnippetMutation.mutate(createSnippetDto, {
      onSuccess: (createdSnippet) => {
        setSnackbarState({ type: "success", message: "Snippet created!" });

        const createdIdValue = (createdSnippet as any)?.id;
        const createdIdString =
          typeof createdIdValue === "number"
            ? String(createdIdValue)
            : String(createdIdValue ?? "");

        if (createdIdString) {
          navigate(`/snippets/${createdIdString}`);
        } else {
          navigate(`/snippets/my`);
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ??
          error?.message ??
          "Error while creating snippet";
        setSnackbarState({ type: "error", message: errorMessage });
      },
    });
  };

  return (
    <Paper elevation={2} className="max-w-3xl mx-auto my-6 p-4 sm:p-6 md:p-8">
      <Typography variant="h5" className="font-semibold mb-2">
        Create Snippet
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
          placeholder="// Enter your code here"
          multiline
          minRows={10}
          fullWidth
          {...register("code")}
          error={!!errors.code}
          helperText={errors.code?.message}
          slotProps={{input:{
            spellCheck: "false",
            className: "font-mono",
          }
           
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
              isFormSubmitting ||
              createSnippetMutation.isPending ||
              !isFormValid ||
              !isFormDirty ||
              isLanguagesLoading
            }
          >
            Create
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={!!snackbarState}
        autoHideDuration={3000}
        onClose={() => setSnackbarState(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbarState ? (
          <Alert
            onClose={() => setSnackbarState(null)}
            severity={snackbarState.type}
            variant="filled"
            className="w-full"
          >
            {snackbarState.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Paper>
  );
};
