import type { Span } from "src/pos.js";

export type BasicTypeName =
  | "Unit"
  | "Bool"
  | "Int"
  | "Float"
  | "String"
  | "Bytes"
  | "Uuid"
  | "DateTime";
export interface BasicType {
  kind: "BasicType";
  name: BasicTypeName;
  span: Span;
}
