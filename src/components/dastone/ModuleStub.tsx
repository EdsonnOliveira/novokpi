interface ModuleStubProps {
  title: string;
  description: string;
  phase?: string;
}

export function ModuleStub({ title, description, phase }: ModuleStubProps) {
  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-tools display-4 text-muted mb-3 d-block" />
            <h4 className="mb-2">{title}</h4>
            <p className="text-muted mb-3">{description}</p>
            {phase ? (
              <span className="badge bg-soft-primary">{phase}</span>
            ) : (
              <span className="badge bg-soft-warning">Em desenvolvimento</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
