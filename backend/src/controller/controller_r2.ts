import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { get_env, empty, str_lower, eLog } from "../utils/util";
import r2 from "../config/r2";

class R2Controller {
    private bucket: string;
    private publicUrl: string;

    constructor() {
        this.bucket = get_env("R2_BUCKET");
        this.publicUrl = get_env("R2_PUBLIC_URL");
    }

    valid_file(file: Express.Multer.File) {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        const mimetype = file.mimetype;
        const size = file.size;
        if (empty(mimetype) || empty(size)) {
            return { success: false, error: "File not found." };
        } else if (size > MAX_SIZE) {
            return { success: false, error: "File size exceeds 5MB limit" };
        } else if (!ALLOWED_TYPES.includes(mimetype)) {
            return { success: false, error: "Invalid file extension." };
        }
        const extension = mimetype.split('/')[1];
        return { success: true, extension: str_lower(extension), size, mimetype };
    }

    async compress_img(file: Express.Multer.File, name: string): Promise<{ success: true; buffer: Buffer; fileName: string; mimetype: string } | { success: false }> {
        try {
            const compress = await sharp(file.buffer)
                .rotate()
                .webp({
                    quality: 80,
                    effort: 3
                })
                .toBuffer();
            return {
                success: true,
                buffer: compress,
                fileName: `${name}.webp`,
                mimetype: "image/webp"
            };

        } catch (error) {
            return { success: false };
        }
    }

    async uploadFile(file: Express.Multer.File, path: string, name: string): Promise<{ success: boolean; message?: string; url?: string; }> {
        const check_file = this.valid_file(file);
        if (!check_file.success) {
            return { success: false, message: check_file.error };
        }

        let fileBuffer = file.buffer;
        let fileName = name + '.' + check_file.extension;
        let mimetype = check_file.mimetype;

        if (check_file.extension !== "webp") {
            const compress = await this.compress_img(file, name);
            if (!compress.success) {
                return { success: false, message: "Failed to compress image." };
            }
            fileBuffer = compress.buffer;
            fileName = compress.fileName;
            mimetype = compress.mimetype;
        }

        const key = path + `/${fileName}`;
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: fileBuffer,
            ContentType: mimetype,
        });

        try {
            await r2.send(command);
            const fileUrl = this.publicUrl + '/' + key;
            return { success: true, message: "File uploaded successfully", url: fileUrl };
        } catch (error: any) {
            eLog("Error uploading file to R2:", error);
            return { success: false, message: `Failed to upload file: ${error.message}` };
        }
    }

    async deleteFile(file_path_name: string): Promise<{ success: boolean, message?: string }> {
        if (empty(file_path_name)) {
            return { success: false, message: "File name cannot be empty." };
        }
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: file_path_name,
        });
        try {
            await r2.send(command);
            return { success: true, message: "File deleted successfully" };
        } catch (error: any) {
            eLog("Error deleting file from R2:", error);
            return { success: false, message: `Failed to delete file: ${error.message}` };
        }
    }
}

export default R2Controller;