import { S3Client } from "@aws-sdk/client-s3";
import { get_env } from "../utils/get_env";

const CF_ACCOUNT_ID = get_env("CF_ACCOUNT_ID");
const CF_ACCESS_KEY = get_env("CF_ACCESS_KEY");
const CF_SECRET_KEY = get_env("CF_SECRET_KEY");

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: CF_ACCESS_KEY,
        secretAccessKey: CF_SECRET_KEY,
    },
});

export default r2;

