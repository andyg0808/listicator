import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";

import "./App.css";

import Button from "@material-ui/core/Button";

import { ListSorter } from "./ListSorter";

import * as R from "ramda";

import { ShoppingList, TotalOrder, updateTripLists, Recipe } from "./types";
import { RootState, resetLocalStore } from "./store";
import { insertItem, reorder, save, sortByOrder } from "./shopping_order";
import { setStore } from "./store_preference";
import { recipesToTrip } from "./transforms";
import { addRecipe, setRecipe, deleteRecipe } from "./recipes";

import { Sync } from "./Sync";
import { Editor } from "./editor";
import RecipeList from "./RecipeList";
import { unparse } from "./parser";

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

interface UnparseProps {
  recipe: Recipe;
  onSave: (r: Recipe) => void;
}

function Unparse({ recipe, onSave }: UnparseProps) {
  const text = unparse(recipe.ingredients);
  const [blob, setBlob] = React.useState({
    text,
    title: recipe.title,
    ingredients: recipe.ingredients,
  });
  return (
    <div>
      <Editor
        onUpdate={setBlob}
        defaultText={text}
        defaultTitle={recipe.title}
      />
      <Button onClick={() => onSave(blob)}>Save</Button>
    </div>
  );
}

function App() {
  const allRecipes = useSelector((store: RootState) => store.recipes);
  const selected = useSelector((store: RootState) => store.menuSelections);
  const recipes = React.useMemo(
    () => allRecipes.filter((r) => selected[r.title]),
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

  const [editing, startEditing] = React.useState<Recipe | null>(null);
  return (
    <DragDispatcher trip={sortedTrip}>
      <div className="App">
        <RecipeAdder />
        <RecipeList
          onEdit={startEditing}
          onDelete={(a) => a && dispatch(deleteRecipe(a))}
        />
        <h2>Unparse</h2>
        {editing && (
          <Unparse
            recipe={editing}
            onSave={(a: Recipe) => a && dispatch(setRecipe(a))}
          />
        )}
        <h2>List</h2>
        <ListSorter stores={stores} trip={sortedTrip} />
        <Sync recipes={allRecipes} />
      </div>
    </DragDispatcher>
  );
}

function RecipeAdder() {
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const dispatch = useDispatch();
  return (
    <>
      <Editor onUpdate={setRecipe} defaultTitle="" defaultText="" />
      <Button onClick={() => recipe && dispatch(addRecipe(recipe))}>
        Store
      </Button>
    </>
  );
}

export default App;
