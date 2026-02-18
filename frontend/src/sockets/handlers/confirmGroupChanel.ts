import { Socket } from "socket.io-client";
import { useSocketStore } from "@/sockets/store";
import { ConfrimGroupChanel } from "@/interface/interface.telegram";

export const setupConfirmActionHandler = (socket: Socket) => {
    const handleConfirmAction = (data: ConfrimGroupChanel) => {
        useSocketStore.getState().setConfirmGroupEvent(data);
    };
    socket.on("confirm:group-chanel", handleConfirmAction);
    return () => {
        socket.off("confirm:group-chanel", handleConfirmAction);
    };
};