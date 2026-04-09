'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] focus:outline-none p-4',
      },
    },
  });

  if (!editor) return null;

  const tools = [
    {
      label: 'Bold',
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
    },
    {
      label: 'Italic',
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
    },
    {
      label: 'Heading',
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'Bullet List',
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList'),
    },
    {
      label: 'Ordered List',
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList'),
    },
  ];

  return (
    <div className="tiptap-editor border border-dark-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b border-dark-border bg-dark-bg">
        {tools.map(({ label, icon: Icon, action, active }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            title={label}
            className={`p-2 rounded transition-colors ${active ? 'bg-burnt-orange/20 text-burnt-orange' : 'text-gray-500 hover:text-off-white hover:bg-dark-card'}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
