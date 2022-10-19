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
        <Col xs={1} md={3}></Col>
        <Col xs md={6} className="p-3 text-center">
          <h1 className="mb-3 fw-bold text-success">Dharmasaurus ❤️ welcomes you!</h1>
          <p className="text-white">Dharmasaurus is a kind of grass eating animal, spawned from the heat of the flames on the sword of Manjushri and moisture from the tear of Tara. As it forages, notes of the dharma precipitate from the air of the mandala to settle on its scales, resonating musical tones and radiating rainbow light. </p>
          <p className="text-white">But the Dharmasaur is made up and is entirely fictional - time to wake up from the dream!</p>
          <p className="text-white">Refer to original sources where required though, as these are just abbreviated notes of the Dharmasaur and may contain errors.</p>
        </Col>
        <Col xs={1} md={3}></Col>
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
