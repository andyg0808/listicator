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
  TotalOrder,
  Order,
  Trip,
  MenuList,
  Menu,
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
  const stores: { [index: string]: Array<TotalOrder> } = groupBy(
    (item) => "Trader Joe's",
    menuList.items
  );
  const store: Store = { name: "Trader Joe's" };
  const lists: Array<ShoppingList> = Object.entries(stores).map(
    ([storeid, items]: [string, Array<TotalOrder>]): ShoppingList => {
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

function menuListFromMenu(menu: Menu): MenuList {
  /* const items = menu.recipes.flatMap((recipe) => recipe.ingredients); */
  /* const totalItems = groupBy((order) => order.ingredient.name, items); */
  return {
    items: [],
  };
}

function App() {
  /* const menus = useSelector((store: RootState) => store.menus); */
  /* const menuList = menuListFromMenu(menus); */
  /* const trip = tripFromMenuList(menuList); */
  /* console.log(trip); */
  /* return ( */
  /*   <div className="App"> */
  /*     <ListSorter trip={trip} /> */
  /*   </div> */
  /* ); */
}

export default App;
