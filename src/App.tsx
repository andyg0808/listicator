import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";

import "./App.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import { Draggable, Droppable } from "react-beautiful-dnd";
import * as R from "ramda";

import {
  ShoppingList,
  Store,
  TotalOrder,
  Trip,
  updateTripLists,
} from "./types";
import { RootState } from "./store";

import { insertItem, reorder, save, sortByOrder } from "./shopping_order";

import { setStore } from "./store_preference";

import { recipesToTrip } from "./transforms";

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

function ListSorter({ trip, stores }: { trip: Trip; stores: Store[] }) {
  const storeList = R.union(
    stores,
    trip.lists.map((l) => l.store)
  );
  const indexedLists = R.indexBy((l) => l.store.name, trip.lists);
  return (
    <React.Fragment>
      {storeList.map((store: Store) => {
        const list: ShoppingList = indexedLists[store.name] || {
          items: [],
          store,
        };
        return (
          <React.Fragment key={store.name}>
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
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
}

function DragDispatcher({ children, trip }) {
  const dispatch = useDispatch();
  const listIndex = R.indexBy((l: ShoppingList) => l.store.name, trip.lists);

  function dragHandler(result, provided) {
    console.log("drag result", result, provided);
    const { source, destination } = result;
    if (destination === null) {
      return;
    }
    const store = destination.droppableId;
    const fromIdx = source.index;
    const toIdx = destination.index;
    const list: ShoppingList | undefined = listIndex[store];
    const items: TotalOrder[] = list?.items || [];
    const displayOrder = items.map((o) => o.ingredient.name);
    if (source.droppableId === destination.droppableId) {
      if (toIdx < 0) {
        console.log("Moved to negative position", result);
      }
      dispatch(
        reorder({
          name: result.draggableId,
          store,
          fromIdx,
          toIdx,
          displayOrder,
        })
      );
    } else {
      dispatch(
        insertItem({
          name: result.draggableId,
          store,
          atIdx: toIdx,
          displayOrder,
        })
      );
      dispatch(
        setStore({
          item: result.draggableId,
          store,
        })
      );
    }
  }

  return <DragDropContext onDragEnd={dragHandler}>{children}</DragDropContext>;
}

function App() {
  const allRecipes = useSelector((store: RootState) => store.recipes);
  const selected = useSelector((store: RootState) => store.menuSelections);
  const recipes = React.useMemo(
    () => allRecipes.filter((r) => selected["title"]),
    [allRecipes, selected]
  );
  const storePreference = useSelector(
    (store: RootState) => store.storePreference
  );
  const trip = recipesToTrip(recipes, storePreference);
  const stores = ["Trader Joe's", "Costco", "Food 4 Less"].map((store) => {
    return { name: store };
  });
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
  }, [recipes]);
  console.log("Sorted", sortedTrip);
  return (
    <DragDispatcher trip={sortedTrip}>
      <div className="App">
        <h2>List</h2>
        <ListSorter stores={stores} trip={sortedTrip} />
      </div>
    </DragDispatcher>
  );
}

export default App;
