export interface ConfrimGroupChanel {
    data_time: string;
    sender: {
        sender_id: string;
        full_name: string;
        user_name: string;
        type: string;
    };
    group_chanel: {
        chatId: string;
        name: string;
        type: string;
    },
    user_id: string;
    event: string;
}