import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

actor {
  // ─── Types ────────────────────────────────────────────────────────────────

  type Message = {
    username  : Text;
    text      : Text;
    timestamp : Int;
  };

  type RPSGame = {
    id      : Text;
    roomId  : Text;
    player1 : Text;
    var player2 : ?Text;
    var move1   : ?Text;
    var move2   : ?Text;
    var result  : ?Text;
    var status  : Text;
  };

  // ─── State ────────────────────────────────────────────────────────────────

  let rooms        = Map.empty<Text, List.List<Message>>();
  let presence     = Map.empty<Text, Map.Map<Text, Int>>();
  let matchQueue   = Map.empty<Text, Int>();
  let matchResults = Map.empty<Text, Text>();
  let rpsGames     = Map.empty<Text, RPSGame>();
  var idCounter : Nat = 0;

  // ─── Init ─────────────────────────────────────────────────────────────────

  do {
    rooms.add("world",      List.empty<Message>());
    rooms.add("truth-dare", List.empty<Message>());
    rooms.add("roleplay",   List.empty<Message>());
    rooms.add("chill",      List.empty<Message>());
  };

  func nextId() : Text {
    idCounter += 1;
    idCounter.toText();
  };

  func makeRPSGame(gameId : Text, roomId : Text, challenger : Text) : RPSGame {
    let g : RPSGame = {
      id      = gameId;
      roomId  = roomId;
      player1 = challenger;
      var player2 : ?Text = null;
      var move1   : ?Text = null;
      var move2   : ?Text = null;
      var result  : ?Text = null;
      var status  : Text  = "waiting";
    };
    g
  };

  // ─── Chat ─────────────────────────────────────────────────────────────────

  public shared func sendMessage(roomId : Text, username : Text, message : Text) : async () {
    let msg = { username; text = message; timestamp = Time.now() };
    switch (rooms.get(roomId)) {
      case null {};
      case (?msgs) { msgs.add(msg) };
    };
  };

  public query func getMessages(roomId : Text) : async [Message] {
    switch (rooms.get(roomId)) {
      case null { [] };
      case (?msgs) {
        let arr = msgs.toArray();
        arr.sort(func(a : Message, b : Message) : Order.Order {
          Int.compare(a.timestamp, b.timestamp)
        })
      };
    };
  };

  public shared func createPrivateRoom(code : Text) : async Bool {
    if (rooms.containsKey(code)) { return false };
    rooms.add(code, List.empty<Message>());
    true;
  };

  public query func roomExists(code : Text) : async Bool {
    rooms.containsKey(code);
  };

  // ─── Presence ─────────────────────────────────────────────────────────────

  public shared func updatePresence(roomId : Text, username : Text) : async () {
    let now = Time.now();
    switch (presence.get(roomId)) {
      case null {
        let m = Map.empty<Text, Int>();
        m.add(username, now);
        presence.add(roomId, m);
      };
      case (?m) {
        m.add(username, now);
      };
    };
  };

  public query func getOnlineUsers(roomId : Text) : async [Text] {
    let threshold = Time.now() - 90_000_000_000;
    switch (presence.get(roomId)) {
      case null { [] };
      case (?m) {
        let buf = List.empty<Text>();
        for ((user, ts) in m.entries()) {
          if (ts > threshold) { buf.add(user) };
        };
        buf.toArray()
      };
    };
  };

  public query func getRoomOnlineCount(roomId : Text) : async Nat {
    let threshold = Time.now() - 90_000_000_000;
    switch (presence.get(roomId)) {
      case null { 0 };
      case (?m) {
        var count = 0;
        for ((_, ts) in m.entries()) {
          if (ts > threshold) { count += 1 };
        };
        count
      };
    };
  };

  // ─── Matchmaking ─────────────────────────────────────────────────────────

  public shared func joinMatchmaking(username : Text) : async ?Text {
    switch (matchResults.get(username)) {
      case (?roomId) {
        matchResults.remove(username);
        return ?roomId;
      };
      case null {};
    };
    for ((waitingUser, _) in matchQueue.entries()) {
      if (waitingUser != username) {
        let roomId = "dm-" # nextId();
        rooms.add(roomId, List.empty<Message>());
        matchQueue.remove(waitingUser);
        matchResults.add(waitingUser, roomId);
        return ?roomId;
      };
    };
    matchQueue.add(username, Time.now());
    null;
  };

  public shared func leaveMatchmaking(username : Text) : async () {
    matchQueue.remove(username);
    matchResults.remove(username);
  };

  public query func getMatchResult(username : Text) : async ?Text {
    matchResults.get(username);
  };

  // ─── Rock Paper Scissors ───────────────────────────────────────────────

  public shared func createRPSChallenge(roomId : Text, challenger : Text) : async Text {
    let gameId = "rps-" # nextId();
    rpsGames.add(gameId, makeRPSGame(gameId, roomId, challenger));
    gameId;
  };

  public shared func joinRPSGame(gameId : Text, username : Text) : async Bool {
    switch (rpsGames.get(gameId)) {
      case null { false };
      case (?game) {
        if (game.status == "waiting" and game.player1 != username) {
          game.player2 := ?username;
          game.status  := "playing";
          true
        } else { false }
      };
    };
  };

  public shared func playRPS(gameId : Text, username : Text, move : Text) : async () {
    switch (rpsGames.get(gameId)) {
      case null {};
      case (?game) {
        if (game.status != "playing") return;
        if (username == game.player1 and game.move1 == null) {
          game.move1 := ?move;
        } else if (?(username) == game.player2 and game.move2 == null) {
          game.move2 := ?move;
        };
        switch (game.move1, game.move2) {
          case (?m1, ?m2) {
            let res =
              if (m1 == m2) { "draw" }
              else if (
                (m1 == "rock"     and m2 == "scissors") or
                (m1 == "scissors" and m2 == "paper")    or
                (m1 == "paper"    and m2 == "rock")
              ) { "player1wins" }
              else { "player2wins" };
            game.result := ?res;
            game.status := "done";
          };
          case _ {};
        };
      };
    };
  };

  public query func getRPSGame(gameId : Text) : async ?{
    id : Text; roomId : Text; player1 : Text; player2 : ?Text;
    move1 : ?Text; move2 : ?Text; result : ?Text; status : Text;
  } {
    switch (rpsGames.get(gameId)) {
      case null { null };
      case (?g) {
        ?{ id = g.id; roomId = g.roomId; player1 = g.player1;
           player2 = g.player2; move1 = g.move1; move2 = g.move2;
           result = g.result; status = g.status; }
      };
    };
  };
};
