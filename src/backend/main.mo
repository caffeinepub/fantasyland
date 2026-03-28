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
  let gameQueue = Map.empty<Text, Int>();
  let gameMatchResults = Map.empty<Text, Text>();
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
        matchResults.add(username, roomId);
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

  // ─── Game Zone Matchmaking ────────────────────────────────────────────────

  public shared ({ caller }) func joinGameQueue(username : Text) : async ?{ matchId : Text; opponent : Text } {
    // Check if already matched
    switch (gameMatchResults.get(username)) {
      case (?opponent) {
        gameMatchResults.remove(username);
        let matchId = "game-" # username # "-" # opponent;
        return ?{ matchId; opponent };
      };
      case (null) {};
    };
    // Try to match with someone in queue
    for ((waitingUser, _) in gameQueue.entries()) {
      if (waitingUser != username) {
        gameQueue.remove(waitingUser);
        gameMatchResults.add(waitingUser, username);
        let matchId = "game-" # waitingUser # "-" # username;
        return ?{ matchId; opponent = waitingUser };
      };
    };
    gameQueue.add(username, Time.now());
    null;
  };

  public shared ({ caller }) func leaveGameQueue(username : Text) : async () {
    gameQueue.remove(username);
    gameMatchResults.remove(username);
  };

  public query ({ caller }) func getGameQueueMatch(username : Text) : async ?{ matchId : Text; opponent : Text } {
    switch (gameMatchResults.get(username)) {
      case (?opponent) {
        let matchId = "game-" # username # "-" # opponent;
        ?{ matchId; opponent };
      };
      case (null) { null };
    };
  };

  // ─── Game Sessions (Real-time synced RPS/TTT for matched strangers) ─────────

  type GameSession = {
    id : Text;
    gameType : Text;
    player1 : Text;
    var player2 : ?Text;
    var status : Text;
    var rpsMove1 : ?Text;
    var rpsMove2 : ?Text;
    var t0 : ?Text; var t1 : ?Text; var t2 : ?Text;
    var t3 : ?Text; var t4 : ?Text; var t5 : ?Text;
    var t6 : ?Text; var t7 : ?Text; var t8 : ?Text;
    var tttTurn : Nat;
    var result : ?Text;
  };

  type GameSessionView = {
    id : Text;
    gameType : Text;
    player1 : Text;
    player2 : ?Text;
    status : Text;
    rpsMove1 : ?Text;
    rpsMove2 : ?Text;
    tttCells : [?Text];
    tttTurn : Nat;
    result : ?Text;
  };

  let gameSessions = Map.empty<Text, GameSession>();

  func makeGameSessionView(g : GameSession) : GameSessionView {
    {
      id = g.id;
      gameType = g.gameType;
      player1 = g.player1;
      player2 = g.player2;
      status = g.status;
      rpsMove1 = g.rpsMove1;
      rpsMove2 = g.rpsMove2;
      tttCells = [g.t0, g.t1, g.t2, g.t3, g.t4, g.t5, g.t6, g.t7, g.t8];
      tttTurn = g.tttTurn;
      result = g.result;
    };
  };

  func getTTTCell(g : GameSession, idx : Nat) : ?Text {
    switch idx {
      case 0 { g.t0 }; case 1 { g.t1 }; case 2 { g.t2 };
      case 3 { g.t3 }; case 4 { g.t4 }; case 5 { g.t5 };
      case 6 { g.t6 }; case 7 { g.t7 }; case 8 { g.t8 };
      case _ { null };
    };
  };

  func setTTTCell(g : GameSession, idx : Nat, mark : Text) {
    switch idx {
      case 0 { g.t0 := ?mark }; case 1 { g.t1 := ?mark }; case 2 { g.t2 := ?mark };
      case 3 { g.t3 := ?mark }; case 4 { g.t4 := ?mark }; case 5 { g.t5 := ?mark };
      case 6 { g.t6 := ?mark }; case 7 { g.t7 := ?mark }; case 8 { g.t8 := ?mark };
      case _ {};
    };
  };

  func lineWins(g : GameSession, a : Nat, b : Nat, c : Nat) : Bool {
    let ca = getTTTCell(g, a);
    let cb = getTTTCell(g, b);
    let cc = getTTTCell(g, c);
    switch (ca, cb, cc) {
      case (?x, ?y, ?z) { x == y and y == z };
      case (_) { false };
    };
  };

  func tttWinner(g : GameSession) : ?Text {
    let lines : [(Nat, Nat, Nat)] = [
      (0,1,2),(3,4,5),(6,7,8),
      (0,3,6),(1,4,7),(2,5,8),
      (0,4,8),(2,4,6)
    ];
    for ((a, b, c) in lines.vals()) {
      if (lineWins(g, a, b, c)) { return getTTTCell(g, a) };
    };
    null
  };

  func isTTTFull(g : GameSession) : Bool {
    g.t0 != null and g.t1 != null and g.t2 != null and
    g.t3 != null and g.t4 != null and g.t5 != null and
    g.t6 != null and g.t7 != null and g.t8 != null
  };

  public shared func createGameSession(sessionId : Text, player1 : Text, gameType : Text) : async Bool {
    if (gameSessions.containsKey(sessionId)) { return false };
    let g : GameSession = {
      id = sessionId;
      gameType;
      player1;
      var player2 = null;
      var status = "waiting";
      var rpsMove1 = null;
      var rpsMove2 = null;
      var t0 = null; var t1 = null; var t2 = null;
      var t3 = null; var t4 = null; var t5 = null;
      var t6 = null; var t7 = null; var t8 = null;
      var tttTurn = 0;
      var result = null;
    };
    gameSessions.add(sessionId, g);
    true
  };

  public shared func joinGameSession(sessionId : Text, player2 : Text) : async Bool {
    switch (gameSessions.get(sessionId)) {
      case (null) { false };
      case (?g) {
        if (g.status == "waiting" and g.player1 != player2) {
          g.player2 := ?player2;
          g.status := "playing";
          true
        } else { false };
      };
    };
  };

  public shared func submitRPSMove(sessionId : Text, username : Text, move : Text) : async () {
    switch (gameSessions.get(sessionId)) {
      case (null) {};
      case (?g) {
        if (g.status != "playing") { return };
        if (username == g.player1 and g.rpsMove1 == null) {
          g.rpsMove1 := ?move;
        } else if (?(username) == g.player2 and g.rpsMove2 == null) {
          g.rpsMove2 := ?move;
        };
        switch (g.rpsMove1, g.rpsMove2) {
          case (?m1, ?m2) {
            let res = if (m1 == m2) { "draw" } else {
              if (
                (m1 == "rock" and m2 == "scissors") or
                (m1 == "scissors" and m2 == "paper") or
                (m1 == "paper" and m2 == "rock")
              ) { "player1wins" } else { "player2wins" };
            };
            g.result := ?res;
            g.status := "done";
          };
          case (_) {};
        };
      };
    };
  };

  public shared func submitTTTMove(sessionId : Text, username : Text, cellIndex : Nat) : async Bool {
    switch (gameSessions.get(sessionId)) {
      case (null) { false };
      case (?g) {
        if (g.status != "playing") { return false };
        let isP1 = username == g.player1;
        let isP2 = ?(username) == g.player2;
        if (not isP1 and not isP2) { return false };
        let myTurn = (isP1 and g.tttTurn == 0) or (isP2 and g.tttTurn == 1);
        if (not myTurn) { return false };
        if (getTTTCell(g, cellIndex) != null) { return false };
        let mark = if (isP1) { "X" } else { "O" };
        setTTTCell(g, cellIndex, mark);
        switch (tttWinner(g)) {
          case (?w) {
            g.result := ?w;
            g.status := "done";
          };
          case (null) {
            if (isTTTFull(g)) {
              g.result := ?"draw";
              g.status := "done";
            } else {
              g.tttTurn := if (g.tttTurn == 0) { 1 } else { 0 };
            };
          };
        };
        true
      };
    };
  };

  public query func getGameSession(sessionId : Text) : async ?GameSessionView {
    switch (gameSessions.get(sessionId)) {
      case (null) { null };
      case (?g) { ?makeGameSessionView(g) };
    };
  };


};
