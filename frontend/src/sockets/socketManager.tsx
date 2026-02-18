"use client";

import React, { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { setupNotifyHandler } from "./handlers/notifyHandler";
import { setupScanHandler } from "./handlers/scanHandler";
import { setupConfirmActionHandler } from "./handlers/confirmGroupChanel";

export function SocketManagerProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { socket } = useSocket();
    useEffect(() => {
        if (!socket) return;
        const cleanupNotify = setupNotifyHandler(socket);
        const cleanupScan = setupScanHandler(socket);
        const cleanupConfrim = setupConfirmActionHandler(socket);

        return () => {
            cleanupConfrim();
            cleanupNotify();
            cleanupScan();
        };
    }, [socket]);
    return <React.Fragment>{children}</React.Fragment>;
}
