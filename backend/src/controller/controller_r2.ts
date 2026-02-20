import { Request, Response } from "express";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import r2 from "../config/r2";
import { get_env } from "../libs/get_env";
import { empty, str_lower } from "../utils/util";
import { eLog } from "../libs/lib";
import { ProtectController } from "./controller_protect";
import { response_data } from "../libs/lib";
import { UploadAvatarRequest } from "../interface";

class R2Controller extends ProtectController {
    private bucket = get_env("R2_BUCKET");
    private publicUrl = get_env("R2_PUBLIC_URL");

    private valid_file(file: Express.Multer.File) {
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
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

    public async compress_img(file: Express.Multer.File, name: string): Promise<{ success: true; buffer: Buffer; fileName: string; mimetype: string } | { success: false }> {
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

    public async uploadFile(file: Express.Multer.File, path: string, name: string): Promise<{ success: boolean; message?: string; url?: string; }> {
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
        } catch (error: unknown) {
            eLog("Error uploading file to R2:", error);
            return { success: false, message: "Failed to upload file" };
        }
    }

    public async deleteFile(file_path_name: string): Promise<{ success: boolean, message?: string }> {
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
        } catch (error: unknown) {
            eLog("Error deleting file from R2:", error);
            return { success: false, message: "Failed to delete file" };
        }
    }

    public async upload(req: Request, res: Response): Promise<Response | void> {
        const result = await this.protect_post<UploadAvatarRequest>(req, res, true);
        if (!result) return;
        const { name, path, file } = result;
        if (!name || !path) {
            return response_data(res, 400, "Invalid request", []);
        }
        if (!file) {
            return response_data(res, 400, "Invalid request", []);
        }
        const upload_file = await this.uploadFile(file, path, name);
        if (!upload_file.success) {
            return response_data(res, 500, upload_file.message || "Internal server error", []);
        }
        return response_data(res, 200, "Success", upload_file.url);
    }

    public async delete(req: Request, res: Response) {
        try {
            const results = await this.protect_post<{ file_path: string }>(req, res, true);
            if (!results) return;
            const { file_path } = results;
            if (empty(file_path)) {
                return response_data(res, 400, "Missing file path identifier", []);
            }
            const result = await this.deleteFile(file_path);
            const { success, message } = result;
            if (!success) {
                return response_data(res, 500, message || "Failed to delete file", []);
            }
            return response_data(res, 200, "File deleted successfully", []);
        } catch (error: unknown) {
            eLog("Controller Delete Error:", error);
            return response_data(res, 500, "Internal Server Error", []);
        }
    }
}

export default new R2Controller;