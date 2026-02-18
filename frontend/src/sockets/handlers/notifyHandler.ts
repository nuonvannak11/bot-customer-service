import { Socket } from "socket.io-client";
import { useSocketStore } from "@/sockets/store";

export const setupNotifyHandler = (socket: Socket) => {
    const handleNotify = (data: unknown) => {
        // DIRECTLY update the store. No React re-renders unless necessary.
        useSocketStore.getState().addNotification(data);
    };

    socket.on("notify", handleNotify);

    return () => {
        socket.off("notify", handleNotify);
    };
};
