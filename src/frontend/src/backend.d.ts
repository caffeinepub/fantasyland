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
    voiceUrl?: string;
    timestamp: bigint;
}
export interface GameChallengeView {
    id: string;
    status: GameStatus;
    timestamp: bigint;
    gameName: string;
    roomId: string;
    challenger: string;
}
export enum GameStatus {
    pending = "pending",
    denied = "denied",
    accepted = "accepted"
}
export enum FriendRequestStatus {
    pending = "pending",
    accepted = "accepted",
    declined = "declined"
}
export interface FriendRequestView {
    from: string;
    to: string;
    status: FriendRequestStatus;
    timestamp: bigint;
}
export interface backendInterface {
    createGameChallenge(roomId: string, challenger: string, gameName: string): Promise<string>;
    createPrivateRoom(code: string): Promise<boolean>;
    createRPSChallenge(roomId: string, challenger: string): Promise<string>;
    getMatchResult(username: string): Promise<string | null>;
    getMessages(roomId: string): Promise<Array<Message>>;
    getOnlineUsers(roomId: string): Promise<Array<string>>;
    getPendingChallenges(roomId: string): Promise<Array<GameChallengeView>>;
    getRPSGame(gameId: string): Promise<{
        id: string;
        status: string;
        result?: string;
        move1?: string;
        move2?: string;
        player1: string;
        player2?: string;
        roomId: string;
    } | null>;
    getRoomOnlineCount(roomId: string): Promise<bigint>;
    joinMatchmaking(username: string): Promise<string | null>;
    joinRPSGame(gameId: string, username: string): Promise<boolean>;
    leaveMatchmaking(username: string): Promise<void>;
    login(username: string, password: string): Promise<string | null>;
    logout(token: string): Promise<void>;
    playRPS(gameId: string, username: string, move: string): Promise<void>;
    register(username: string, password: string): Promise<boolean>;
    respondToChallenge(challengeId: string, _username: string, accept: boolean): Promise<boolean>;
    roomExists(code: string): Promise<boolean>;
    sendMessage(roomId: string, username: string, message: string, voiceUrl: string | null): Promise<void>;
    updatePresence(roomId: string, username: string): Promise<void>;
    validateSession(token: string): Promise<string | null>;
    sendFriendRequest(fromUser: string, toUser: string): Promise<boolean>;
    respondToFriendRequest(fromUser: string, toUser: string, accept: boolean): Promise<boolean>;
    getPendingFriendRequests(username: string): Promise<Array<FriendRequestView>>;
    getFriends(username: string): Promise<Array<string>>;
    getFriendDmRoomId(user1: string, user2: string): Promise<string | null>;
    getFriendRequestStatus(fromUser: string, toUser: string): Promise<string>;
}
