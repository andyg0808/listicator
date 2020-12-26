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
import * as T from "./types";

import {
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
import { RootState, reorder, ReorderEvent } from "./store";

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
  const sortListItems = (l: ShoppingList): ShoppingList => {
    const storeOrder = sortOrder[l.store.name];
    // If no information is available about the ordering for the
    // store, we can't usefully sort at all.
    if (!storeOrder) {
      return l;
    }
    const [positioned, remaining] = R.partition(
      (i) => R.has(i.ingredient.name, storeOrder),
      l.items
    );
    const sortedPositioned = R.sortBy(
      (i: TotalOrder) => storeOrder[i.ingredient.name],
      positioned
    );
    function merge(
      idx: number,
      positioned: TotalOrder[],
      remaining: TotalOrder[]
    ): TotalOrder[] {
      if (positioned.length == 0) {
        return remaining;
      } else if (remaining.length == 0) {
        return positioned;
      }

      const name = T.getIngredientName(positioned[0]);
      const position = storeOrder[name];

      if (idx == position) {
        return R.append(
          positioned[0],
          merge(idx + 1, positioned.slice(1), remaining)
        );
      } else {
        return R.append(
          remaining[0],
          merge(idx + 1, positioned, remaining.slice(1))
        );
      }
    }
    const sorted = merge(0, sortedPositioned, remaining);
    return R.assoc("items", sorted, l);
  };
  const updateTrip = (t) => T.updateTripLists(R.map(sortListItems), t);
  const sortedTrip = updateTrip(trip);
  console.log("Sorted", sortedTrip);
  return (
    <DragDispatcher trip={trip}>
      <div className="App">
        <h2>List</h2>
        <ListSorter trip={sortedTrip} />
      </div>
    </DragDispatcher>
  );
}

export default App;
