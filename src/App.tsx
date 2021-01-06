import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";

import styled from "@emotion/styled";

import "./App.css";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import { Draggable, Droppable } from "react-beautiful-dnd";
import * as R from "ramda";

import {
  Amount,
  ShoppingList,
  Store,
  TotalOrder,
  Trip,
  updateTripLists,
  Recipe,
} from "./types";
import { RootState, resetLocalStore } from "./store";
import { insertItem, reorder, save, sortByOrder } from "./shopping_order";
import { setStore } from "./store_preference";
import { recipesToTrip } from "./transforms";
import { send, recv } from "./sync";
import { addRecipe, setRecipe } from "./recipes";

import { Editor } from "./editor";
import RecipeList from "./RecipeList";
import { unparse } from "./parser";

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
      {(provided, snapshot) => (
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

const ListViewer = styled.div`
  display: flex;
`;

function ListSorter({ trip, stores }: { trip: Trip; stores: Store[] }) {
  const storeList = R.union(
    stores,
    trip.lists.map((l) => l.store)
  );
  const indexedLists = R.indexBy((l) => l.store.name, trip.lists);
  return (
    <ListViewer>
      {storeList.map((store: Store) => {
        const list: ShoppingList = indexedLists[store.name] || {
          items: [],
          store,
        };
        return (
          <div key={store.name}>
            <h3>{list.store.name}</h3>
            <Droppable droppableId={list.store.name} key={list.store.name}>
              {(provided, snapshot) => (
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
    </ListViewer>
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
      <pre>{text}</pre>
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

  const [targetId, setTargetId] = React.useState("");
  const sendData = () => {
    send(targetId, JSON.stringify(allRecipes));
  };
  const recvData = async () => {
    const data = (await recv()) as string;
    console.log("data", data);
    const recipes = JSON.parse(data);
    console.log("recipes", recipes);
    recipes.forEach((recipe) => {
      console.log("recipe", recipe);
      dispatch(addRecipe(recipe));
    });
  };
  React.useEffect(() => {
    recvData();
  });
  const [editing, startEditing] = React.useState<Recipe | null>(null);
  return (
    <DragDispatcher trip={sortedTrip}>
      <div className="App">
        <RecipeAdder />
        <RecipeList />
        <h2>Unparse</h2>
        {editing && (
          <Unparse
            recipe={editing}
            onSave={(a: Recipe) => a && dispatch(setRecipe(a))}
          />
        )}
        <Button onClick={() => startEditing(recipes[0])}>Start editing</Button>
        <h2>List</h2>
        <ListSorter stores={stores} trip={sortedTrip} />
        <TextField
          onChange={(e) => setTargetId(e.target.value)}
          onBlur={(e) => setTargetId(e.target.value)}
          label="Target ID"
          value={targetId}
        />
        <Button onClick={sendData}>Send</Button>
        <Button onClick={recvData}>Recv</Button>
        <Button onClick={resetLocalStore}>Delete everything</Button>
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
