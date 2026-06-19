import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Image as ImageIcon, Undo, Redo,
} from "lucide-react";

const ToolbarBtn = ({ active, onClick, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-md text-sm transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted"
    } disabled:opacity-40`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px self-stretch bg-border mx-1" />;

/**
 * Tiptap-based rich text editor.
 * - Controlled via `value` (HTML string) and `onChange(html)`.
 * - Toolbar: bold, italic, underline, link, lists, alignment, headings, image (URL).
 */
const RichTextEditor = ({ value = "", onChange, placeholder = "Start writing..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full h-auto my-3" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || `<p></p>`,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[260px] sm:min-h-[360px] focus:outline-none px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  // Sync external value changes (e.g. async load of stored content)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current) editor.commands.setContent(value, false);
  }, [value, editor]);

  if (!editor) return null;

  const promptLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const promptImage = () => {
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/40 sticky top-0 z-10">
        <ToolbarBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></ToolbarBtn>
        <Divider />
        <ToolbarBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Link" active={editor.isActive("link")} onClick={promptLink}><LinkIcon className="w-4 h-4" /></ToolbarBtn>
        <Divider />
        <ToolbarBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></ToolbarBtn>
        <Divider />
        <ToolbarBtn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="w-4 h-4" /></ToolbarBtn>
        <Divider />
        <ToolbarBtn title="Image (URL)" onClick={promptImage}><ImageIcon className="w-4 h-4" /></ToolbarBtn>
        <Divider />
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo className="w-4 h-4" /></ToolbarBtn>
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
};

export default RichTextEditor;
