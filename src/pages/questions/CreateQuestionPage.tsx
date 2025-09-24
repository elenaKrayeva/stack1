import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCreateQuestion } from "@/features/questions/queries";

const schema = z.object({
  title: z.string().min(5, "Minimum 5 characters").max(200, "Maximum 200 characters"),
  description: z.string().max(5000, "Description is too long").optional().or(z.literal("")),
  attachedCode: z.string().max(20000, "Code is too long").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export const CreateQuestionPage = () => {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateQuestion();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", attachedCode: "" },
  });

  useEffect(() => () => reset(), [reset]);

  const onSubmit = async (values: FormValues) => {
    const created = await mutateAsync({
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      attachedCode: values.attachedCode?.trim() || undefined,
    });
    navigate(`/questions/${created.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-semibold mb-4">Ask a question</h1>

      <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Question title"
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
                className="w-full"
              />
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
                className="w-full"
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
                slotProps={{input: { className: "font-mono" }}}
                className="w-full"
              />
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
