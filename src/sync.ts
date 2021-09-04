import Peer, { DataConnection } from "peerjs";
import { setPeerId } from "./sync_store";
import store from "./store";

/**
 Notes: Needs to start listening for connection right away. Doesn't
 care where the connection comes from; all peers will be able to
 connect. Can only send to a known peer.

 Seems to correctly trigger multiple listeners.
*/

const queryParam = "targetPeer";
export function targetPeer(): string | null {
  const url = new URL(window.location.toString());
  return url.searchParams.get(queryParam);
}

export function syncActive(): boolean {
  return process.env.REACT_APP_USE_SYNC === "true" || targetPeer() !== null;
}

export const peer = syncActive() ? new Peer() : undefined;

export function addPeer(url: URL, selfId: string): void {
  url.searchParams.set(queryParam, selfId);
}

peer?.on("open", (id: string) => {
  console.log("got server connection");
  store.dispatch(setPeerId(id));
});

export function waitForData(callback: (data: any) => void) {
  if (!peer) {
    return;
  }
  console.log("waiting for connection");
  peer.on("connection", (conn) => {
    console.log("connection received");
    conn.on("open", () => {
      console.log("conn opened");
      conn.on("data", (data) => {
        console.log("received", data);
        callback(data);
      });
    });
  });
}

export function sendData(targetId: string, data: any) {
  if (!peer) {
    return;
  }
  const conn = peer.connect(targetId);
  conn.on("open", () => {
    conn.send(data);
    console.log("data sent", data);
  });
}
