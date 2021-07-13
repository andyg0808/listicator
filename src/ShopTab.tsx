/** @jsxImportSource @emotion/react */
import React from "react";
import { useSortedTrip } from "./trip";
import { useSelector } from "react-redux";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";

import { ListSorter } from "./ListSorter";
import { RecipeEditor } from "./AddRecipe";

import {
  ShoppingList,
  TotalOrder,
  updateTripLists,
  Recipe,
  Trip,
  getDescription,
  DisplayNumber,
} from "./types";
import * as R from "ramda";
import { RootState, resetLocalStore, recipeSelector } from "./store";
import { insertItem, reorder, sortByOrder } from "./shopping_order";
import { recipesToTrip, multiply } from "./transforms";
import { addRecipe, setRecipe } from "./recipes";

import RecipeList from "./RecipeList";
import { unparse } from "./parser";
import { useDeleteRecipe } from "./undo";

export function ShopTab() {
  const sortedTrip = useSortedTrip();
  const stores = useSelector((store: RootState) => store.storeList);
  const storeNames = stores.map((s) => s.name);
  console.log("storeNames", storeNames);
  const [activeName, setActiveName] = React.useState(storeNames[0]);
  const selectedList = sortedTrip.lists.find(
    (list: ShoppingList) => list.store.name === activeName
  );
  return (
    <div css={{ maxWidth: "500px", margin: "auto", paddingTop: "30px" }}>
      <FormControl css={{ width: "100%" }}>
        <InputLabel>Store</InputLabel>
        <Select
          value={activeName}
          onChange={(e) => setActiveName(e.target.value as string)}
        >
          {storeNames.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <List>
        {selectedList &&
          selectedList.items.map((order: TotalOrder) => (
            <ShoppingListItem key={order.ingredient.name} order={order} />
          ))}
      </List>
    </div>
  );
}

function ShoppingListItem({ order }: { order: TotalOrder }) {
  const [checked, setChecked] = React.useState(false);
  const toggle = (evt: any) => setChecked((c) => !c);
  return (
    <ListItem>
      <ListItemIcon>
        <Checkbox checked={checked} onChange={toggle} />
      </ListItemIcon>
      <ListItemText css={{ cursor: "pointer" }} onClick={toggle}>
        {getDescription(order)}
      </ListItemText>
    </ListItem>
  );
}
