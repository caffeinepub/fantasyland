import ChatRoom from "./ChatRoom";

interface Props {
  persona: string;
  onBack: () => void;
}

export default function RoleplayRoom({ persona, onBack }: Props) {
  return (
    <ChatRoom
      roomId="roleplay"
      roomName="Roleplay Room"
      roomEmoji="🎭"
      username={persona}
      onBack={onBack}
    />
  );
}
