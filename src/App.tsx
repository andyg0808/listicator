/** @jsxImportSource @emotion/react */
import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { ReactComponent as Logo } from "./logo.svg";

import "./App.css";

import Drawer from "@material-ui/core/Drawer";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import { RootState, recipeSelector } from "./store";
import { styled } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import RemoveShoppingCartIcon from "@material-ui/icons/RemoveShoppingCart";

import { ListBuilder } from "./ListBuilder";
import { setStores } from "./store_list";
import { newList } from "./new_list";
import { BuildTab } from "./BuildTab";
import { ShopTab } from "./ShopTab";
import { ConversionTab } from "./ConversionTab";
import { Sync } from "./Sync";
import { syncActive } from "./sync";

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
            <Tab label="Conversion" />
          </Tabs>
          <Tooltip title="Clear checkmarks">
            <IconButton
              data-test="Clear checkmarks"
              edge="end"
              onClick={() => dispatch(newList())}
              color="secondary"
            >
              <RemoveShoppingCartIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Configure Stores">
            <IconButton
              data-test="Configure Stores"
              edge="end"
              onClick={() => setShowStoreEditor(true)}
              color="secondary"
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
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
        {currentTab === 0 && (
          <>
            <BuildTab startEdit={() => setShowStoreEditor(true)} />
            {syncActive() && <SyncTools />}
          </>
        )}
        {currentTab === 1 && <ShopTab />}
        {currentTab === 2 && <ConversionTab />}
      </Container>
      <a href="./ThirdPartyNotices.txt">Credits</a>
      <a href="./licenses/index.html">Third-party License Texts</a>
    </>
  );
}

function SyncTools() {
  const allRecipes = useSelector(recipeSelector);
  return <Sync recipes={allRecipes} />;
}

export default App;
