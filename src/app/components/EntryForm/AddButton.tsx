import React from "react";
import { Button } from "@mui/material";

export default function AddButton({ isEdit }: { isEdit?: boolean }) {
  return (
    <Button type="submit" variant="contained" color="primary">
      {isEdit ? "更新" : "追加"}
    </Button>
  );
} 