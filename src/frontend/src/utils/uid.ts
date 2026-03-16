export function getOrCreateUID(): string {
  let uid = localStorage.getItem("fl_uid");
  if (!uid) {
    uid = String(Math.floor(10000000 + Math.random() * 90000000));
    localStorage.setItem("fl_uid", uid);
  }
  return uid;
}
