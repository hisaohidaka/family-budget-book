import React from "react";
import { TextField } from "@mui/material";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <TextField
      label="金額"
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      required
      size="small"
      inputProps={{ min: 0 }}
    />
  );
} 