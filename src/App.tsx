import React from "react";
import { useSelector } from "react-redux";

import logo from "./logo.svg";
import "./App.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { Draggable, Droppable } from "react-beautiful-dnd";

import {
  Ingredient,
  Store,
  ShoppingOrder,
  ShoppingList,
  Order,
  Trip,
  MenuList,
} from "./types";
import { RootState } from "./store";

import { groupBy } from "ramda";

const listId = "dragId";

function ListEntry({ name, idx }) {
  return (
    <Draggable draggableId={`${name}-${idx}`} index={idx}>
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          button
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {name}
        </ListItem>
      )}
    </Draggable>
  );
}

function ListSorter({ trip }: { trip: Trip }) {
  return (
    <React.Fragment>
      {trip.lists.map((list: ShoppingList) => {
        return (
          <Droppable droppableId={list.store.name}>
            {(provided, snapshot) => (
              <List ref={provided.innerRef} {...provided.droppableProps}>
                {list.items.map((item, idx) => {
                  return <ListEntry name={item.ingredient.name} idx={idx} />;
                })}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        );
      })}
    </React.Fragment>
  );
}

function tripFromMenuList(menuList: MenuList): Trip {
  const stores: { [index: string]: Array<Order> } = groupBy(
    (item) => "Trader Joe's",
    menuList.items
  );
  const store: Store = { name: "Trader Joe's", item_order: [] };
  const lists: Array<ShoppingList> = Object.entries(stores).map(
    ([storeid, items]: [string, Array<Order>]): ShoppingList => {
      return {
        items: items,
        store: store,
      };
    }
  );

  return {
    lists,
  };
}

function App() {
  const menuList = useSelector((store: RootState) => store.menu_list);
  const trip = tripFromMenuList(menuList);
  console.log(trip);
  return (
    <div className="App">
      <ListSorter trip={trip} />
    </div>
  );
}

export default App;
