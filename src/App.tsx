/** @jsxImportSource @emotion/react */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";

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

import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";

import { ListSorter } from "./ListSorter";
import { RecipeEditor } from "./AddRecipe";

import * as R from "ramda";

import { ShoppingList, TotalOrder, updateTripLists, Recipe } from "./types";
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

function App() {
  const [sync, setSync] = React.useState(false);
  const dispatch = useDispatch();

  const stores = useSelector((store: RootState) => store.storeList);

  const [showStoreEditor, setShowStoreEditor] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState(0);
  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setShowStoreEditor(true)}
            aria-label="Set List Items"
            color="secondary"
          >
            <ViewListIcon />
          </IconButton>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
          >
            <Tab label="Build" />
            <Tab label="Shop" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container>
        <Drawer
          anchor="left"
          open={showStoreEditor}
          onClose={() => setShowStoreEditor(false)}
        >
          <ListBuilder
            onChange={(e) => dispatch(setStores(e))}
            items={stores.map((s) => s.name)}
          />
        </Drawer>
        {currentTab == 0 && <BuildTab />}
        {sync && <SyncTools />}
      </Container>
    </>
  );
}

function SyncTools() {
  const allRecipes = useSelector(recipeSelector);
  return <Sync recipes={allRecipes} />;
}

function BuildTab() {
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

export default App;
