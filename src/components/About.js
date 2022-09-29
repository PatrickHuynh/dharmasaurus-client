import { Col, Container, Row } from "react-bootstrap";

const About = () => {
  return (
    <Container className="mt-4">
      <Row>
        <Col>This is an application written to support Dharma practitioners studying and practiting the Dharma.</Col>
      </Row>
      <Row>
        <Col>The application is written by Patrick Huynh and is a work in progress.</Col>
      </Row>
    </Container>
  );
};

export default About;
