import { useState } from "react";
import { getCsrfToken } from "@/api/admin";

interface UploadResult {
  url: string;
  publicId: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (file: File, folder = "general"): Promise<UploadResult> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const headers: Record<string, string> = {};
      const token = getCsrfToken();
      if (token) headers["X-CSRF-Token"] = token;

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message || "Upload failed");
      }

      return await res.json();
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}
