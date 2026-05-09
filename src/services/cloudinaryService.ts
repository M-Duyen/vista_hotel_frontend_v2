const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "your_cloud_name";
const CLOUDINARY_CLOUD_NAME_ZANG =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME_ZANG || "your_cloud_name";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "your_upload_preset";

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Upload 1 ảnh lên Cloudinary
 */
export const uploadImageToCloudinary = async (
  file: File
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "vistal-hotel");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

/**
 * Upload nhiều ảnh lên Cloudinary
 */
export const uploadMultipleImagesToCloudinary = async (
  files: File[]
): Promise<CloudinaryUploadResponse[]> => {
  const uploadPromises = files.map((file) => uploadImageToCloudinary(file));
  return Promise.all(uploadPromises);
};

/**
 * Upload ảnh review lên Cloudinary với cloud name dy4shjftg
 * Return array of secure URLs
 */
export const uploadReviewImagesToCloudinary = async (
  files: File[]
): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "vistal-hotel/reviews");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME_ZANG}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary upload error:", errorData);
        throw new Error(
          `Failed to upload image: ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data: CloudinaryUploadResponse = await response.json();
      console.log("Uploaded to Cloudinary:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

export default {
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  uploadReviewImagesToCloudinary,
};
