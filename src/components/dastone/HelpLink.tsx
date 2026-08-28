interface HelpLinkProps {
  label?: string;
  videoUrl: string;
}

export function HelpLink({ label = 'Ajuda', videoUrl }: HelpLinkProps) {
  return (
    <a
      href={videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-light btn-sm"
    >
      <i className="iconoir-play me-1" />
      {label}
    </a>
  );
}
