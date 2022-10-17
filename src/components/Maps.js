import { Container, Row, Col, Button, Card, Spinner, Stack, Collapse, ListGroup, Offcanvas, Dropdown } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";

const Maps = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [currentMap, setCurrentMap] = useState({ text: "Mind and Mental Factors", url: "mmf.svg", parent: "mmf", key: "mmf" });
  const [mapNavStructure, setMapNavStructure] = useState({ headers: [], maps: [] });

  useEffect(() => {
    initialiseMapNavStructure();
    setMapLoading(false);
  }, []);

  const repositoryUrl = "https://raw.githubusercontent.com/PatrickHuynh/dharmasaurus-data/main/maps/";

  const initialiseMapNavStructure = async () => {
    const res = await fetch(repositoryUrl + "mapNavStructure.json");
    let data = await res.json();
    let headers = Object.keys(data).filter((v) => !v.includes("_"));
    let mapObjects = Object.entries(data).map(([k, v]) => {
      return {
        key: k,
        parent: k.split("_")[0],
        text: v,
        url: k + ".svg",
      };
    });
    mapObjects = [...mapObjects].reduce((arr, curr) => ((arr[curr.key] = curr), arr), {});
    setMapNavStructure({
      headers: headers,
      maps: mapObjects,
    });
  };

  const fetchMap = async () => {
    const res = await fetch(repositoryUrl + currentMap.url);
  };

  const handleSelectMap = async (key) => {
    setMapLoading(true);
    setShowMenu(false);
    await fetchMap();
    setMapLoading(false);
    setCurrentMap({ ...mapNavStructure.maps[key] });
  };

  const handleCloseMenu = () => setShowMenu(false);

  const loadingSpinner = (loadingMessage) => {
    return (
      <Stack direction="horizontal" gap={2} className="d-flex align-items-center p-2 btn btn-light">
        <Spinner className="m-2" animation="border" role="status"></Spinner>
        <h6>{loadingMessage}</h6>
      </Stack>
    );
  };

  const crumbsList = () => {
    let crumbs = [];
    let el = currentMap;
    while (true) {
      const frag = (map) => {
        return (
          <>
            {map.key !== map.parent && " | "}
            <div key={map.key} className={`d-inline btn btn-sm ${map.key === currentMap.key ? "btn-dark" : "btn-outline-dark"}`} onClick={() => handleSelectMap(map.key)}>
              {map.text}
            </div>
          </>
        );
      };
      crumbs = [frag(el), ...crumbs];
      if (mapNavStructure.maps[el.parent] == null) break;
      else {
        if (el.key == el.parent) break;
        else el = mapNavStructure.maps[el.parent];
      }
    }
    return (
      <>
        {crumbs.map((map) => {
          return map;
        })}
      </>
    );
  };

  return (
    <Container fluid className="m-0">
      <Offcanvas show={showMenu} onHide={handleCloseMenu} backdrop={true} scroll={true} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Select Map</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {mapNavStructure["headers"].map((headerKey) => {
            return (
              <Dropdown className="list-group" autoClose="outside">
                <Dropdown.Toggle variant="dark" id="dropdown-autoclose-outside" className="my-2 p-2">
                  {mapNavStructure.maps[headerKey].text}
                </Dropdown.Toggle>
                <Dropdown.Menu variant="secondary" className="w-100">
                  {Object.entries(mapNavStructure.maps).map(([key, value]) => {
                    let isActive = key === currentMap.key;
                    return value.parent === headerKey ? (
                      <Dropdown.Item id={key} onClick={() => handleSelectMap(key)} active={isActive}>
                        {value.text}
                      </Dropdown.Item>
                    ) : (
                      <></>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            );
          })}
        </Offcanvas.Body>
      </Offcanvas>

      <Row className="p-2 bg-light flex-nowrap" style={{ maxHeight: "40px" }}>
        <Col xs="auto">
          <Button size="sm" onClick={() => setShowMenu(!showMenu)} aria-controls="collapse-map-menu" aria-expanded={showMenu}>
            Show Menu
          </Button>{" "}
        </Col>
        <Col>
          <div className="ps-2 d-inline text-nowrap overflow-hidden align-middle">{crumbsList()}</div>
        </Col>
      </Row>
      <Row>
        <Col>{mapLoading ? loadingSpinner("Image loading...") : <img src={repositoryUrl + currentMap.url} />}</Col>
      </Row>
    </Container>
  );
};

export default Maps;
