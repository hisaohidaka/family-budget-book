import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { Payer } from "../../types";

interface PayerSelectProps {
  value: Payer;
  onChange: (value: Payer) => void;
  payers: Payer[];
}

export default function PayerSelect({ value, onChange, payers }: PayerSelectProps) {
  return (
    <FormControl size="small">
      <InputLabel>支払者</InputLabel>
      <Select
        value={value}
        label="支払者"
        onChange={e => onChange(e.target.value as Payer)}
      >
        {payers.map(p => (
          <MenuItem key={p} value={p}>{p}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
} 