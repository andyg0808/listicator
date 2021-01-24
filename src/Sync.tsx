import React from "react";
import { useSelector, useDispatch } from "react-redux";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { send, recv, peer } from "./sync";
import { Recipe } from "./types";
import { addRecipe } from "./recipes";
import { resetLocalStore, RootState } from "./store";

export interface SyncProps {
  recipes: Recipe[];
}

export function Sync({ recipes }: SyncProps) {
  const dispatch = useDispatch();
  const syncStore = useSelector((store: RootState) => store.syncStore);
  const [targetId, setTargetId] = React.useState("");
  const [selfId, setSelfId] = React.useState("");
  const sendData = () => {
    send(targetId, JSON.stringify(recipes));
  };
  const recvData = async () => {
    const data = (await recv()) as string;
    // console.log("data", data);
    const recipes = JSON.parse(data);
    // console.log("recipes", recipes);
    recipes.forEach((recipe) => {
      // console.log("recipe", recipe);
      dispatch(addRecipe(recipe));
    });
  };
  React.useEffect(() => {
    recvData();
  });

  return (
    <div>
      <TextField
        onChange={(e) => setTargetId(e.target.value)}
        onBlur={(e) => setTargetId(e.target.value)}
        label="Target ID"
        value={targetId}
      />
      <div>Peer id {syncStore.peerid}</div>
      <Button onClick={sendData}>Send</Button>
      <Button onClick={recvData}>Recv</Button>
      <Button onClick={resetLocalStore}>Delete everything</Button>
    </div>
  );
}
