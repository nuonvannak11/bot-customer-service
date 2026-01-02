export function handleSocketEvent(
  event: string,
  payload: any,
  dispatch: Function
) {
  switch (event) {
    case "wallet_update":
      dispatch({ type: "WALLET_UPDATE", payload });
      break;

    case "game_state":
      dispatch({ type: "GAME_STATE", payload });
      break;

    case "round_result":
      dispatch({ type: "ROUND_RESULT", payload });
      break;

    default:
      console.warn("Unhandled socket event:", event);
  }
}
