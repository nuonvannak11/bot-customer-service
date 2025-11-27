import axios, { AxiosError } from "axios";
import { get_env, empty } from "../utils/util";

interface SMSResponse {
    success?: boolean;
    [key: string]: any;
}

interface SendResult {
    code: number;
    message: string;
}

class SendSMS {
    private secretkey: string;
    private privatekey: string;
    private apiUrl: string;

    constructor() {
        this.secretkey = get_env("SMS_SECRET_KEY");
        this.privatekey = get_env("SMS_PRIVATE_KEY");
        this.apiUrl = get_env("SMS_API_URL");
    }

    async send_msg(phone: string, message: string): Promise<SendResult> {
        try {
            if (empty(this.secretkey) || empty(this.privatekey) || empty(this.apiUrl)) {
                return { code: 500, message: "SMS service is not configured properly." };
            }
            if (empty(phone) || empty(message)) {
                return { code: 400, message: "Phone number or message is empty." };
            }

            const response = await axios.post<SMSResponse>(
                `${this.apiUrl}?private_key=${this.privatekey}`,
                {
                    sender: "Nuon Vannak",
                    to: phone,
                    content: message,
                },
                {
                    headers: {
                        "X-Secret": this.secretkey,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data && (response.data.success || response.status === 200)) {
                return { code: 200, message: "SMS sent successfully." };
            } else {
                return { code: 500, message: "Unexpected response from SMS API." };
            }
        } catch (err) {
            const error = err as AxiosError;
            const errMsg =
                error.response?.data && typeof error.response.data === "object"
                    ? JSON.stringify(error.response.data)
                    : error.message;

            return { code: 500, message: `Failed to send SMS: ${errMsg}` };
        }
    }
}

export default SendSMS;
