/** @jsxImportSource @emotion/react */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";

import { ReactComponent as Logo } from "./logo.svg";

import "./App.css";

import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import Fab from "@material-ui/core/Fab";
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

import * as R from "ramda";

import {
  ShoppingList,
  TotalOrder,
  updateTripLists,
  Recipe,
  Trip,
  getDescription,
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

function DragDispatcher({ children, trip }) {
  const dispatch = useDispatch();
  const listIndex = R.indexBy((l: ShoppingList) => l.store.name, trip.lists);

  function dragHandler(result) {
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
            onChange={(e, newValue) => setCurrentTab(newValue)}
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
        {currentTab == 0 && <BuildTab />}
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

function useSortedTrip(): Trip {
  const allRecipes = useSelector(recipeSelector);
  const selected = useSelector((store: RootState) => store.menuSelections);
  const quantities = useSelector((store: RootState) => store.menuQuantities);
  const stores = useSelector((store: RootState) => store.storeList);
  const recipes = React.useMemo(
    () => multiply(quantities, allRecipes).filter((r) => selected[r.title]),
    [allRecipes, selected, quantities]
  );
  const storePreference = useSelector(
    (store: RootState) => store.storePreference
  );
  const trip = recipesToTrip(
    recipes,
    storePreference,
    "Undecided",
    new Set(stores.map((s) => s.name))
  );
  const sortOrder = useSelector((store: RootState) => store.shoppingOrder);
  const sortedTrip = updateTripLists(
    R.map((i: ShoppingList) => sortByOrder(sortOrder, i)),
    trip
  );
  return sortedTrip;
}

function BuildTab() {
  const sortedTrip = useSortedTrip();
  const stores = useSelector((store: RootState) => store.storeList);

  const dispatch = useDispatch();

  const [editing, startEditing] = React.useState<Recipe | null>(null);
  const closeEditor = () => startEditing(null);
  const saveHandler = (a: Recipe) => {
    if (a) {
      dispatch(setRecipe(a));
    }
    closeEditor();
  };
  const startRecipe = () =>
    startEditing({
      title: "",
      ingredients: [],
    });

  const onDeleteRecipe = useDeleteRecipe();
  return (
    <DragDispatcher trip={sortedTrip}>
      <div>
        <RecipeList onEdit={startEditing} onDelete={onDeleteRecipe} />
        <Drawer anchor="bottom" open={Boolean(editing)} onClose={closeEditor}>
          {editing && (
            <RecipeEditor
              recipe={editing}
              onSave={saveHandler}
              onCancel={closeEditor}
            />
          )}
        </Drawer>
        <Fab
          color="primary"
          onClick={startRecipe}
          css={{ position: "fixed", bottom: "15px", right: "15px", zIndex: 10 }}
        >
          <AddIcon />
        </Fab>
        <ListSorter stores={stores} trip={sortedTrip} />
      </div>
    </DragDispatcher>
  );
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
  const toggle = (evt) => setChecked((c) => !c);
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
