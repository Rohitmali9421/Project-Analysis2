import cloudinary from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadOnCloudinary(localFilePath, folder = "Uploads") {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });

    fs.unlinkSync(localFilePath); 
    return {
      public_id: response.public_id,
      url: response.secure_url, 
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); // Ensure file is removed
    return null;
  }
}

export async function deleteOnCloudinary(public_id) {
  try {
    const response = await cloudinary.v2.uploader.destroy(public_id);
    return response.result === "ok";
  } catch (error) {
    console.error("Error deleting Cloudinary resource:", error);
    return false;
  }
}
