import { Col, Container, Row, Card, CardGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

const Outlines = () => {
  return (
    <Container fluid>
      <Row className="row row-cols-1 row-cols-md-3">
        <Col>
          <CardGroup>
            <Link to="lrcm">
              <Card className="m-1 bg-light border border-dark border-2 h-100" style={{ width: "18rem" }}>
                <Card.Body className="text-center">
                  <Card.Img fluid variant="top" src="https://www.lamayeshe.com/sites/default/files/styles/main/public/18542_ud-Edit.jpg?itok=5M3nUJwo" style={{ height: "200px", width: "auto" }} />
                  <Card.Text className="mt-2">Lam Rim Chen Mo</Card.Text>
                </Card.Body>
              </Card>
            </Link>
            <Link to="logic\reasons">
              <Card className="m-1 bg-light border border-dark border-2 h-100">
                <Card.Body className="text-center">
                  <Card.Img fluid variant="top" src="/Dharmakirti.jfif" style={{ height: "200px", width: "auto" }} />
                  <Card.Text className="mt-2">
                    Logic
                    <br />
                    Correct and Pseudo Reasons
                  </Card.Text>
                </Card.Body>
              </Card>
            </Link>
          </CardGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default Outlines;
