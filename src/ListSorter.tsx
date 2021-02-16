/** @jsxImportSource @emotion/react */
import React from "react";
import * as R from "ramda";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Amount, ShoppingList, Store, TotalOrder, Trip } from "./types";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";

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
          <div css={{ width: "50%" }} key={store.name}>
            <Typography color="primary" variant="h2">
              {list.store.name}
            </Typography>
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
          <ListItemIcon css={{ minWidth: "28px" }}>
            <DragIndicatorIcon fontSize="small" />
          </ListItemIcon>
          {amount} {name}
        </ListItem>
      )}
    </Draggable>
  );
}
