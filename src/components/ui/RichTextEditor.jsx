'use client';

import { useState } from 'react';
import { Bold, Italic, Heading, List, Code, Link as LinkIcon, Eye, Edit3 } from 'lucide-react';

export default function RichTextEditor({ name, defaultValue = '', placeholder = 'Enter rich text content...', rows = 5 }) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'

  function insertFormatting(prefix, suffix = '') {
    const textarea = document.getElementById(`editor-${name}`);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    setValue(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  }

  return (
    <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden focus-within:border-cyan-500 transition-all">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('### ')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Heading"
          >
            <Heading className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('```javascript\n', '\n```')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('[', '](https://example.com)')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('edit')}
            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              mode === 'edit' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3 h-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              mode === 'preview' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
      </div>

      {/* Editor or Preview area */}
      {mode === 'edit' ? (
        <textarea
          id={`editor-${name}`}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500 resize-y font-mono"
        />
      ) : (
        <div className="p-4 min-h-[120px] prose prose-invert prose-sm max-w-none text-slate-200 text-sm leading-relaxed">
          {value ? (
            <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-300">{value}</pre>
          ) : (
            <span className="text-slate-500 text-xs italic">Nothing to preview. Enter some text in Edit mode.</span>
          )}
          {/* Hidden input to ensure value submits with form when in preview mode */}
          <input type="hidden" name={name} value={value} />
        </div>
      )}
    </div>
  );
}
