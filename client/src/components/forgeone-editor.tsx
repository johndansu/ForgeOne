"use client";

import { useState } from 'react';
import { Link2, List, Quote, Code, Hash, Image, File, Type, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextureButton } from '@/components/ui/texture-button';

interface ForgeOneBlock {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'text' | 'bullet' | 'numbered' | 'quote' | 'code' | 'divider' | 'link' | 'image' | 'file' | 'tag';
  content: string;
  metadata?: {
    url?: string;
    fileName?: string;
    fileSize?: number;
    timestamp?: Date;
  };
}

interface ForgeOneEditorProps {
  blocks: ForgeOneBlock[];
  onChange: (blocks: ForgeOneBlock[]) => void;
  placeholder?: string;
  className?: string;
}

export function ForgeOneEditor({ blocks, onChange, placeholder = "Start typing or use commands...", className }: ForgeOneEditorProps) {
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const forgeOneCommands = [
    { type: 'heading1', label: 'Heading 1', icon: <Type className="h-4 w-4" />, shortcut: '# ' },
    { type: 'heading2', label: 'Heading 2', icon: <Type className="h-3 w-3" />, shortcut: '## ' },
    { type: 'heading3', label: 'Heading 3', icon: <Type className="h-2 w-2" />, shortcut: '### ' },
    { type: 'bullet', label: 'Bullet List', icon: <List className="h-4 w-4" />, shortcut: '- ' },
    { type: 'numbered', label: 'Numbered List', icon: <List className="h-4 w-4" />, shortcut: '1. ' },
    { type: 'quote', label: 'Quote', icon: <Quote className="h-4 w-4" />, shortcut: '> ' },
    { type: 'code', label: 'Code Block', icon: <Code className="h-4 w-4" />, shortcut: '```' },
    { type: 'divider', label: 'Divider', icon: <div className="h-px w-8 bg-gray-300" />, shortcut: '---' },
    { type: 'link', label: 'Link', icon: <Link2 className="h-4 w-4" />, shortcut: '[link](' },
    { type: 'image', label: 'Image', icon: <Image className="h-4 w-4" />, shortcut: '![image](' },
    { type: 'file', label: 'File', icon: <File className="h-4 w-4" />, shortcut: '[file](' },
    { type: 'tag', label: 'Tag', icon: <Hash className="h-4 w-4" />, shortcut: '#' },
  ];

  const filteredCommands = forgeOneCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(commandQuery.toLowerCase())
  );

  const updateBlock = (id: string, updates: Partial<ForgeOneBlock>) => {
    onChange(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const addBlock = (type: ForgeOneBlock['type'], content: string = '', metadata?: ForgeOneBlock['metadata']) => {
    const newBlock: ForgeOneBlock = {
      id: Date.now().toString(),
      type,
      content,
      metadata
    };
    onChange([...blocks, newBlock]);
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === '/') {
      e.preventDefault();
      setCurrentBlockId(blockId);
      setShowCommandMenu(true);
      setCommandQuery('');
    } else if (e.key === 'Escape') {
      setShowCommandMenu(false);
      setCommandQuery('');
      setCurrentBlockId(null);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      const currentBlock = blocks.find(b => b.id === blockId);
      if (currentBlock?.content === '') {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
  };

  const handleCommandSelect = (type: ForgeOneBlock['type']) => {
    if (currentBlockId) {
      updateBlock(currentBlockId, { type });
    } else {
      addBlock(type);
    }
    setShowCommandMenu(false);
    setCommandQuery('');
    setCurrentBlockId(null);
  };

  const handleLinkAdd = () => {
    if (linkUrl.trim() && linkText.trim()) {
      addBlock('link', linkText, { url: linkUrl });
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const renderBlock = (block: ForgeOneBlock) => {
    const { type, content, metadata } = block;
    const { url, fileName, fileSize } = metadata || {};

    switch (type) {
      case 'heading1':
        return (
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-gray-900">
            {content}
          </h1>
        );
      case 'heading2':
        return (
          <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-gray-900">
            {content}
          </h2>
        );
      case 'heading3':
        return (
        <h3 className="text-xl font-semibold text-gray-900 mb-2 text-gray-900">
            {content}
          </h3>
        );
      case 'bullet':
        return (
          <div className="flex items-start gap-3 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
            <span className="text-gray-700">{content}</span>
          </div>
        );
      case 'numbered':
        return (
          <div className="flex items-start gap-3 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
            <span className="text-gray-700">{content}</span>
          </div>
        );
      case 'quote':
        return (
          <div className="border-l-4 border-blue-200 pl-4 py-2 mb-2 italic text-gray-600 bg-blue-50 rounded-r-lg">
            {content}
          </div>
        );
      case 'code':
        return (
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg mb-2 overflow-x-auto">
              <code>{content}</code>
            </pre>
          );
      case 'divider':
        return (
            <div className="border-t border-gray-300 my-6"></div>
        );
      case 'link':
        return (
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-4 w-4 text-blue-600" />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {content}
            </a>
          </div>
        );
      case 'image':
        return (
          <div className="mb-2">
            {url ? (
              <img src={url} alt={content} className="rounded-lg max-w-full h-auto" />
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
                <Image className="h-8 w-8 mx-auto mb-2" />
                <p>{content}</p>
              </div>
            )}
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
            <File className="h-4 w-4 text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{content}</p>
              {fileName && (
                <p className="text-xs text-gray-500 truncate">{fileName}</p>
              )}
              {fileSize && (
                <p className="text-xs text-gray-500">{(fileSize / 1024).toFixed(1)} KB</p>
              )}
            </div>
          </div>
        );
      case 'tag':
        return (
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              <Hash className="h-3 w-3" />
              <span>{content}</span>
            </div>
          );
      default:
        return (
          <p className="text-gray-700">{content}</p>
        );
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Editor */}
      <div className="space-y-1">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="group relative"
            onKeyDown={(e) => handleKeyDown(e, block.id)}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none min-h-[28px] p-3 rounded-lg hover:bg-gray-50 focus:bg-gray-50 transition-colors"
              onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.textContent || '' })}
            >
              {renderBlock(block)}
            </div>
            
            {/* Block Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute left-0 top-0 bg-white border rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="p-1 text-red-500 hover:text-red-700 text-xs"
                  title="Delete block"
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
            onKeyDown={(e) => {
              if (e.key === '/') {
                e.preventDefault();
                setCurrentBlockId('new');
                setShowCommandMenu(true);
                setCommandQuery('');
              }
            }}
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

      {/* Command Menu */}
      {showCommandMenu && (
        <div className="absolute left-0 top-0 z-50 bg-white border rounded-lg shadow-xl w-64 max-h-64 overflow-auto">
          <div className="p-2 border-b">
            <div className="text-xs font-medium text-gray-500">ForgeOne Commands</div>
            <input
              type="text"
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              placeholder="Search commands..."
              className="w-full px-2 py-1 text-sm border-0 outline-none bg-transparent"
              autoFocus
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredCommands.map((command) => (
              <button
                key={command.type}
                onClick={() => handleCommandSelect(command.type as ForgeOneBlock['type'])}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left text-sm transition-colors"
              >
                <div className="text-gray-600">
                  {command.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{command.label}</div>
                  <div className="text-xs text-gray-500">{command.shortcut}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Link</h3>
              <button
                onClick={() => setShowLinkDialog(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <TextureButton
                onClick={handleLinkAdd}
                variant="accent"
                className="w-full"
              >
                Add Link
              </TextureButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
