/** @jsxImportSource @emotion/react */
import React from "react";
import * as R from "ramda";
import { Draggable, Droppable } from "react-beautiful-dnd";
import {
  Amount,
  ShoppingList,
  Store,
  TotalOrder,
  Trip,
  getDescription,
} from "./types";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import DragIndicatorIcon from "@material-ui/icons/DragIndicator";
import { styled } from "@material-ui/core/styles";

const VisibleList = styled("div")(({ theme }) => {
  const margin = "10px";
  return {
    "border-color": theme.palette.secondary.main,
    "border-width": "3px",
    "border-style": "solid",
    "border-radius": "5px",
    margin,
    padding: "10px",
    width: `calc(50% - 2*${margin})`,
  };
});

interface ListSorterProps {
  trip: Trip;
  stores: Store[];
  onHeaderClick: () => void;
}

export function ListSorter({ trip, stores, onHeaderClick }: ListSorterProps) {
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
          <VisibleList key={store.name}>
            <Typography
              onClick={onHeaderClick}
              color="primary"
              variant="h2"
              css={{ cursor: "pointer" }}
            >
              {list.store.name}
            </Typography>
            <Droppable droppableId={list.store.name} key={list.store.name}>
              {(provided) => (
                <List
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  css={{ height: "100%", minHeight: "50px" }}
                >
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
          </VisibleList>
        );
      })}
    </div>
  );
}

function ListEntry({ item, idx }: { item: TotalOrder; idx: number }) {
  const description = getDescription(item);
  const name = item.ingredient.name;
  return (
    <Draggable draggableId={name} index={idx}>
      {(provided) => (
        <ListItem
          ref={provided.innerRef}
          //button
          //disableTouchRipple={true}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ListItemIcon css={{ minWidth: "28px" }}>
            <DragIndicatorIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{description}</ListItemText>
        </ListItem>
      )}
    </Draggable>
  );
}
