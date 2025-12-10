export type KeysActionState = {
  status: "idle" | "ok" | "error";
  message?: string;
  token?: string;
};
