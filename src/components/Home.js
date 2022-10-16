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
          <p className="text-white">Dharmasaurus collects notes on the dharma. Dharmasaurus hopes these references are of benefit but also cautions that they are at best personal notes of the Dharmasaur.</p>
        </Col>
      </Row>
      <Row className="p-4">
        <Col className="d-flex justify-content-center">
          <Card className="mx-3 bg-secondary" style={{ width: "18rem" }}>
            <Card.Body className="text-center text-white">
              <Card.Title>Definitions</Card.Title>
              <Card.Text>Search all your favourite definitions</Card.Text>
              <LinkContainer to="definitions" style={{ textDecoration: "none" }}>
                <Button variant="warning">{"Go »"}</Button>
              </LinkContainer>
            </Card.Body>
          </Card>
          <Card className="mx-3 bg-secondary" style={{ width: "18rem" }}>
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
  );
};

export default Home;
