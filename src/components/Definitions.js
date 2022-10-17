import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Spinner, Stack, Offcanvas, Form, InputGroup, Card } from "react-bootstrap";
import stringSimilarity from "string-similarity";
import { CSVLink, CSVDownload } from "react-csv";

const Definitions = () => {
  const [objects, setObjects] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loadingObjects, setLoadingObjects] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [mainTopicsFilter, setMainTopicsFilter] = useState({});
  const definitionsExportRef = useRef();

  useEffect(() => {
    const getObjects = async () => {
      let objectsFromServer = await fetchObjects();
      objectsFromServer.sort((a, b) => (a.name > b.name ? 1 : -1));
      setLoadingObjects(false);
      setObjects(objectsFromServer);
      let mainTopicsSet = new Set(objectsFromServer.map((obj) => obj.mainTopic));
      mainTopicsSet = [...mainTopicsSet];
      mainTopicsSet = mainTopicsSet.sort((a, b) => a.localeCompare(b));
      mainTopicsSet = [...mainTopicsSet].reduce((arr, curr) => ((arr[curr] = false), arr), {});

      setMainTopicsFilter(mainTopicsSet);
    };
    getObjects();
  }, []);

  const fetchObjects = async () => {
    const res = await fetch("https://us-central1-dharmasaurus-0.cloudfunctions.net/api/objects");
    const data = await res.json();
    return data;
  };

  // button handlers
  const handleChangeSearch = (e) => {
    setSearchText(e.target.value);
  };

  const toggleShowFilter = () => setShowFilter((s) => !s);
  const handleCloseFilter = () => setShowFilter(false);

  const handleDefinitionsDownloadCSV = () => {
    definitionsExportRef.current.link.click();
  };

  const handleMainTopicFilterChange = (e) => {
    setMainTopicsFilter({ ...mainTopicsFilter, [e.target.name]: e.target.checked });
  };

  // main filter function
  const filterSearchObjects = () => {
    let searchTextLower = searchText.toLowerCase();

    let filteredObjects = objects.map((obj) => {
      let name = obj.name.toLowerCase();
      let definition = obj.definition.toLowerCase();
      let nameDef = name + " " + definition;
      let score = Math.max(stringSimilarity.compareTwoStrings(name, searchTextLower), stringSimilarity.compareTwoStrings(definition, searchTextLower));
      return { ...obj, nameDef: nameDef, score: score };
    });

    // filter by main topic checkboxes
    // if no filter is selected, then do not filter anything (counterintuitive logic, but how UIs work)
    if (Object.entries(mainTopicsFilter).some(([topic, filterValue]) => filterValue)) {
      // loop through and only select defs where main topic is true
      filteredObjects = filteredObjects.filter((obj) => {
        return mainTopicsFilter[obj.mainTopic];
      });
    }

    // if the search string is empty, just return the whole dictionary
    if (searchTextLower.length === 0) return filteredObjects;

    // next filter the search list by names and definitions containing all of the key words
    let keywords = searchTextLower.split(" ");
    filteredObjects = filteredObjects.filter((obj) => {
      return keywords.every((word) => {
        return obj.nameDef.includes(word);
      });
    });

    filteredObjects.sort((a, b) => b.score - a.score);
    return filteredObjects;
  };

  const showPercentage = (val) => {
    val = Math.round(val * 100);
    return val;
  };

  const definitionsDataCSV = () => {
    let defsArray = [["name", "definition"]];
    objects.map((obj) => {
      defsArray.push([obj.name, obj.definition]);
      return true;
    });
    return defsArray;
  };

  const loadingSpinner = (loadingMessage) => {
    return (
      <Stack direction="horizontal" gap={2} className="d-flex align-items-center p-2">
        <Spinner className="m-2" animation="border" role="status"></Spinner>
        <h6>{loadingMessage}</h6>
      </Stack>
    );
  };

  return (
    <Container fluid className="m-0">
      {loadingObjects && loadingSpinner("Loading definitions from database...")}
      {!loadingObjects && (
        <>
          <Offcanvas show={showFilter} onHide={handleCloseFilter} backdrop={false} scroll={true} placement="end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Search Settings</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Stack direction="vertical" gap={3}>
                <Card className="m-1 border border-dark border-2">
                  <Card.Body>
                    <h6>Filter Main Topic</h6>
                    <Card.Text>
                      {Object.entries(mainTopicsFilter).map(([key, value]) => {
                        return <Form.Check id={key} key={key} defaultChecked={value} label={key} name={key} onChange={handleMainTopicFilterChange} />;
                      })}
                    </Card.Text>
                  </Card.Body>
                </Card>
                <Button size="sm" variant="primary" onClick={toggleShowFilter}>
                  Apply Settings
                </Button>
                {/* <Button size="sm" variant="success" onClick={handleDefinitionsDownloadCSV}>
                  Download all definitions
                </Button> */}
              </Stack>
            </Offcanvas.Body>
            <CSVLink data={definitionsDataCSV()} filename="Definitions.csv" className="hidden" ref={definitionsExportRef} target="_blank" />
          </Offcanvas>

          <Row>
            <Col className="bg-secondary">
              <div className="m-1">
                <Stack direction="horizontal" className="p-1">
                  <InputGroup size="sm" className="mx-2">
                    <Form.Control placeholder="Search" aria-label="Search" onChange={handleChangeSearch} />
                  </InputGroup>
                  <Button size="sm" variant="dark" onClick={toggleShowFilter}>
                    Settings
                  </Button>
                </Stack>
              </div>
            </Col>
          </Row>
          <Row>
            <Col sm className="p-0">
              {filterSearchObjects().map((obj) => {
                return (
                  <Card key={obj.id} className="m-1 bg-light border border-dark border-2">
                    <Card.Body className="px-3 py-2">
                      <Card.Title style={{ fontSize: "16px" }}>{obj.name + " (" + showPercentage(obj.score) + "%)"}</Card.Title>
                      <Card.Text>{obj.definition}</Card.Text>
                    </Card.Body>
                  </Card>
                );
              })}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Definitions;
