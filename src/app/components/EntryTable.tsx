"use client";
import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import type { Entry } from "../types";
import EntryTableRow from "./EntryTable/EntryTableRow";

interface EntryTableProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onEdit: (entry: Entry) => void;
}

export default function EntryTable({ entries, onDelete, onEdit }: EntryTableProps) {
  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>日付</TableCell>
            <TableCell>カテゴリ</TableCell>
            <TableCell>金額</TableCell>
            <TableCell>メモ</TableCell>
            <TableCell>支払者</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <EntryTableRow key={entry.id} entry={entry} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 