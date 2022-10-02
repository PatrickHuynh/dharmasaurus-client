import { useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

const LamRimChenMo = () => {
  const [modalShow, setModalShow] = useState(true);
  return (
    <Container fluid>
      <Modal show={modalShow} onHide={() => setModalShow(false)} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Outline Navigation Tip</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Scroll through the image using the middle mouse when on desktop, or dragging the image when on a phone</p>
        </Modal.Body>{" "}
        <Modal.Footer>
          <Button onClick={() => setModalShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Row>
        <Col>
          <img src="https://raw.githubusercontent.com/PatrickHuynh/dharma-outlines/main/logic/logic%20-%20reasons.svg" />
        </Col>
      </Row>
    </Container>
  );
};

export default LamRimChenMo;
