import FormData from "form-data";
import axios from "axios";
import hash_data from "@/helper/hash_data";
import { eLog, get_env } from "@/libs/lib";

class ControllerR2 {
    async req_upload(token?: string, file?: File, path?: string, name?: string): Promise<string | null> {
        if (!file || !path || !name || !token) return null;
        try {
            const apiUrl = get_env("BACKEND_URL");
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const formData = new FormData();
            formData.append("file", buffer, file.name);
            formData.append("path", hash_data.encryptData(path));
            formData.append("name", hash_data.encryptData(name));

            const response = await axios.post(
                `${apiUrl}/api/upload/r2/save`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        authorization: `Bearer ${token}`,
                    },
                    timeout: 10_000,
                }
            );
            if (response.data.code === 200) {
                return response.data.data;
            }
            return null;
        } catch (err) {
            eLog("UPLOAD ERROR:", err);
            return null;
        }
    }

    async delete() {

    }
}
export default new ControllerR2;