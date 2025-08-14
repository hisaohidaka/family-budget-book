import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { Category } from "../../types";

interface CategorySelectProps {
  value: Category;
  onChange: (value: Category) => void;
  categories: Category[];
}

export default function CategorySelect({ value, onChange, categories }: CategorySelectProps) {
  return (
    <FormControl size="small">
      <InputLabel>カテゴリ</InputLabel>
      <Select
        value={value}
        label="カテゴリ"
        onChange={e => onChange(e.target.value as Category)}
      >
        {categories.map(c => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
} 