import { useContext } from "react";
import { Container, Row, Col, Stack } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import LoginButton from "./LoginButton";

const Navbar = () => {
  const loc = useLocation();

  const navComponents = () => {
    return (
      <Row>
        <Col className="text-center text-sm-start">
          <Link className={`m-1 text-light`} style={{ textDecoration: "none" }} to="/">
            <img src="/dharmasaurus.png" height="50" alt="" className="p-1" />
            <b> Dharmasaurus</b>
          </Link>
        </Col>
        <Col className="d-flex justify-content-center" md="auto align-self-center">
          <Stack className="m-1" direction="horizontal" gap={2}>
            <Link className={`btn ${loc.pathname === "/" ? "btn-warning" : "btn-outline-light border-0"} btn-sm`} to="/">
              Home
            </Link>
            <Link className={`btn ${loc.pathname.startsWith("/dojo") ? "btn-warning" : "btn-outline-light border-0"} btn-sm`} to="/dojo/definitions">
              Dojo
            </Link>
            <Link className={`btn ${loc.pathname.startsWith("/definitions") ? "btn-warning" : "btn-outline-light border-0"} btn-sm`} to="/definitions">
              Definitions
            </Link>
            <Link className={`btn ${loc.pathname.startsWith("/maps") ? "btn-warning" : "btn-outline-light border-0"} btn-sm`} to="/maps">
              Maps
            </Link>
            <Link className={`btn ${loc.pathname.startsWith("/pics") ? "btn-warning" : "btn-outline-light border-0"} btn-sm`} to="/pics">
              Pics
            </Link>
            <LoginButton />
            <a href="https://discord.gg/gNggmHtV3w" target="blank">
              <img className="pb-1" src="\discord.svg" height="20" alt="" hidden="hidden" />
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
