"use client";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookUploadFormValues } from "@/types";
import { UploadSchema } from "@/lib/zod";
import FileUploader from "./FileUploader";
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPES } from "@/lib/constants";
import { ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import VoiceSelector from "./VoiceSelector";
import { Button } from "./ui/button";

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const form = useForm<BookUploadFormValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      title: "",
      author: "",
      persona: "",
      pdfFile: undefined,
      coverImage: undefined,
    },
  });
  const onSubmit = async (data: BookUploadFormValues) => {
    // if (!userId) {
    //   return toast.error("Please login to upload books");
    // }
    setIsSubmitting(true);
  };

  if (!isMounted) return null;

  return (
    <div className="new-book-wrapper">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* PDF Uploader */}
        <FileUploader
          control={form.control}
          name="pdfFile"
          label="Upload PDF File"
          acceptTypes={ACCEPTED_PDF_TYPES}
          icon={Upload}
          placeholder="Click to upload PDF"
          hint="PDF file (max 50MB)"
          disabled={isSubmitting}
        />
        {/* image Uploader */}
        <FileUploader
          control={form.control}
          name={"coverImage"}
          label={"Upload Cover Image"}
          acceptTypes={ACCEPTED_IMAGE_TYPES}
          icon={ImageIcon}
          placeholder={"Click to upload cover image"}
          hint={"Image file (max 50MB)"}
          disabled={isSubmitting}
        />
        {/* Title using Field */}
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="form-label" htmlFor="title">
                Title
              </FieldLabel>
              <FieldContent>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="ex: Rich Dad Poor Dad"
                  {...field}
                  disabled={isSubmitting}
                />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* Author using Field*/}
        <Controller
          control={form.control}
          name="author"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="form-label" htmlFor="author">
                Author Name
              </FieldLabel>
              <FieldContent>
                <input
                  id="author"
                  type="text"
                  className="form-input"
                  placeholder="ex: Robert Kiyosaki"
                  {...field}
                  disabled={isSubmitting}
                />
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* 5. Voice Selector */}
        <Controller
          control={form.control}
          name="persona"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="form-label" htmlFor="author">
                Choose Assistant Voice
              </FieldLabel>
              <VoiceSelector
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* submit button */}
        <Button type="submit" className="form-btn" disabled={isSubmitting}>
          Begin Synthesis
        </Button>
      </form>
    </div>
  );
};

export default UploadForm;
