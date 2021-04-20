import Peer from "peerjs";
import { setPeerId } from "./sync_store";
import store from "./store";

export const peer = new Peer();
peer.on("open", (id) => {
  store.dispatch(setPeerId(id));
  // console.log("My peer id:", id);
});
export function send(id: any, blob: any) {
  const conn = peer.connect(id);
  conn.on("open", () => {
    conn.send(blob);
  });
}

export function recv() {
  return new Promise((res, rej) => {
    peer.on("connection", (conn) => {
      conn.on("data", (data) => {
        res(data);
      });
    });
  });
}

export function getConnection(id: any) {
  return new Promise((res, rej) => {
    const conn = peer.connect(id);
    conn.on("error", rej);
    conn.on("open", () => res(conn));
  });
}

export function recvConnection() {
  return new Promise((res, rej) => {
    peer.on("connection", (conn) => res(conn));
  });
}
