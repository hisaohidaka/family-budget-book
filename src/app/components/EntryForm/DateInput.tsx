import React from "react";
import { TextField } from "@mui/material";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateInput({ value, onChange }: DateInputProps) {
  return (
    <TextField
      label="日付"
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      required
      size="small"
    />
  );
} 