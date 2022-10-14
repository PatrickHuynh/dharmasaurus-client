import { Container, Row, Col, Stack } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const loc = useLocation();

  const navComponents = () => {
    return (
      <Row>
        <Col>
          <Link className={`m-1 text-light`} style={{ textDecoration: "none" }} to="/">
            <img src="/dharmasaurus.png" height="50" alt="" />
            <b> Dharmasaurus</b>
          </Link>
        </Col>
        <Col md="auto align-self-center">
          <Stack className="m-1" direction="horizontal" gap={2}>
            <Link className={`btn ${loc.pathname === "/" ? "btn-secondary" : "btn-outline-light border-0"} btn-sm`} to="/">
              Definitions
            </Link>
            <Link className={`btn ${loc.pathname.startsWith("/outlines") ? "btn-secondary" : "btn-outline-light border-0"} btn-sm`} to="/outlines">
              Outlines
            </Link>
            <Link className={`btn btn-sm btn-outline-primary`} to="/login">
              Login
            </Link>
            <a href="https://discord.gg/gNggmHtV3w" target="blank">
              <img className="pb-1" src="\discord.svg" height="20" alt="" />
            </a>
          </Stack>
        </Col>
      </Row>
    );
  };

  // note the second nav bar without fixed-top, is hidden underneath the first one
  // this is a sizing hack to allow fixed top and also responsive vertical offset
  return (
    <>
      <Container fluid className="navgradient fixed-top m-0">
        {navComponents()}
      </Container>
      <Container fluid className="navgradient m-0">
        {navComponents()}
      </Container>
    </>
  );
};

export default Navbar;
