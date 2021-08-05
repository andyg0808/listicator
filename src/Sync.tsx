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
import { receiveRecipe, removeReceivedRecipe } from "./sync_store";
import { Recipe } from "./types";
import { addRecipe } from "./recipes";
import { resetLocalStore, RootState } from "./store";
import { peer, targetPeer, addPeer, waitForData, sendData } from "./sync";
import { createAction } from "@reduxjs/toolkit";

peer.on("error", (err) => {
  console.error(err);
});

const pingAction = createAction<string>("ping");
const recipeAction = createAction<Recipe[]>("recipe");
const fetchAction = createAction<undefined>("fetch");

export interface SyncProps {
  recipes: Recipe[];
}

export function Sync({ recipes }: SyncProps) {
  const dispatch = useDispatch();
  const syncStore = useSelector((store: RootState) => store.syncStore);
  const selfId = syncStore.peerid;
  const [targetId, setTargetId] = React.useState(targetPeer() || null);

  // Recieve handling
  React.useEffect(() => {
    return waitForData((data) => {
      if (pingAction.match(data)) {
        setTargetId(data.payload);
      } else if (recipeAction.match(data)) {
        data.payload.forEach((recipe: Recipe) => {
          dispatch(receiveRecipe(recipe));
        });
      } else if (fetchAction.match(data)) {
        if (targetId) {
          console.log("sending recipes to peer");
          triggerSend();
        } else {
          console.log("no known target; not sending recipes");
        }
      } else {
        console.error("unknown action", data);
      }
    });
  }, []);

  // Backlink triggering
  //
  //This is the magic that allows any phone which scans the link to
  // trigger the originating peer to be connected to them.
  React.useEffect(() => {
    console.log("trying to activate remote");
    const targetId = targetPeer();
    if (!targetId) {
      console.log("no target, not activating");
      return;
    }
    if (!selfId) {
      console.log("no selfid yet; will try later");
      return;
    }
    sendData(targetId, pingAction(selfId));
  }, [selfId]);

  /**
   * Send the current collection of recipes to the peer
   */
  function triggerSend() {
    console.log("triggered");
    if (targetId === null) {
      console.log("no target id; can't send");
      return;
    }
    sendData(targetId, recipeAction(recipes));
  }

  function triggerFetch() {
    console.log("triggering fetch");
    if (targetId === null) {
      console.log("no target id; can't send");
      return;
    }
    sendData(targetId, fetchAction());
  }

  const scanUrl = new URL(window.location.toString());
  addPeer(scanUrl, selfId || "");
  const tag = selfId ? getCode(selfId, scanUrl) : "";

  return (
    <div>
      <TextField
        onChange={(e: any) => setTargetId(e.target.value)}
        onBlur={(e: any) => setTargetId(e.target.value)}
        label="Target ID"
        value={targetId || ""}
      />
      <div>Peer id {selfId}</div>
      <Button onClick={triggerSend}>Send</Button>
      <Button onClick={triggerFetch}>Fetch</Button>
      <a href={scanUrl.toString()} target="_blank">
        <img src={tag} />
      </a>
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

function getCode(peerid: string, scanUrl: URL): string {
  const code = qrcode(0, "M");
  code.addData(scanUrl.toString());
  code.make();
  return code.createDataURL();
}
