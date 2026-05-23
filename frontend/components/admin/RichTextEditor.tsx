'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ HTMLAttributes: { class: 'editor-image' } }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Placeholder.configure({ placeholder: placeholder || 'Nhập nội dung...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn. Tối đa 5MB.');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      try {
        const apiUrl = localStorage.getItem('natif_api_url') || process.env.NEXT_PUBLIC_API_URL || '';
        const token = localStorage.getItem('natif_token');
        const res = await fetch(`${apiUrl}/api/admin/upload/news`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const json = await res.json();
        if (json.url) {
          editor.chain().focus().setImage({ src: json.url }).run();
        } else {
          alert(json.error || 'Upload thất bại');
        }
      } catch {
        alert('Upload thất bại');
      }
    };
    input.click();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <select
          className="px-2 py-1 text-sm border border-gray-300 rounded text-gray-700"
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
          }}
        >
          <option value={0}>Đoạn văn</option>
          <option value={1}>Tiêu đề 1</option>
          <option value={2}>Tiêu đề 2</option>
          <option value={3}>Tiêu đề 3</option>
        </select>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          className={`px-2 py-1 text-sm rounded hover:bg-blue-50 ${editor.isActive('bold') ? 'bg-blue-100 text-natif-blue' : 'text-gray-700'}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          title="In đậm"
        ><strong>B</strong></button>
        <button
          type="button"
          className={`px-2 py-1 text-sm rounded hover:bg-blue-50 ${editor.isActive('italic') ? 'bg-blue-100 text-natif-blue' : 'text-gray-700'}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          title="In nghiêng"
        ><em>I</em></button>
        <button
          type="button"
          className={`px-2 py-1 text-sm rounded hover:bg-blue-50 ${editor.isActive('underline') ? 'bg-blue-100 text-natif-blue' : 'text-gray-700'}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
          title="Gạch chân"
        ><u>U</u></button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          className={`px-2 py-1 text-sm rounded hover:bg-blue-50 ${editor.isActive('bulletList') ? 'bg-blue-100 text-natif-blue' : 'text-gray-700'}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          title="Danh sách"
        >•☰</button>
        <button
          type="button"
          className={`px-2 py-1 text-sm rounded hover:bg-blue-50 ${editor.isActive('orderedList') ? 'bg-blue-100 text-natif-blue' : 'text-gray-700'}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          title="Danh sách số"
        >1.</button>
        <button
          type="button"
          className={`px-2 py-1 text-sm rounded hover:bg-blue-50 ${editor.isActive('blockquote') ? 'bg-blue-100 text-natif-blue' : 'text-gray-700'}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
          title="Trích dẫn"
        >&ldquo;&rdquo;</button>
        <button
          type="button"
          className={`px-2 py-1 text-sm rounded hover:bg-blue-50 ${editor.isActive('codeBlock') ? 'bg-blue-100 text-natif-blue' : 'text-gray-700'}`}
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); }}
          title="Mã nguồn"
        >{`</>`}</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}
          title="Canh trái"
        >⬅</button>
        <button
          type="button"
          className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}
          title="Canh giữa"
        >⬌</button>
        <button
          type="button"
          className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}
          title="Canh phải"
        >➡</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
          title="Hoàn tác"
        >↩</button>
        <button
          type="button"
          className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
          title="Làm lại"
        >↪</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50"
          onMouseDown={(e) => { e.preventDefault(); handleImageUpload(); }}
          title="Chèn ảnh"
        >🖼 Ảnh</button>
        <button
          type="button"
          className="px-2 py-1 text-sm text-gray-700 rounded hover:bg-blue-50"
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt('Nhập URL liên kết:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          title="Chèn liên kết"
        >🔗 Link</button>
      </div>

      {/* Editor content */}
      <style>{`
        .ProseMirror { padding: 1rem; min-height: 320px; outline: none; }
        .ProseMirror h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 0.75rem; color: #1f3892; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #1f3892; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
        .ProseMirror p { margin-bottom: 0.75rem; line-height: 1.7; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .ProseMirror blockquote { border-left: 4px solid #1f3892; padding-left: 1rem; color: #555; font-style: italic; margin: 1rem 0; }
        .ProseMirror code { background: #f1f5f9; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875rem; }
        .ProseMirror pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
        .ProseMirror pre code { background: none; padding: 0; color: inherit; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
        .ProseMirror a { color: #1f3892; text-decoration: underline; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
