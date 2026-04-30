import cloudinary from "../config/cloudinaryConfig.js";

export async function imageUpload(filePath) {
    try{
        const res = await cloudinary.uploader.upload(filePath, {
          resource_type: "image",
        });

        return res;
    }
    catch(err){
      throw new Error(`Image upload failed: ${err.message}`);
    }
}

export async function imageDelete(public_id) {
    try{
      const res = await cloudinary.uploader.destroy(public_id);

      if (res.result == 'ok')
        return res.result;
      else
          throw new Error(`Failed to delete image: ${res.result}`);
    }
    catch(err){
      throw new Error(`Image delete failed: ${err.message}`);
    }
}

export async function videoUpload(filePath) {
  try {
    if (!filePath) 
      throw new Error("No video provided to upload");

    // Upload the video from the local file path
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
    });

    return result;
  } catch (err) {
    throw new Error(`Video upload failed: ${JSON.stringify(err)}`);
  }
}

export async function videoDelete(public_id) {
  try{
    if(!public_id)
      throw new Error("no video id provided to delete");
    const res = await cloudinary.uploader.destroy(public_id, { resource_type: "video" });

    if (res.result === 'ok')
      return res.result;
    else
        throw new Error('Failed to delete video');
  }
  catch(err){
    throw new Error(`Video delete failed: ${err.message}`);
  }
}