import { Socket } from "socket.io-client";
import { useSocketStore } from "@/sockets/store";

export const setupScanHandler = (socket: Socket) => {
    const handleScan = (data: unknown) => {
        useSocketStore.getState().setLastScanResult(data);
    };

    socket.on("scan_finished", handleScan);

    return () => {
        socket.off("scan_finished", handleScan);
    };
};
