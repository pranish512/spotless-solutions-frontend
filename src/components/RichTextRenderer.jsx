// Renders saved HTML from the rich text editor with consistent typography.
// Note: in production, sanitize HTML server-side or via DOMPurify before render.
const RichTextRenderer = ({ html, className = "" }) => {
  if (!html) {
    return (
      <p className="text-muted-foreground italic">No content has been published yet.</p>
    );
  }
  return (
    <div
      className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/80 prose-img:rounded-lg ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default RichTextRenderer;
