"use client";

import { useState, useRef } from 'react';
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code
} from 'lucide-react';

interface Block {
  id: string;
  type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'numbered' | 'quote' | 'code' | 'divider';
  content: string;
}

interface NotionEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
}

export function NotionEditor({ blocks, onChange, placeholder = "Start typing or type '/' for commands..." }: NotionEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const slashCommands = [
    { type: 'heading1', label: 'Heading 1', icon: Heading1, shortcut: '# ' },
    { type: 'heading2', label: 'Heading 2', icon: Heading2, shortcut: '## ' },
    { type: 'heading3', label: 'Heading 3', icon: Heading3, shortcut: '### ' },
    { type: 'bullet', label: 'Bullet List', icon: List, shortcut: '- ' },
    { type: 'numbered', label: 'Numbered List', icon: ListOrdered, shortcut: '1. ' },
    { type: 'quote', label: 'Quote', icon: Quote, shortcut: '> ' },
    { type: 'code', label: 'Code Block', icon: Code, shortcut: '```' },
    { type: 'divider', label: 'Divider', icon: Type, shortcut: '---' },
  ];

  const filteredCommands = slashCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const updateBlock = (id: string, updates: Partial<Block>) => {
    onChange(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const addBlock = (type: Block['type'], content: string = '') => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content,
    };
    onChange([...blocks, newBlock]);
    setShowSlashMenu(false);
    setSlashQuery('');
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === '/') {
      e.preventDefault();
      setCurrentBlockId(blockId);
      setShowSlashMenu(true);
      setSlashQuery('');
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
      setSlashQuery('');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      const currentBlock = blocks.find(b => b.id === blockId);
      if (currentBlock?.content === '') {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
  };

  const handleSlashCommand = (commandType: string) => {
    const type = commandType as Block['type'];
    if (currentBlockId) {
      updateBlock(currentBlockId, { type });
    } else {
      addBlock(type);
    }
  };

  const renderBlock = (block: Block) => {
    const { type, content } = block;

    switch (type) {
      case 'heading1':
        return (
          <h1 className="text-3xl font-bold text-gray-900 my-2">
            {content}
          </h1>
        );
      case 'heading2':
        return (
          <h2 className="text-2xl font-semibold text-gray-900 my-2">
            {content}
          </h2>
        );
      case 'heading3':
        return (
          <h3 className="text-xl font-semibold text-gray-900 my-2">
            {content}
          </h3>
        );
      case 'bullet':
        return (
          <div className="flex items-start gap-2 my-1">
            <span className="text-gray-400 mt-1">•</span>
            <span className="text-gray-700">{content}</span>
          </div>
        );
      case 'numbered':
        return (
          <div className="flex items-start gap-2 my-1">
            <span className="text-gray-400 mt-1">1.</span>
            <span className="text-gray-700">{content}</span>
          </div>
        );
      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-2 italic text-gray-600">
            {content}
          </blockquote>
        );
      case 'code':
        return (
          <pre className="bg-gray-100 p-3 rounded-lg my-2 text-sm font-mono text-gray-800">
            <code>{content}</code>
          </pre>
        );
      case 'divider':
        return (
          <div className="border-t border-gray-300 my-4"></div>
        );
      default:
        return (
          <p className="text-gray-700 my-1">{content}</p>
        );
    }
  };

  return (
    <div className="relative" ref={editorRef}>
      <div className="space-y-1">
        {blocks.map((block) => (
          <div key={block.id} className="group relative">
            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none min-h-[28px] p-2 rounded hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.textContent || '' })}
            >
              {renderBlock(block)}
            </div>
            
            {/* Block Actions */}
            <div className="absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 p-1 bg-white border rounded shadow-sm">
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {blocks.length === 0 && (
          <div
            contentEditable
            suppressContentEditableWarning
            className="outline-none min-h-[100px] p-4 text-gray-400"
            onKeyDown={(e) => handleKeyDown(e, 'new')}
            onBlur={(e) => {
              if (e.currentTarget.textContent) {
                addBlock('text', e.currentTarget.textContent);
              }
            }}
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <div className="absolute z-50 w-64 bg-white border rounded-lg shadow-lg p-2">
          <div className="mb-2 px-2 py-1 text-xs text-gray-500 font-medium">
            Block type
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCommands.map((command) => (
              <button
                key={command.type}
                onClick={() => handleSlashCommand(command.type)}
                className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left transition-colors"
              >
                <command.icon className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{command.label}</div>
                  <div className="text-xs text-gray-500">{command.shortcut}</div>
                </div>
              </button>
            ))}
          </div>
          
          <input
            type="text"
            value={slashQuery}
            onChange={(e) => setSlashQuery(e.target.value)}
            placeholder="Search blocks..."
            className="w-full px-2 py-1 text-sm border-t mt-2 outline-none"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
