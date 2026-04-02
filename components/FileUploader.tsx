import { FileUploadFieldProps } from "@/types";
import { Controller, FieldValues } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { X } from "lucide-react";

const FileUploader = <T extends FieldValues>({
  control,
  name,
  label,
  acceptTypes,
  disabled,
  icon: Icon,
  placeholder,
  hint,
}: FileUploadFieldProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const file = field.value as File | null;
        const isUploaded = !!file;

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            field.onChange(selectedFile);
          }
        };

        const handleRemove = (e: React.MouseEvent) => {
          e.stopPropagation();
          field.onChange(undefined);
          if (inputRef.current) {
            inputRef.current.value = "";
          }
        };

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="form-label" htmlFor={name}>
              {label}
            </FieldLabel>

            <div
              className={cn(
                "upload-dropzone border-2 border-dashed border-[#8B7355]/20 rounded-lg cursor-pointer transition-colors hover:border-[#8B7355]/40",
                isUploaded && "upload-dropzone-uploaded bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed",
                fieldState.invalid && "border-destructive"
              )}
              onClick={() => !disabled && inputRef.current?.click()}
            >
              <input
                id={name}
                type="file"
                accept={acceptTypes.join(",")}
                className="hidden"
                ref={inputRef}
                onChange={handleFileChange}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />

              {isUploaded ? (
                <div className="flex flex-col items-center relative w-full px-4 py-4">
                  <p className="upload-dropzone-text line-clamp-1 font-medium">
                    {file.name}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={disabled}
                    className="upload-dropzone-remove mt-2 p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 px-4 space-y-2">
                  <Icon className="upload-dropzone-icon w-8 h-8 text-muted-foreground" />
                  <p className="upload-dropzone-text text-sm font-medium">
                    {placeholder}
                  </p>
                  {hint && (
                    <p className="upload-dropzone-hint text-xs text-muted-foreground">
                      {hint}
                    </p>
                  )}
                </div>
              )}
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
};

export default FileUploader;
