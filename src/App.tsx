import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";

import logo from "./logo.svg";
import "./App.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { Draggable, Droppable } from "react-beautiful-dnd";
import * as R from "ramda";

import {
  Menu,
  MenuList,
  Order,
  Recipe,
  ShoppingList,
  Store,
  TotalOrder,
  Trip,
  updateTripLists,
} from "./types";
import { RootState } from "./store";

import {
  reorder,
  ReorderEvent,
  save,
  SaveEvent,
  sortByOrder,
} from "./shopping_order";

import { recipesToTrip } from "./transforms";

import { groupBy } from "ramda";

const listId = "dragId";

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
          <>
            <h3>{list.store.name}</h3>
            <Droppable droppableId={list.store.name} key={list.store.name}>
              {(provided, snapshot) => (
                <List ref={provided.innerRef} {...provided.droppableProps}>
                  {list.items.map((item, idx) => {
                    return (
                      <ListEntry
                        name={item.ingredient.name}
                        key={item.ingredient.name}
                        idx={idx}
                      />
                    );
                  })}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </>
        );
      })}
    </React.Fragment>
  );
}

function DragDispatcher({ children, trip }) {
  const dispatch = useDispatch();
  const sortOrder = useSelector((store: RootState) => store.shoppingOrder);
  const listIndex = Object.fromEntries(
    trip.lists.map((l: ShoppingList) => [l.store.name, l])
  );

  function dragHandler(result, provided) {
    console.log("drag result", result, provided);
    const { source, destination } = result;
    const store = destination.droppableId;
    const fromIdx = source.index;
    const toIdx = destination.index;
    const list: ShoppingList = listIndex[store];
    const items: TotalOrder[] = list.items;
    console.log(store);
    console.log(fromIdx, list.items[fromIdx]);
    const startOrder = dispatch(
      reorder({
        name: result.draggableId,
        store,
        fromIdx,
        toIdx,
        displayOrder: items.map((o) => o.ingredient.name),
      })
    );
  }

  return <DragDropContext onDragEnd={dragHandler}>{children}</DragDropContext>;
}

function App() {
  const trip = useSelector((store: RootState) => recipesToTrip(store.recipes));
  const sortOrder = useSelector((store: RootState) => store.shoppingOrder);
  const sortedTrip = updateTripLists(
    R.map((i: ShoppingList) => sortByOrder(sortOrder, i)),
    trip
  );
  const dispatch = useDispatch();
  React.useEffect(() => {
    sortedTrip.lists.forEach((list: ShoppingList) => {
      dispatch(
        save({
          store: list.store.name,
          displayOrder: list.items.map((order) => order.ingredient.name),
        })
      );
    });
  }, [trip]);
  console.log("Sorted", sortedTrip);
  return (
    <DragDispatcher trip={sortedTrip}>
      <div className="App">
        <h2>List</h2>
        <ListSorter trip={sortedTrip} />
      </div>
    </DragDispatcher>
  );
}

export default App;
