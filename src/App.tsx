/** @jsxImportSource @emotion/react */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, DropResult } from "react-beautiful-dnd";

import { ReactComponent as Logo } from "./logo.svg";

import "./App.css";

import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";
import MenuIcon from "@material-ui/icons/Menu";

import { styled } from "@material-ui/core/styles";

import { ListSorter } from "./ListSorter";
import { RecipeEditor } from "./AddRecipe";
import { BuildTab } from "./BuildTab";

import * as R from "ramda";

import {
  ShoppingList,
  TotalOrder,
  updateTripLists,
  Recipe,
  Trip,
  getDescription,
  DisplayNumber,
} from "./types";
import { RootState, resetLocalStore, recipeSelector } from "./store";
import { insertItem, reorder, sortByOrder } from "./shopping_order";
import { setStore } from "./store_preference";
import { setStores } from "./store_list";
import { recipesToTrip, multiply } from "./transforms";
import { addRecipe, setRecipe } from "./recipes";

import { Sync } from "./Sync";
import { Editor } from "./editor";
import RecipeList from "./RecipeList";
import { unparse } from "./parser";
import { useDeleteRecipe } from "./undo";
import { ListBuilder } from "./ListBuilder";
import { useSortedTrip } from "./trip";

const ColoredLogo = styled(Logo)(({ theme }) => {
  return {
    "& .border": {
      stroke: theme.palette.secondary.main,
      fillOpacity: 0,
    },
    "& .checkmark": {
      stroke: theme.palette.secondary.main,
    },
  };
});

function App() {
  const [sync, setSync] = React.useState(false);
  const dispatch = useDispatch();

  const stores = useSelector((store: RootState) => store.storeList);

  const [showStoreEditor, setShowStoreEditor] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState(0);
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <div css={{ paddingRight: "20px" }}>
            <ColoredLogo />
          </div>
          <Tabs
            css={{ flexGrow: 1 }}
            value={currentTab}
            onChange={(e: any, newValue: number) => setCurrentTab(newValue)}
          >
            <Tab label="Build" />
            <Tab label="Shop" />
          </Tabs>
          <IconButton
            edge="end"
            onClick={() => setShowStoreEditor(true)}
            aria-label="Set List Items"
            color="secondary"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={showStoreEditor}
        onClose={() => setShowStoreEditor(false)}
      >
        <ListBuilder
          onChange={(e) => dispatch(setStores(e))}
          items={stores.map((s) => s.name)}
        />
      </Drawer>
      <Container>
        {currentTab == 0 && (
          <BuildTab startEdit={() => setShowStoreEditor(true)} />
        )}
        {currentTab == 1 && <ShopTab />}
        {sync && <SyncTools />}
      </Container>
    </>
  );
}

function SyncTools() {
  const allRecipes = useSelector(recipeSelector);
  return <Sync recipes={allRecipes} />;
}

function ShopTab() {
  const sortedTrip = useSortedTrip();
  const stores = useSelector((store: RootState) => store.storeList);
  const storeNames = stores.map((s) => s.name);
  console.log("storeNames", storeNames);
  const [activeName, setActiveName] = React.useState(storeNames[0]);
  const selectedList = sortedTrip.lists.find(
    (list: ShoppingList) => list.store.name === activeName
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
              {s}
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

export default App;
