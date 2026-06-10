'use client';

import { useState } from 'react';
import { ChevronRight, File, Folder } from 'lucide-react';
import clsx from 'clsx';
import type { FileTreeNode } from '@/lib/types';

interface FileTreeProps {
  nodes: FileTreeNode[];
  selectedPath?: string;
  onSelect: (path: string) => void;
}

function TreeNode({
  node,
  selectedPath,
  onSelect,
  depth = 0,
}: {
  node: FileTreeNode;
  selectedPath?: string;
  onSelect: (path: string) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const isSelected = selectedPath === node.path;

  if (node.isDirectory) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-1 rounded px-2 py-1 text-left text-sm text-slate-300 hover:bg-slate-800"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <ChevronRight
            className={clsx('h-3 w-3 transition-transform', open && 'rotate-90')}
          />
          <Folder className="h-3.5 w-3.5 text-amber-400" />
          <span className="truncate">{node.name}</span>
        </button>
        {open &&
          node.children?.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={clsx(
        'flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm',
        isSelected
          ? 'bg-indigo-500/20 text-indigo-200'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      <File className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  if (!nodes.length) {
    return (
      <p className="px-4 py-8 text-center text-sm text-slate-500">
        No files uploaded yet
      </p>
    );
  }

  return (
    <div className="py-2">
      {nodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
