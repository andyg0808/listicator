import Peer from "peerjs";

export const peer = new Peer();
peer.on("open", (id) => {
  console.log("My peer id:", id);
});
export function send(id, blob) {
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

export function getConnection(id) {
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
