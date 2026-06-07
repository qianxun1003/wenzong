"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { InfraCostTableDoc } from "@/lib/admin/presentation-materials";
import {
  loadInfraCostTable,
  resetInfraCostTable,
  saveInfraCostTable,
} from "@/lib/admin/presentation-materials-store";
import type { PresentationGlossaryTermId } from "@/lib/admin/presentation-glossary";
import { PresentationGlossaryViewer } from "./presentation-glossary-viewer";
import { PresentationTableCell } from "./presentation-table-cell";

const COLUMN_WIDTHS = ["13%", "27%", "24%", "20%", "16%"] as const;

export function InfrastructureCostTable() {
  const [savedDoc, setSavedDoc] = useState<InfraCostTableDoc | null>(null);
  const [draftDoc, setDraftDoc] = useState<InfraCostTableDoc | null>(null);
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<PresentationGlossaryTermId | null>(
    null
  );

  useEffect(() => {
    const loaded = loadInfraCostTable();
    setSavedDoc(loaded);
    setDraftDoc(loaded);
  }, []);

  const isDirty = useMemo(() => {
    if (!savedDoc || !draftDoc) return false;
    return JSON.stringify(savedDoc) !== JSON.stringify(draftDoc);
  }, [savedDoc, draftDoc]);

  const updateDraft = useCallback((updater: (prev: InfraCostTableDoc) => InfraCostTableDoc) => {
    setDraftDoc((prev) => (prev ? updater(prev) : prev));
  }, []);

  const updateTitle = (title: string) => {
    updateDraft((prev) => ({ ...prev, title }));
  };

  const updateColumn = (colIndex: number, value: string) => {
    updateDraft((prev) => {
      const columns = [...prev.columns] as InfraCostTableDoc["columns"];
      columns[colIndex] = value;
      return { ...prev, columns };
    });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    updateDraft((prev) => {
      const rows = prev.rows.map((row, ri) => {
        if (ri !== rowIndex) return row;
        const cells = [...row.cells] as InfraCostTableRowCells;
        cells[colIndex] = value;
        return { ...row, cells };
      });
      return { ...prev, rows };
    });
  };

  const handleSave = () => {
    if (!draftDoc) return;
    saveInfraCostTable(draftDoc);
    setSavedDoc(draftDoc);
    toast.success("表格已保存");
  };

  const handleReset = () => {
    const next = resetInfraCostTable();
    setSavedDoc(next);
    setDraftDoc(next);
    toast.message("已恢复默认内容");
  };

  const handleDiscard = () => {
    if (!savedDoc) return;
    setDraftDoc(savedDoc);
    toast.message("已撤销未保存的修改");
  };

  if (!draftDoc) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        加载中…
      </div>
    );
  }

  return (
    <>
      <PresentationGlossaryViewer
        termId={activeGlossaryTerm}
        onClose={() => setActiveGlossaryTerm(null)}
      />

      <section className="presentation-table-wrap">
        {isDirty && (
          <div className="presentation-table-actions mb-2 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleDiscard}>
              撤销修改
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              恢复默认
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              保存表格
            </Button>
          </div>
        )}

        <div className="presentation-table-scroll overflow-x-auto">
          <div className="presentation-grid-sheet">
            <div className="presentation-table-panel__title">
              <Textarea
                value={draftDoc.title}
                onChange={(e) => updateTitle(e.target.value)}
                aria-label="文档标题"
                className="min-h-0 resize-none text-lg sm:text-xl"
                rows={1}
              />
            </div>

            <table className="presentation-grid-table w-full min-w-[1080px] table-fixed">
              <colgroup>
                {COLUMN_WIDTHS.map((width, index) => (
                  <col key={index} style={{ width }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {draftDoc.columns.map((column, colIndex) => (
                    <th key={colIndex} scope="col">
                      <PresentationTableCell
                        value={column}
                        onChange={(value) => updateColumn(colIndex, value)}
                        ariaLabel={`列标题 ${colIndex + 1}`}
                        variant="header"
                        onTermClick={setActiveGlossaryTerm}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draftDoc.rows.map((row, rowIndex) => (
                  <tr key={row.id}>
                    {row.cells.map((cell, colIndex) => (
                      <td key={`${row.id}-${colIndex}`}>
                        <PresentationTableCell
                          value={cell}
                          onChange={(value) => updateCell(rowIndex, colIndex, value)}
                          ariaLabel={`第 ${rowIndex + 1} 行第 ${colIndex + 1} 列`}
                          onTermClick={setActiveGlossaryTerm}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

type InfraCostTableRowCells = InfraCostTableDoc["rows"][number]["cells"];
