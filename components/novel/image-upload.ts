import { createImageUpload } from "novel";
import { toast } from "sonner";

const onUpload = (file: File) => {
  // Create FormData for Cloudinary upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "image");
  formData.append("folder", "editor");

  const promise = fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  return new Promise((resolve, reject) => {
    toast.promise(
      promise.then(async (res) => {
        if (res.status === 200) {
          const result = await res.json();
          if (result.success && result.data?.url) {
            const url = result.data.url;
            // Preload the image
            const image = new Image();
            image.src = url;
            image.onload = () => {
              resolve(url);
            };
            image.onerror = () => {
              reject(new Error("Failed to load uploaded image"));
            };
          } else {
            throw new Error(result.error || "Upload failed");
          }
        } else {
          const errorResult = await res.json().catch(() => ({}));
          throw new Error(errorResult.error || "Error uploading image. Please try again.");
        }
      }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (e) => {
          reject(e);
          return e.message;
        },
      },
    );
  });
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});
