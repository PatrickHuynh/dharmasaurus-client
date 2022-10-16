import { Col, Container, Row, Stack, Card, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Home = () => {
  return (
    <Container fluid className="navgradient vh-100">
      <Row style={{ backgroundImage: "url('/space_rainbow_background.jpg')", backgroundSize: "cover" }}>
        <Col className="text-center">
          <img src="./dharmasaurus.png" style={{ maxWidth: "90%" }} />
        </Col>
      </Row>
      <Row>
        <Col className="p-3 text-center">
          <h1 className="fw-bold text-white">Dharmasaurus welcomes you!</h1>
          <p className="text-white">Dharmasaurus collects notes on the dharma. These references may be of benefit, but take caution that they are at best just notes of the Dharmasaur.</p>
        </Col>
      </Row>
      <Container>
        <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 justify-content-center">
          <Col className="justify-content-center">
            <Card className="mx-3 bg-secondary">
              <Card.Body className="text-center text-white">
                <Card.Title>Definitions</Card.Title>
                <Card.Text>Search all your favourite definitions</Card.Text>
                <LinkContainer to="definitions" style={{ textDecoration: "none" }}>
                  <Button variant="warning">{"Go »"}</Button>
                </LinkContainer>
              </Card.Body>
            </Card>
          </Col>
          <Col className="justify-content-center">
            <Card className="mx-3 bg-secondary">
              <Card.Body className="text-center text-white">
                <Card.Title>Maps</Card.Title>
                <Card.Text>Maps for various subjects</Card.Text>
                <LinkContainer to="maps" style={{ textDecoration: "none" }}>
                  <Button variant="warning">{"Go »"}</Button>
                </LinkContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default Home;
