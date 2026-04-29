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
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPES } from "@/lib/constants";
import { ImageIcon, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

import FileUploader from "./FileUploader";
import LoadingOverlay from "./LoadingOverlay";
import VoiceSelector from "./VoiceSelector";
import { useAuth } from "@clerk/nextjs";
import {
  checkBookExists,
  createBook,
  saveBookSegments,
} from "@/lib/actions/book.actions";
import { useRouter } from "next/navigation";
import { parsePDFFile } from "@/lib/utils";
import { upload } from "@vercel/blob/client";

const UploadForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { userId } = useAuth();
  const router = useRouter();

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
    if (!userId) {
      return toast.error("Please login to upload books");
    }
    setIsSubmitting(true);
    // todo: posthog
    try {
      const bookInDB = await checkBookExists(data.title);
      if (bookInDB.exists && bookInDB.data) {
        toast.info("Book already exists");
        form.reset();
        router.push(`/books/${bookInDB.data.slug}`);
        return;
      }

      const fileTitle = data.title.replace(/\s+/g, "-").toLowerCase();
      const pdfFile = data.pdfFile;

      const parsedPDF = await parsePDFFile(pdfFile);

      // @vercel-blob https://vercel.com/docs/vercel-blob/client-upload
      const uploadedPDFBlob = await upload(fileTitle, pdfFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: "application/pdf",
      });

      let coverUrl: string;
      if (data.coverImage) {
        const coverFile = data.coverImage;
        const uploadedCoverBlob = await upload(
          `${fileTitle}_cover.png`,
          coverFile,
          {
            access: "public",
            handleUploadUrl: "/api/upload",
            contentType: coverFile.type,
          }
        );
        coverUrl = uploadedCoverBlob.url;
      } else {
        const response = await fetch(parsedPDF.cover);
        const blob = await response.blob();

        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: "image/png",
        });
        coverUrl = uploadedCoverBlob.url;
      }

      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.persona,
        coverURL: coverUrl,
        fileSize: pdfFile.size,
        fileURL: uploadedPDFBlob.url,
        fileBlobKey: uploadedPDFBlob.pathname,
      });

      if (!book.success) {
        toast.error(
          typeof book.error === "string" ? book.error : "Failed to create book"
        );
        // if (book.isBillingError) {
        //   router.push("/subscriptions");
        // }
        return;
      }

      if (book.alreadyExists) {
        toast.info("Book with same title already exists.");
        form.reset();
        router.push(`/books/${book.data.slug}`);
        return;
      }

      const segments = await saveBookSegments(
        book.data._id,
        userId,
        parsedPDF.content
      );

      if (!segments.success) {
        toast.error("Failed to save book segments");
        throw new Error("Failed to save book segments");
      }

      form.reset();
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong...");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {isSubmitting && <LoadingOverlay />}

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
            hint={"Image file (max 10MB)"}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {/* 5. Voice Selector */}
          <Controller
            control={form.control}
            name="persona"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="form-label" htmlFor="persona">
                  Choose Assistant Voice
                </FieldLabel>
                <VoiceSelector
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {/* submit button */}
          <Button type="submit" className="form-btn" disabled={isSubmitting}>
            Begin Synthesis
          </Button>
        </form>
      </div>
    </>
  );
};

export default UploadForm;
