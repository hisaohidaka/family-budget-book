import React from "react";
import { TableRow, TableCell, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Entry } from "../../types";

interface EntryTableRowProps {
  entry: Entry;
  onDelete: (id: string) => void;
  onEdit: (entry: Entry) => void;
}

export default function EntryTableRow({ entry, onDelete, onEdit }: EntryTableRowProps) {
  return (
    <TableRow>
      <TableCell>{entry.date}</TableCell>
      <TableCell>{entry.category}</TableCell>
      <TableCell>{entry.amount.toLocaleString()}</TableCell>
      <TableCell>{entry.memo}</TableCell>
      <TableCell>{entry.payer}</TableCell>
      <TableCell>
        <IconButton size="small" onClick={() => onEdit(entry)} aria-label="編集">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(entry.id)} aria-label="削除" color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
} 