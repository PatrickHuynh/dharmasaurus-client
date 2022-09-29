import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const loc = useLocation();
  return (
    <>
      <Container fluid className="bg-dark">
        <Row>
          <Col>
            <img src="/stegosaurus.png" height="50" />
            <b className="text-light">&nbsp;&nbsp;Dharmasaurus</b>
          </Col>
          <Col md="auto align-self-center">
            <Link className={`btn ${loc.pathname == "/" ? "btn-secondary" : "btn-outline-light"} m-1`} to="/">
              Home
            </Link>
            <Link className={`btn ${loc.pathname == "/definitions" ? "btn-secondary" : "btn-outline-light"} m-1`} to="/definitions">
              Definitions
            </Link>
            <Link className={`btn ${loc.pathname == "/about" ? "btn-secondary" : "btn-outline-light"} m-1`} to="/about">
              About
            </Link>
            <Link className={`btn btn-outline-primary m-1`} to="/login">
              Login
            </Link>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Navbar;