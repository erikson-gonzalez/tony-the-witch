import { useState } from "react";

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

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
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
