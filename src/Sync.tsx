import React from "react";
import { useSelector, useDispatch } from "react-redux";
import qrcode from "qrcode-generator";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import AddBoxIcon from "@material-ui/icons/AddBox";
import DeleteIcon from "@material-ui/icons/Delete";
import { send, recv, peer } from "./sync";
import { receiveRecipe, removeReceivedRecipe } from "./sync_store";
import { Recipe } from "./types";
import { addRecipe } from "./recipes";
import { resetLocalStore, RootState } from "./store";

export interface SyncProps {
  recipes: Recipe[];
}

export function Sync({ recipes }: SyncProps) {
  const dispatch = useDispatch();
  const syncStore = useSelector((store: RootState) => store.syncStore);
  const url = new URL(window.location.toString());
  const [targetId, setTargetId] = React.useState(
    url.searchParams.get("targetPeer") || ""
  );
  const [selfId, setSelfId] = React.useState("");
  const sendData = () => {
    send(targetId, JSON.stringify(recipes));
  };
  const recvData = async () => {
    const data = (await recv()) as string;
    const recipes = JSON.parse(data);
    recipes.forEach((recipe: Recipe) => {
      dispatch(receiveRecipe(recipe));
    });
  };
  React.useEffect(() => {
    recvData();
  });

  function getCode(): string {
    if (!syncStore.peerid) {
      return "";
    }
    const scanUrl = new URL(url.toString());
    scanUrl.searchParams.set("targetPeer", syncStore.peerid);

    const code = qrcode(0, "M");
    code.addData(scanUrl.toString());
    code.make();
    return code.createDataURL();
  }
  const tag = getCode();

  return (
    <div>
      <TextField
        onChange={(e: any) => setTargetId(e.target.value)}
        onBlur={(e: any) => setTargetId(e.target.value)}
        label="Target ID"
        value={targetId}
      />
      <div>Peer id {syncStore.peerid}</div>
      <Button onClick={sendData}>Send</Button>
      <Button onClick={recvData}>Recv</Button>
      <img src={tag} />
      {false && <Button onClick={resetLocalStore}>Delete everything</Button>}
      <Typography variant="h3">Synced Recipes</Typography>
      <RecipeAdder recipes={syncStore.recipes || []} />
    </div>
  );
}

function RecipeAdder({ recipes }: { recipes: Recipe[] }) {
  const dispatch = useDispatch();
  const saveRecipe = (recipe: Recipe) => {
    dispatch(addRecipe(recipe));
    dispatch(removeReceivedRecipe(recipe.title));
  };
  return (
    <List>
      {recipes.map((recipe: Recipe) => {
        return (
          <ListItem>
            <ListItemText>{recipe.title}</ListItemText>
            <ListItemSecondaryAction>
              <Tooltip title="Keep Recipe">
                <IconButton onClick={() => saveRecipe(recipe)} edge="end">
                  <AddBoxIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Trash Recipe">
                <IconButton
                  onClick={() => dispatch(removeReceivedRecipe(recipe.title))}
                  edge="end"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
}
