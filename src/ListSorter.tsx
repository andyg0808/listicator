/** @jsxImportSource @emotion/react */
import React from "react";
import * as R from "ramda";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Amount, ShoppingList, Store, TotalOrder, Trip } from "./types";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

export function ListSorter({ trip, stores }: { trip: Trip; stores: Store[] }) {
  const storeList = R.union(
    stores,
    trip.lists.map((l) => l.store)
  );
  const indexedLists = R.indexBy((l) => l.store.name, trip.lists);
  return (
    <div
      css={{
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      {storeList.map((store: Store) => {
        const list: ShoppingList = indexedLists[store.name] || {
          items: [],
          store,
        };
        return (
          <div css={{ width: "45vw" }} key={store.name}>
            <h3>{list.store.name}</h3>
            <Droppable droppableId={list.store.name} key={list.store.name}>
              {(provided) => (
                <List ref={provided.innerRef} {...provided.droppableProps}>
                  {list.items.map((item, idx) => {
                    return (
                      <ListEntry
                        item={item}
                        key={item.ingredient.name}
                        idx={idx}
                      />
                    );
                  })}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </div>
        );
      })}
    </div>
  );
}

function ListEntry({ item, idx }: { item: TotalOrder; idx: number }) {
  const amount = item.amount
    .map((a: Amount) => {
      const unit =
        a.quantity && a.quantity > 1 && a.unit !== null
          ? a.unit + "s"
          : a.unit || "";
      return `${a.quantity || ""} ${unit}`;
    })
    .join(" & ");
  const name = item.ingredient.name;
  return (
    <Draggable draggableId={name} index={idx}>
      {(provided) => (
        <ListItem
          ref={provided.innerRef}
          button
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {amount} {name}
        </ListItem>
      )}
    </Draggable>
  );
}
