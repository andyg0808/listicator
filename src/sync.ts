import Peer, { DataConnection } from "peerjs";
import { setPeerId } from "./sync_store";
import store from "./store";

/**
 Notes: Needs to start listening for connection right away. Doesn't
 care where the connection comes from; all peers will be able to
 connect. Can only send to a known peer.

 Seems to correctly trigger multiple listeners.
*/

export const peer = new Peer();

export function targetPeer(): string | null {
  const url = new URL(window.location.toString());
  return url.searchParams.get("targetPeer");
}

peer.on("open", (id: string) => {
  console.log("got server connection");
  store.dispatch(setPeerId(id));
});

export function waitForData(callback: (data: any) => void) {
  let c: DataConnection | null = null;
  console.log("waiting for connection");
  peer.on("connection", (conn) => {
    console.log("connection received");

    conn.on("open", () => {
      c = conn;
      console.log("conn opened");
      conn.on("data", (data) => {
        console.log("received", data);
        callback(data);
      });
    });
  });
  return () => {
    console.log("trying to clean up");
    if (c) {
      console.log("cleaning up");
      c.close();
    }
  };
}

export function sendData(targetId: string, data: any) {
  const conn = peer.connect(targetId);
  conn.on("open", () => {
    conn.send(data);
    console.log("data sent", data);
  });
}
