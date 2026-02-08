type WalletUpdatePayload = {
  balance: number;
};

type GameStatePayload = {
  state: string;
  players: number;
};

type RoundResultPayload = {
  winner: string;
  amount: number;
};

type AppAction =
  | { type: "WALLET_UPDATE"; payload: WalletUpdatePayload }
  | { type: "GAME_STATE"; payload: GameStatePayload }
  | { type: "ROUND_RESULT"; payload: RoundResultPayload };

type AppDispatch = (action: AppAction) => void;

type SocketEvent =
  | { event: "wallet_update"; payload: WalletUpdatePayload }
  | { event: "game_state"; payload: GameStatePayload }
  | { event: "round_result"; payload: RoundResultPayload };

export function handleSocketEvent(socketEvent: SocketEvent, dispatch: AppDispatch) {
  switch (socketEvent.event) {
    case "wallet_update":
      dispatch({ type: "WALLET_UPDATE", payload: socketEvent.payload });
      break;
      
    case "game_state":
      dispatch({ type: "GAME_STATE", payload: socketEvent.payload });
      break;

    case "round_result":
      dispatch({ type: "ROUND_RESULT", payload: socketEvent.payload });
      break;

    default:
      console.warn("Unhandled socket event:", socketEvent);
  }
}

