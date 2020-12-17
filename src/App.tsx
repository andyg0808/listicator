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
  Menu,
  MenuList,
  Order,
  Recipe,
  ShoppingList,
  ShoppingOrder,
  Store,
  TotalOrder,
  Trip,
} from "./types";
import { RootState } from "./store";

import { tripFromMenuList, menuListFromMenu } from "./transforms";

import { groupBy } from "ramda";

const listId = "dragId";

function storeToMenu(recipes: Recipe[]): Menu {
  return {
    recipes,
  };
}

function ListEntry({ name, idx }) {
  return (
    <Draggable draggableId={name} index={idx}>
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

function App() {
  const recipes = useSelector((store: RootState) => store.recipes);
  const menu = storeToMenu(recipes);
  const menuList = menuListFromMenu(menu);
  const trip = tripFromMenuList(menuList);
  console.log(trip);
  return (
    <div className="App">
      <h2>List</h2>
      <ListSorter trip={trip} />
    </div>
  );
}

export default App;
