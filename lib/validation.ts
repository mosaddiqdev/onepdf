export const VALIDATION_LIMITS = {
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50") * 1024 * 1024,
  MAX_TOTAL_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_TOTAL_SIZE_MB || "500") * 1024 * 1024,
  MAX_FILES: parseInt(process.env.NEXT_PUBLIC_MAX_FILES || "50"),
  MAX_PAGES_PER_FILE: parseInt(process.env.NEXT_PUBLIC_MAX_PAGES_PER_FILE || "500"),
  MAX_TOTAL_PAGES: parseInt(process.env.NEXT_PUBLIC_MAX_TOTAL_PAGES || "2000"),
  MIN_DPI: 72,
  MAX_DPI: 600,
  MAX_FILENAME_LENGTH: 255,
} as const;

const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46];

export async function validatePDFFile(file: File): Promise<ValidationError | null> {
  if (file.type !== "application/pdf") {
    return {
      type: "file_type",
      message: `"${file.name}" is not a PDF file. Only PDF files are supported.`,
      file: file.name,
    };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return {
      type: "file_type",
      message: `"${file.name}" must have a .pdf extension.`,
      file: file.name,
    };
  }

  if (file.size > VALIDATION_LIMITS.MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    const maxMB = Math.round(VALIDATION_LIMITS.MAX_FILE_SIZE / (1024 * 1024));
    return {
      type: "file_size",
      message: `"${file.name}" is ${sizeMB}MB. Files must be smaller than ${maxMB}MB.`,
      file: file.name,
    };
  }

  if (file.size === 0) {
    return {
      type: "file_size",
      message: `"${file.name}" is empty. Please select a valid PDF file.`,
      file: file.name,
    };
  }

  try {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
      if (bytes[i] !== PDF_MAGIC_BYTES[i]) {
        return {
          type: "file_type",
          message: `"${file.name}" is not a valid PDF file. The file appears to be corrupted or in a different format.`,
          file: file.name,
        };
      }
    }
  } catch (error) {
    return {
      type: "file_type",
      message: `"${file.name}" could not be read. Please try again or select a different file.`,
      file: file.name,
    };
  }

  return null;
}

export async function validateFiles(files: File[]): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  if (files.length === 0) {
    errors.push({
      type: "file_count",
      message: "Please select at least one PDF file.",
    });
    return errors;
  }

  if (files.length > VALIDATION_LIMITS.MAX_FILES) {
    errors.push({
      type: "file_count",
      message: `Too many files selected. Maximum ${VALIDATION_LIMITS.MAX_FILES} files allowed.`,
    });
    return errors;
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > VALIDATION_LIMITS.MAX_TOTAL_SIZE) {
    const totalMB = Math.round(totalSize / (1024 * 1024));
    const maxMB = Math.round(VALIDATION_LIMITS.MAX_TOTAL_SIZE / (1024 * 1024));
    errors.push({
      type: "file_size",
      message: `Total file size is ${totalMB}MB. Maximum ${maxMB}MB allowed.`,
    });
  }

  for (const file of files) {
    const error = await validatePDFFile(file);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

export function validateFilename(filename: string): ValidationError | null {
  if (!filename.trim()) {
    return {
      type: "filename",
      message: "Filename cannot be empty.",
    };
  }

  if (filename.length > VALIDATION_LIMITS.MAX_FILENAME_LENGTH) {
    return {
      type: "filename",
      message: `Filename is too long. Maximum ${VALIDATION_LIMITS.MAX_FILENAME_LENGTH} characters allowed.`,
    };
  }

  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(filename)) {
    return {
      type: "filename",
      message:
        "Filename contains invalid characters. Please use only letters, numbers, spaces, hyphens, and underscores.",
    };
  }

  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  if (reservedNames.test(filename)) {
    return {
      type: "filename",
      message: "Filename uses a reserved name. Please choose a different name.",
    };
  }

  return null;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, "_$1")
    .substring(0, VALIDATION_LIMITS.MAX_FILENAME_LENGTH);
}

export function validateSettings(settings: {
  pagesPerSheet: number;
  dpi: number;
  filename: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (
    !Number.isInteger(settings.pagesPerSheet) ||
    settings.pagesPerSheet < 1 ||
    settings.pagesPerSheet > 9
  ) {
    errors.push({
      type: "settings",
      message: "Pages per sheet must be between 1 and 9.",
    });
  }

  if (
    !Number.isInteger(settings.dpi) ||
    settings.dpi < VALIDATION_LIMITS.MIN_DPI ||
    settings.dpi > VALIDATION_LIMITS.MAX_DPI
  ) {
    errors.push({
      type: "settings",
      message: `DPI must be between ${VALIDATION_LIMITS.MIN_DPI} and ${VALIDATION_LIMITS.MAX_DPI}.`,
    });
  }

  const filenameError = validateFilename(settings.filename);
  if (filenameError) {
    errors.push(filenameError);
  }

  return errors;
}

export function validatePageCount(
  totalPages: number,
  pagesPerSheet: number
): ValidationError | null {
  if (totalPages > VALIDATION_LIMITS.MAX_TOTAL_PAGES) {
    return {
      type: "pages",
      message: `Too many pages to process (${totalPages}). Maximum ${VALIDATION_LIMITS.MAX_TOTAL_PAGES} pages allowed.`,
    };
  }

  const outputSheets = Math.ceil(totalPages / pagesPerSheet);
  if (outputSheets > 1000) {
    return {
      type: "pages",
      message: `This would create ${outputSheets} output sheets. Please reduce the number of pages or increase pages per sheet.`,
    };
  }

  return null;
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return errors[0].message;
  }

  return `Multiple issues found:\n${errors.map((e) => `• ${e.message}`).join("\n")}`;
}
