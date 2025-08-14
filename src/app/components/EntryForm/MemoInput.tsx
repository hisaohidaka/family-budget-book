import React from "react";
import { TextField } from "@mui/material";

interface MemoInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MemoInput({ value, onChange }: MemoInputProps) {
  return (
    <TextField
      label="メモ"
      value={value}
      onChange={e => onChange(e.target.value)}
      size="small"
    />
  );
} 