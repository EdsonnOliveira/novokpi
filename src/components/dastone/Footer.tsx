export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer text-center text-sm-start d-print-none">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">{year} © Novo KPI</div>
          <div className="col-sm-6">
            <div className="text-sm-end d-none d-sm-block">Gestão para lojas de veículos</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
