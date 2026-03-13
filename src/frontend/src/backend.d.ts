import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    username: string;
    text: string;
    timestamp: bigint;
}
export interface backendInterface {
    createPrivateRoom(code: string): Promise<boolean>;
    getMessages(roomId: string): Promise<Array<Message>>;
    roomExists(code: string): Promise<boolean>;
    sendMessage(roomId: string, username: string, message: string): Promise<void>;
}
