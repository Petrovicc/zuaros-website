export function SectionHeading({
  id,
  label,
  title,
  text,
}: {
  id: string;
  label: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-heading">
      <p className="section-label">{label}</p>
      <h2 id={id}>{title}</h2>
      {text && <p className="section-description">{text}</p>}
    </div>
  );
}
