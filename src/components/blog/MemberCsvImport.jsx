import { useRef, useState } from "react";
import { db } from "@/api/dataClient";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2, X } from "lucide-react";

const HEADER_MAP = {
    name: "name",
    class: "class",
    section: "section",
    admissionnumber: "admission_number",
    admission_number: "admission_number",
    admission: "admission_number",
    role: "role",
    domain: "domain",
};

function splitLine(line) {
    const out = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
            else inQ = !inQ;
        } else if (c === "," && !inQ) {
            out.push(cur); cur = "";
        } else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
}

function parseCsv(text) {
    const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim() !== "");
    if (!lines.length) return [];
    const headers = splitLine(lines[0]).map((h) =>
        HEADER_MAP[h.toLowerCase().replace(/\s+/g, "")] || h.toLowerCase().replace(/\s+/g, "")
    );
    return lines.slice(1).map((cells) => {
        const parts = splitLine(cells);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = parts[i] ?? ""; });
        return {
            name: obj.name || "",
            class: obj.class || "",
            section: obj.section || "",
            admission_number: obj.admission_number || "",
            role: obj.role || "Member",
            domain: obj.domain || "",
        };
    }).filter((r) => r.name);
}

export default function MemberCsvImport({ onDone }) {
    const [preview, setPreview] = useState(null);
    const [busy, setBusy] = useState(false);
    const { toast } = useToast();
    const inputRef = useRef(null);

    const onFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        const parsed = parseCsv(text);
        if (!parsed.length) {
            toast({ title: "No valid rows found", description: "Ensure a header row with: name, class, section, admissionnumber, role, domain", variant: "destructive" });
            e.target.value = "";
            return;
        }
        // dedupe within the file by name + admission number
        const seen = new Set();
        const deduped = [];
        let fileDups = 0;
        for (const r of parsed) {
            const key = `${r.name}|${r.admission_number}`.toLowerCase();
            if (seen.has(key)) { fileDups++; continue; }
            seen.add(key);
            deduped.push(r);
        }
        // skip members that already exist (by admission number)
        let skippedExisting = 0;
        const fresh = [];
        const nums = deduped.map((r) => r.admission_number).filter(Boolean);
        if (nums.length) {
            let existingNums = new Set();
            try {
                const existing = await db.entities.Member.filter({ admission_number: { $in: nums } }, "name", 200);
                existingNums = new Set((existing || []).map((m) => m.admission_number));
            } catch {}
            for (const r of deduped) {
                if (r.admission_number && existingNums.has(r.admission_number)) { skippedExisting++; continue; }
                fresh.push(r);
            }
        } else {
            fresh.push(...deduped);
        }
        if (!fresh.length) {
            toast({ title: "Nothing to import", description: `${fileDups} duplicate${fileDups === 1 ? "" : "s"} in file · ${skippedExisting} already exist`, variant: "destructive" });
        }
        setPreview({ records: fresh, fileDups, skippedExisting });
        e.target.value = "";
    };

    const run = async () => {
        if (!preview?.records?.length) return;
        setBusy(true);
        try {
            await db.entities.Member.bulkCreate(preview.records);
            toast({ title: `Imported ${preview.records.length} member${preview.records.length === 1 ? "" : "s"}` });
            setPreview(null);
            onDone?.();
        } catch (err) {
            toast({ title: "Import failed", description: String(err?.message || err), variant: "destructive" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="mb-6 border border-border bg-card p-5">
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-pink">// bulk import (csv)</span>
                <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close import">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Columns: <span className="text-foreground">name, class, section, admissionnumber, role, domain</span>. Role defaults to "Member".
            </p>
            <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="mt-4 flex items-center gap-2 border border-brand-purple/50 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-brand-purple transition-colors hover:bg-brand-purple hover:text-black disabled:opacity-50"
            >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} choose csv
            </button>

            {preview && (
                <div className="mt-5">
                    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        <span>{preview.records.length} ready · preview:</span>
                        {preview.fileDups > 0 && <span className="text-brand-pink">{preview.fileDups} duplicate{preview.fileDups === 1 ? "" : "s"} skipped</span>}
                        {preview.skippedExisting > 0 && <span className="text-brand-pink">{preview.skippedExisting} already exist</span>}
                    </div>
                    <div className="max-h-52 overflow-auto border border-border">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-background text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                            <tr>
                                <th className="px-2 py-1.5">name</th>
                                <th className="px-2 py-1.5">class</th>
                                <th className="px-2 py-1.5">sec</th>
                                <th className="px-2 py-1.5">adm no</th>
                                <th className="px-2 py-1.5">role</th>
                                <th className="px-2 py-1.5">domain</th>
                            </tr>
                            </thead>
                            <tbody>
                            {preview.records.slice(0, 50).map((r, i) => (
                                <tr key={i} className="border-t border-border">
                                    <td className="px-2 py-1.5">{r.name}</td>
                                    <td className="px-2 py-1.5">{r.class}</td>
                                    <td className="px-2 py-1.5">{r.section}</td>
                                    <td className="px-2 py-1.5">{r.admission_number}</td>
                                    <td className="px-2 py-1.5">{r.role}</td>
                                    <td className="px-2 py-1.5">{r.domain}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        onClick={run}
                        disabled={busy}
                        className="mt-4 flex items-center gap-2 bg-brand-purple px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-colors hover:bg-brand-pink disabled:opacity-50"
                    >
                        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        import {preview.records.length} member{preview.records.length === 1 ? "" : "s"}
                    </button>
                </div>
            )}
        </div>
    );
}