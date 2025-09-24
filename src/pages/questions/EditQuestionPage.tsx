import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button, TextField, Paper, Typography, Box, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useQuestion, useUpdateQuestion } from "@/features/questions/queries";

const schema = z.object({
  title: z.string().min(5, "Minimum 5 characters").max(200, "Maximum 200 characters"),
  description: z.string().max(5000, "Description is too long").optional().or(z.literal("")),
  attachedCode: z.string().max(20000, "Code is too long").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export const EditQuestionPage = () => {
  const params = useParams();
  const id = useMemo(() => Number(params.id), [params.id]);
  const navigate = useNavigate();

  const { data, status, error } = useQuestion(id);
  const updateMutation = useUpdateQuestion();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", attachedCode: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (data) {
      reset({
        title: data.title ?? "",
        description: data.body ?? "",
        attachedCode: data.code ?? "",
      });
    }
  }, [data, reset]);

  const [snackbar, setSnackbar] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (status === "pending") {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (status === "error" || !data) {
    return (
      <Typography color="error" sx={{ py: 4 }}>
        {(error as Error)?.message ?? "Failed to load question"}
      </Typography>
    );
  }

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(
      {
        id,
        dto: {
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
          attachedCode: values.attachedCode?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setSnackbar({ type: "success", message: "Question updated!" });
          navigate(`/questions/${id}`);
        },
        onError: (event: any) => {
          setSnackbar({
            type: "error",
            message: event?.response?.data?.message ?? event?.message ?? "Update failed",
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <Typography variant="h5" className="font-semibold mb-4">Edit question</Typography>

      <Paper className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Question title" error={!!errors.title} helperText={errors.title?.message} fullWidth />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Question description"
                placeholder="Describe the problem and what you've already tried"
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
                multiline
                minRows={4}
              />
            )}
          />

          <Controller
            name="attachedCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Attached code"
                placeholder="Paste a minimal reproducible example"
                error={!!errors.attachedCode}
                helperText={errors.attachedCode?.message}
                fullWidth
                multiline
                minRows={6}
                slotProps={{ input: { className: "font-mono" } }}
              />
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={isSubmitting || updateMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || updateMutation.isPending || !isValid || !isDirty}
            >
              Save
            </Button>
          </div>
        </form>
      </Paper>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)}>
        {snackbar ? (
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.type} variant="filled">
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </div>
  );
};
