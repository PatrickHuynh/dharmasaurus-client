import { Col, Container, Row, Stack, Card, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Home = () => {
  return (
    <Container fluid className="navgradient vh-100">
      <Row style={{ backgroundImage: "url('/space_rainbow_background.jpg')", backgroundSize: "cover" }}>
        <Col className="text-center">
          <img src="./dharmasaurus.png" style={{ maxWidth: "90%" }} />
          <h1 className="pb-3 fw-bold text-dark" style={{ textShadow: "1px 0 0 #fff, 0 -1px 0 #fff, 0 1px 0 #fff, -1px 0 0 #fff" }}>
            Dharmasaurus welcomes you!
          </h1>
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
              <Card.Title>Outlines</Card.Title>
              <Card.Text>Outlines for various subjects</Card.Text>
              <LinkContainer to="outlines" style={{ textDecoration: "none" }}>
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
