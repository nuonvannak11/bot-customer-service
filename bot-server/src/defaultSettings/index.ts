export const default_settings_bot = {
    max_upload_size: 3 * 1024 * 1024, //if file size less than 3MB, download and scan directly
    max_download_size: 20 * 1024 * 1024, //max file size allowed to download from Telegram
    max_retry_download: 2, //max retry to download file from Telegram
};