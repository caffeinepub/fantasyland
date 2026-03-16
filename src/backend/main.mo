import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";



actor {
  // ─── Types ────────────────────────────────────────────────────────────────

  type Message = {
    username : Text;
    text : Text;
    timestamp : Int;
    voiceUrl : ?Text;
  };

  type RPSGame = {
    id : Text;
    roomId : Text;
    player1 : Text;
    var player2 : ?Text;
    var move1 : ?Text;
    var move2 : ?Text;
    var result : ?Text;
    var status : Text;
  };

  type GameStatus = {
    #pending;
    #accepted;
    #denied;
  };

  type GameChallenge = {
    id : Text;
    roomId : Text;
    challenger : Text;
    gameName : Text;
    var status : GameStatus;
    timestamp : Int;
  };

  type GameChallengeView = {
    id : Text;
    roomId : Text;
    challenger : Text;
    gameName : Text;
    status : GameStatus;
    timestamp : Int;
  };

  type FriendRequestStatus = {
    #pending;
    #accepted;
    #declined;
  };

  type FriendRequest = {
    from : Text;
    to : Text;
    var status : FriendRequestStatus;
    timestamp : Int;
  };

  type FriendRequestView = {
    from : Text;
    to : Text;
    status : FriendRequestStatus;
    timestamp : Int;
  };

  // ─── State ────────────────────────────────────────────────────────────────

  let rooms = Map.empty<Text, List.List<Message>>();
  let presence = Map.empty<Text, Map.Map<Text, Int>>();
  let users = Map.empty<Text, Text>();
  let sessions = Map.empty<Text, Text>();
  let matchQueue = Map.empty<Text, Int>();
  let matchResults = Map.empty<Text, Text>();
  let rpsGames = Map.empty<Text, RPSGame>();
  let gameChallenges = Map.empty<Text, GameChallenge>();
  let friendRequests = Map.empty<Text, FriendRequest>();
  var idCounter : Nat = 0;

  // ─── Init ─────────────────────────────────────────────────────────────────

  do {
    rooms.add("world", List.empty<Message>());
    rooms.add("truth-dare", List.empty<Message>());
    rooms.add("roleplay", List.empty<Message>());
    rooms.add("chill", List.empty<Message>());
  };

  func nextId() : Text {
    idCounter += 1;
    idCounter.toText();
  };

  func makeRPSGame(gameId : Text, roomId : Text, challenger : Text) : RPSGame {
    let g : RPSGame = {
      id = gameId;
      roomId;
      player1 = challenger;
      var player2 : ?Text = null;
      var move1 : ?Text = null;
      var move2 : ?Text = null;
      var result : ?Text = null;
      var status : Text = "waiting";
    };
    g;
  };

  // Converts a GameChallenge with a mutable status field to an immutable view.
  func toGameChallengeView(challenge : GameChallenge) : GameChallengeView {
    {
      id = challenge.id;
      roomId = challenge.roomId;
      challenger = challenge.challenger;
      gameName = challenge.gameName;
      status = challenge.status;
      timestamp = challenge.timestamp;
    };
  };

  func toFriendRequestView(req : FriendRequest) : FriendRequestView {
    {
      from = req.from;
      to = req.to;
      status = req.status;
      timestamp = req.timestamp;
    };
  };

  // ─── Auth ────────────────────────────────────────────────────────────────

  public shared ({ caller }) func register(username : Text, password : Text) : async Bool {
    if (users.containsKey(username)) { return false };
    users.add(username, password);
    true;
  };

  public shared ({ caller }) func login(username : Text, password : Text) : async ?Text {
    switch (users.get(username)) {
      case (?p) {
        if (p != password) { return null };
        let token = Time.now().toText() # username;
        sessions.add(token, username);
        ?token;
      };
      case (_) { null };
    };
  };

  public shared ({ caller }) func logout(token : Text) : async () {
    sessions.remove(token);
  };

  public query ({ caller }) func validateSession(token : Text) : async ?Text {
    sessions.get(token);
  };

  // ─── Chat ─────────────────────────────────────────────────────────────────

  public shared ({ caller }) func sendMessage(
    roomId : Text, username : Text, message : Text, voiceUrl : ?Text
  ) : async () {
    let msg = { username; text = message; timestamp = Time.now(); voiceUrl };
    switch (rooms.get(roomId)) {
      case (null) {};
      case (?msgs) { msgs.add(msg) };
    };
  };

  public query ({ caller }) func getMessages(roomId : Text) : async [Message] {
    switch (rooms.get(roomId)) {
      case (null) { [] };
      case (?msgs) {
        let arr = msgs.toArray();
        arr.sort(func(a : Message, b : Message) : Order.Order {
          Int.compare(a.timestamp, b.timestamp);
        });
      };
    };
  };

  public shared ({ caller }) func createPrivateRoom(code : Text) : async Bool {
    if (rooms.containsKey(code)) { return false };
    rooms.add(code, List.empty<Message>());
    true;
  };

  public query ({ caller }) func roomExists(code : Text) : async Bool {
    rooms.containsKey(code);
  };

  // ─── Presence ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func updatePresence(roomId : Text, username : Text) : async () {
    let now = Time.now();
    switch (presence.get(roomId)) {
      case (null) {
        let m = Map.empty<Text, Int>();
        m.add(username, now);
        presence.add(roomId, m);
      };
      case (?m) { m.add(username, now) };
    };
  };

  public query ({ caller }) func getOnlineUsers(roomId : Text) : async [Text] {
    let threshold = Time.now() - 90_000_000_000;
    switch (presence.get(roomId)) {
      case (null) { [] };
      case (?m) {
        let buf = List.empty<Text>();
        for ((user, ts) in m.entries()) {
          if (ts > threshold) { buf.add(user) };
        };
        buf.toArray();
      };
    };
  };

  public query ({ caller }) func getRoomOnlineCount(roomId : Text) : async Nat {
    let threshold = Time.now() - 90_000_000_000;
    switch (presence.get(roomId)) {
      case (null) { 0 };
      case (?m) {
        var count = 0;
        for ((_, ts) in m.entries()) {
          if (ts > threshold) { count += 1 };
        };
        count;
      };
    };
  };

  // ─── Matchmaking ──────────────────────────────────────────────────────────

  public shared ({ caller }) func joinMatchmaking(username : Text) : async ?Text {
    switch (matchResults.get(username)) {
      case (?roomId) {
        matchResults.remove(username);
        return ?roomId;
      };
      case (null) {};
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

  public shared ({ caller }) func leaveMatchmaking(username : Text) : async () {
    matchQueue.remove(username);
    matchResults.remove(username);
  };

  public query ({ caller }) func getMatchResult(username : Text) : async ?Text {
    matchResults.get(username);
  };

  // ─── Rock Paper Scissors ──────────────────────────────────────────────────

  public shared ({ caller }) func createRPSChallenge(roomId : Text, challenger : Text) : async Text {
    let gameId = "rps-" # nextId();
    rpsGames.add(gameId, makeRPSGame(gameId, roomId, challenger));
    gameId;
  };

  public shared ({ caller }) func joinRPSGame(gameId : Text, username : Text) : async Bool {
    switch (rpsGames.get(gameId)) {
      case (null) { false };
      case (?game) {
        if (game.status == "waiting" and game.player1 != username) {
          game.player2 := ?username;
          game.status := "playing";
          true;
        } else { false };
      };
    };
  };

  public shared ({ caller }) func playRPS(gameId : Text, username : Text, move : Text) : async () {
    switch (rpsGames.get(gameId)) {
      case (null) {};
      case (?game) {
        if (game.status != "playing") { return };
        if (username == game.player1 and game.move1 == null) {
          game.move1 := ?move;
        } else if (?(username) == game.player2 and game.move2 == null) {
          game.move2 := ?move;
        };
        switch (game.move1, game.move2) {
          case (?m1, ?m2) {
            let res =
              if (m1 == m2) { "draw" } else {
                if (
                  (m1 == "rock" and m2 == "scissors") or
                  (m1 == "scissors" and m2 == "paper") or
                  (m1 == "paper" and m2 == "rock")
                ) { "player1wins" } else { "player2wins" };
              };
            game.result := ?res;
            game.status := "done";
          };
          case (_) {};
        };
      };
    };
  };

  public query ({ caller }) func getRPSGame(gameId : Text) : async ?{
    id : Text;
    roomId : Text;
    player1 : Text;
    player2 : ?Text;
    move1 : ?Text;
    move2 : ?Text;
    result : ?Text;
    status : Text;
  } {
    switch (rpsGames.get(gameId)) {
      case (null) { null };
      case (?g) {
        ?{
          id = g.id;
          roomId = g.roomId;
          player1 = g.player1;
          player2 = g.player2;
          move1 = g.move1;
          move2 = g.move2;
          result = g.result;
          status = g.status;
        };
      };
    };
  };

  // ─── Game Challenges ──────────────────────────────────────────────────────

  public shared ({ caller }) func createGameChallenge(
    roomId : Text, challenger : Text, gameName : Text
  ) : async Text {
    let challengeId = "gc-" # nextId();
    let challenge : GameChallenge = {
      id = challengeId;
      roomId;
      challenger;
      gameName;
      var status = #pending;
      timestamp = Time.now();
    };
    gameChallenges.add(challengeId, challenge);
    challengeId;
  };

  public shared ({ caller }) func respondToChallenge(
    challengeId : Text, _username : Text, accept : Bool
  ) : async Bool {
    switch (gameChallenges.get(challengeId)) {
      case (null) { false };
      case (?challenge) {
        if (challenge.status != #pending) { return false };
        challenge.status := if (accept) { #accepted } else { #denied };
        true;
      };
    };
  };

  public query ({ caller }) func getPendingChallenges(roomId : Text) : async [GameChallengeView] {
    let now = Time.now();
    let timeLimit = now - 300_000_000_000;
    let pending = List.empty<GameChallengeView>();
    for ((_, challenge) in gameChallenges.entries()) {
      if (challenge.roomId == roomId and challenge.status == #pending and challenge.timestamp > timeLimit) {
        pending.add(toGameChallengeView(challenge));
      };
    };
    pending.toArray();
  };

  // ─── Friend Requests ──────────────────────────────────────────────────────

  public shared ({ caller }) func sendFriendRequest(fromUser : Text, toUser : Text) : async Bool {
    if (fromUser == toUser) { return false };
    let reqKey = fromUser # "->>-" # toUser;
    let reverseKey = toUser # "->>-" # fromUser;
    // Already friends or request pending
    if (friendRequests.containsKey(reqKey) or friendRequests.containsKey(reverseKey)) {
      return false;
    };
    let req : FriendRequest = {
      from = fromUser;
      to = toUser;
      var status = #pending;
      timestamp = Time.now();
    };
    friendRequests.add(reqKey, req);
    true;
  };

  public shared ({ caller }) func respondToFriendRequest(fromUser : Text, toUser : Text, accept : Bool) : async Bool {
    let reqKey = fromUser # "->>-" # toUser;
    switch (friendRequests.get(reqKey)) {
      case (null) { false };
      case (?req) {
        if (req.status != #pending) { return false };
        req.status := if (accept) { #accepted } else { #declined };
        if (accept) {
          // Create a shared DM room for the two friends
          let dmKey = if (fromUser < toUser) { fromUser # "--dm--" # toUser } else { toUser # "--dm--" # fromUser };
          if (not rooms.containsKey(dmKey)) {
            rooms.add(dmKey, List.empty<Message>());
          };
        };
        true;
      };
    };
  };

  public query ({ caller }) func getPendingFriendRequests(username : Text) : async [FriendRequestView] {
    let result = List.empty<FriendRequestView>();
    for ((_, req) in friendRequests.entries()) {
      if (req.to == username and req.status == #pending) {
        result.add(toFriendRequestView(req));
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getFriends(username : Text) : async [Text] {
    let result = List.empty<Text>();
    for ((_, req) in friendRequests.entries()) {
      if (req.status == #accepted) {
        if (req.from == username) { result.add(req.to) }
        else if (req.to == username) { result.add(req.from) };
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getFriendDmRoomId(user1 : Text, user2 : Text) : async ?Text {
    let dmKey = if (user1 < user2) { user1 # "--dm--" # user2 } else { user2 # "--dm--" # user1 };
    if (rooms.containsKey(dmKey)) { ?dmKey } else { null };
  };

  public query ({ caller }) func getFriendRequestStatus(fromUser : Text, toUser : Text) : async Text {
    let reqKey = fromUser # "->>-" # toUser;
    let reverseKey = toUser # "->>-" # fromUser;
    switch (friendRequests.get(reqKey)) {
      case (?req) {
        switch (req.status) {
          case (#pending) { "pending" };
          case (#accepted) { "accepted" };
          case (#declined) { "declined" };
        };
      };
      case (null) {
        switch (friendRequests.get(reverseKey)) {
          case (?req) {
            switch (req.status) {
              case (#pending) { "incoming" };
              case (#accepted) { "accepted" };
              case (#declined) { "declined" };
            };
          };
          case (null) { "none" };
        };
      };
    };
  };
};
