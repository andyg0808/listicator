/** @jsxImportSource @emotion/react */
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { useSortedTrip } from "./trip";
import { getDescription, ShoppingList, TotalOrder } from "./types";

export function ShopTab() {
  const sortedTrip = useSortedTrip();
  const stores = useSelector((store: RootState) => store.storeList);
  const storeNames = stores.map((s) => s.name);
  console.log("storeNames", storeNames);
  const [activeName, setActiveName] = React.useState(storeNames[0]);
  const selectedList = sortedTrip.lists.find(
    (list: ShoppingList) => list.store.name === activeName
  );
  const undecidedList = sortedTrip.lists.find(
    (list: ShoppingList) => list.store.name === "Undecided"
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
              <Typography variant="h2">{s}</Typography>
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
      {undecidedList && (
        <>
          <Typography variant="h2">Undecided</Typography>
          <List>
            {undecidedList.items.map((order: TotalOrder) => (
              <ShoppingListItem key={order.ingredient.name} order={order} />
            ))}
          </List>
        </>
      )}
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
