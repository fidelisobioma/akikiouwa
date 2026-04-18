"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Highlighter,
  Undo,
  Redo,
  Link2Off,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ImageUploadDialog } from "./editor/image-upload-dialog";

interface EditorProps {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

type ToolbarButton = {
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  title: string;
  disabled?: boolean;
};

export function Editor({
  content = "",
  onChange,
  placeholder = "Start writing your article...",
}: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg  max-w-full  my-4 ",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 cursor-pointer",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: "bg-yellow-200 dark:bg-yellow-800 rounded px-0.5",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "rounded-lg  my-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Typography,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          " prose-img:mx-0 prose-img:my-4 prose prose-sm dark:prose-invert max-w-none p-4 min-h-[500px] focus:outline-none prose-headings:font-medium prose-headings:tracking-tight prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:not-italic prose-blockquote:font-normal prose-img:rounded-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  if (!editor) return null;

  function addImage() {
    setImageDialogOpen(true);
    // const url = window.prompt("Enter image URL");
    // if (url) {
    //   editor?.chain().focus().setImage({ src: url }).run();
    // }
  }

  function handleImageInsert(url: string) {
    editor?.chain().focus().setImage({ src: url }).run();
  }

  function addLink() {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  function addYoutube() {
    const url = window.prompt("Enter YouTube video URL");
    if (url) {
      editor?.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  }

  const toolbarGroups: ToolbarButton[][] = [
    // History
    [
      {
        icon: <Undo className="w-4 h-4" />,
        action: () => editor.chain().focus().undo().run(),
        disabled: !editor.can().undo(),
        title: "Undo",
      },
      {
        icon: <Redo className="w-4 h-4" />,
        action: () => editor.chain().focus().redo().run(),
        disabled: !editor.can().redo(),
        title: "Redo",
      },
    ],
    // Headings
    [
      {
        icon: <Heading2 className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
        title: "Heading 2",
      },
      {
        icon: <Heading3 className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive("heading", { level: 3 }),
        title: "Heading 3",
      },
    ],
    // Text formatting
    [
      {
        icon: <Bold className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
        title: "Bold",
      },
      {
        icon: <Italic className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
        title: "Italic",
      },
      {
        icon: <UnderlineIcon className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: editor.isActive("underline"),
        title: "Underline",
      },
      {
        icon: <Strikethrough className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive("strike"),
        title: "Strikethrough",
      },
      {
        icon: <Highlighter className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleHighlight().run(),
        isActive: editor.isActive("highlight"),
        title: "Highlight",
      },
    ],
    // Alignment
    [
      {
        icon: <AlignLeft className="w-4 h-4" />,
        action: () => editor.chain().focus().setTextAlign("left").run(),
        isActive: editor.isActive({ textAlign: "left" }),
        title: "Align left",
      },
      {
        icon: <AlignCenter className="w-4 h-4" />,
        action: () => editor.chain().focus().setTextAlign("center").run(),
        isActive: editor.isActive({ textAlign: "center" }),
        title: "Align center",
      },
      {
        icon: <AlignRight className="w-4 h-4" />,
        action: () => editor.chain().focus().setTextAlign("right").run(),
        isActive: editor.isActive({ textAlign: "right" }),
        title: "Align right",
      },
    ],
    // Lists and blocks
    [
      {
        icon: <List className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
        title: "Bullet list",
      },
      {
        icon: <ListOrdered className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
        title: "Ordered list",
      },
      {
        icon: <Quote className="w-4 h-4" />,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: editor.isActive("blockquote"),
        title: "Blockquote",
      },
      {
        icon: <Minus className="w-4 h-4" />,
        action: () => editor.chain().focus().setHorizontalRule().run(),
        title: "Divider",
      },
    ],
    // Media
    [
      {
        icon: <LinkIcon className="w-4 h-4" />,
        action: addLink,
        isActive: editor.isActive("link"),
        title: "Add link",
      },
      {
        icon: <Link2Off className="w-4 h-4" />,
        action: () => editor.chain().focus().unsetLink().run(),
        disabled: !editor.isActive("link"),
        title: "Remove link",
      },
      {
        icon: <ImageIcon className="w-4 h-4" />,
        action: addImage,
        title: "Add image",
      },
      {
        icon: <YoutubeIcon className="w-4 h-4" />,
        action: addYoutube,
        title: "Embed YouTube",
      },
    ],
  ];

  return (
    <div className="border rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {/* Toolbar */}
      <div className="top-30 z-10 sticky flex flex-wrap items-center gap-1 bg-background p-2 border-b">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-1">
            {group.map((btn, btnIndex) => (
              <Button
                key={btnIndex}
                type="button"
                variant={btn.isActive ? "default" : "ghost"}
                size="icon"
                className="w-8 h-8"
                onClick={btn.action}
                disabled={btn.disabled}
                title={btn.title}
              >
                {btn.icon}
              </Button>
            ))}
            {groupIndex < toolbarGroups.length - 1 && (
              <Separator orientation="vertical" className="mx-1 h-6" />
            )}
          </div>
        ))}
      </div>

      {/* Editor content area */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div className="flex justify-between items-center bg-muted/40 px-4 py-2 border-t rounded-b-lg text-muted-foreground text-xs">
        <span>
          {editor.storage.characterCount.words()}{" "}
          {editor.storage.characterCount.words() === 1 ? "word" : "words"}
        </span>
        <span>{editor.storage.characterCount.characters()} characters</span>
      </div>

      <ImageUploadDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        onInsert={handleImageInsert}
      />
    </div>
  );
}
