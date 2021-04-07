import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import { ActionCreators } from "redux-undo";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";

import { Recipe } from "./types";
import { deleteRecipe } from "./recipes";

export function useDeleteRecipe() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const undo = (key: any) => {
    dispatch(ActionCreators.undo());
    closeSnackbar(key);
  };
  return (recipe: Recipe) => {
    if (recipe) {
      dispatch(deleteRecipe(recipe));
      const key = enqueueSnackbar(`Deleted ${recipe.title}`, {
        action: (
          <Button size="small" color="inherit" onClick={() => undo(key)}>
            Undo
          </Button>
        ),
      });
    }
  };
}
