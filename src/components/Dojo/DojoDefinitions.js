import { useState, useEffect, useRef, useContext } from "react";
import { Container, Row, Col, InputGroup, Form, Table, Button, Stack } from "react-bootstrap";
import { ObjectsContext, UserContext } from "../../utils/Contexts";
import stringSimilarity from "string-similarity";

const DojoDefinitions = () => {
  const { objects, setObjects } = useContext(ObjectsContext);
  const [appPosition, setAppPosition] = useState(1);
  const [loadingObjects, setLoadingObjects] = useState(true);
  const [mainTopicsFilter, setMainTopicsFilter] = useState({});
  const [searchText, setSearchText] = useState("");
  const [dojoDefs, setDojoDefs] = useState({});

  const isFirstRender = useRef(true);

  // practice states
  const [practiceInSession, setPracticeInSession] = useState(false);
  const [practiceStack, setPracticeStack] = useState([]);
  const [memorisedStack, setMemorisedStack] = useState([]);
  const [revealDefinition, setRevealDefinition] = useState(false);

  // GLOBAL APP STATES --------------------------------------------------------------------------------------------------

  // get definitions (need to refactor this as duplicated from other definitions)
  useEffect(() => {
    const getObjects = async () => {
      let objectsFromLocalStorage = localStorage.getItem("objects");
      if (objectsFromLocalStorage) {
        objectsFromLocalStorage = JSON.parse(objectsFromLocalStorage);
        setObjects(objectsFromLocalStorage);
        setLoadingObjects(false);
      }
      let objectsFromServer = await fetchObjects();
      objectsFromServer.sort((a, b) => (a.name > b.name ? 1 : -1));
      setLoadingObjects(false);
      setObjects(objectsFromServer);
      localStorage.setItem("objects", JSON.stringify(objectsFromServer));
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

  // on load get app state
  useEffect(() => {
    const appFullState = localStorage.getItem("dojoDefinitionsAppState");
    if (appFullState) {
      try {
        const localAppState = JSON.parse(appFullState);
        loadAppState(localAppState);
      } catch {}
    } else {
      // TODO future get from api store
      setAppPosition(1);
      setDojoDefs({});
    }
  }, []);

  // on state change save to local storage
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveAppStateToLocalStorage();
  }, [appPosition, dojoDefs, practiceStack, revealDefinition]);

  const saveAppStateToLocalStorage = () => {
    localStorage.setItem("dojoDefinitionsAppState", JSON.stringify(compileAppState()));
  };

  const loadAppState = (appState) => {
    let setters = {
      appPosition: setAppPosition,
      dojoDefs: setDojoDefs,
      practiceInSession: setPracticeInSession,
      practiceStack: setPracticeStack,
      memorisedStack: setMemorisedStack,
      revealDefinition: setRevealDefinition,
    };
    Object.entries(setters).map(([k, f]) => {
      f(appState[k]);
    });
  };

  const compileAppState = () => {
    return {
      appPosition: appPosition,
      dojoDefs: dojoDefs,
      practiceInSession: practiceInSession,
      practiceStack: practiceStack,
      memorisedStack: memorisedStack,
      revealDefinition: revealDefinition,
    };
  };

  // BEGIN PAGES ---------------------------------------------------------------------------------------------------------

  const pageBegin = () => {
    return (
      <>
        <Row>
          <Col>
            <Button className="my-5" variant="danger">
              <h1>Still under development - your progress may be lost any time</h1>
            </Button>
            <h1>Instructions</h1>
            <ol>
              <li>Begin here</li>
              <li>Click settings, and add definitions to your memory list</li>
              <li>
                Click practice to begin memorisation
                <ul>
                  <li>Successful memorisation is self examined</li>
                </ul>
              </li>
              <li>The stats tab tracks your progress and lets you know what you need to work on, and what you have memorised</li>
            </ol>
          </Col>
        </Row>
      </>
    );
  };

  const pageSettings = () => {
    return (
      <>
        <Row>
          <InputGroup size="sm" className="mt-3">
            <Form.Control placeholder="Filter by object name" aria-label="Filter by object name" onChange={handleChangeSearch} />
          </InputGroup>
        </Row>
        <Row>
          <Col>
            <Table responsive striped bordered hover size="sm" className="mx-1 mt-3">
              <thead>
                <tr>
                  <th className="text-nowrap" style={{ width: "65px" }}>
                    Practice
                  </th>
                  <th className="text-nowrap" style={{ minWidth: "150px", maxWidth: "300px" }}>
                    Main Topic
                  </th>
                  <th style={{ minWidth: "150px" }}>Object</th>
                </tr>
              </thead>
              <tbody>
                {filterSearchObjects().map((obj) => {
                  return (
                    <tr key={obj._id} className="align-middle">
                      <td className="text-nowrap" style={{ width: "65px" }}>
                        <Button size="sm" variant={dojoDefs[obj._id] && dojoDefs[obj._id].active ? "warning" : "dark"} onClick={() => handleMemoriseButton(obj._id)} style={{ minWidth: "60px" }}>
                          {dojoDefs[obj._id] && dojoDefs[obj._id].active ? "Remove" : "Add"}
                        </Button>
                      </td>
                      <td className="px-2" style={{ minWidth: "150px", maxWidth: "300px" }}>
                        {obj.mainTopic}
                      </td>
                      <td style={{ minWidth: "150px" }}>{obj.name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    );
  };

  // TODO: SESSION START/END STATE
  const pagePractice = () => {
    let noSelectedDefintions = Object.entries(dojoDefs).every(([key, val]) => {
      return !val;
    });

    if (noSelectedDefintions)
      return (
        <Container>
          <Row className="py-5">
            <Col className="d-flex justify-content-center">
              <h1>Go back to settings to select some definitions to memorise first!</h1>
            </Col>
          </Row>
        </Container>
      );

    const sessionControl = () => {
      return (
        <Row>
          <Col className="bg-secondary d-flex justify-content-center">
            <div className="m-1">
              <Stack direction="horizontal" className="p-1" gap={1}>
                {practiceInSession ? (
                  <Button size="sm" variant="danger" style={{ minWidth: "200px" }} onClick={() => handlePracticeSessionChange(!practiceInSession)}>
                    Click to End and Save Progess
                  </Button>
                ) : (
                  <Button size="sm" variant="success" style={{ minWidth: "200px" }} onClick={() => handlePracticeSessionChange(!practiceInSession)}>
                    Click to Begin Session
                  </Button>
                )}
              </Stack>
            </div>
          </Col>
        </Row>
      );
    };

    const definitionsRecallUI = () => {
      return (
        <>
          <Row style={{ minHeight: "350px" }}>
            {practiceStack.length > 0 ? (
              <Col className="d-flex justify-content-center">
                <Container fluid className="py-5">
                  <Row>
                    <Col className="d-flex justify-content-center">
                      <h1>{practiceStack[0].name}</h1>
                    </Col>
                  </Row>
                  <Row className="my-5">
                    <Col className="d-flex justify-content-center">
                      {revealDefinition ? (
                        practiceStack[0].definition
                      ) : (
                        <Button variant="outline-primary" onClick={() => setRevealDefinition(true)}>
                          Reveal definition
                        </Button>
                      )}
                    </Col>
                  </Row>
                  <Row className="mt-5">
                    <Col className="d-flex justify-content-center">
                      {revealDefinition ? (
                        <Stack direction="horizontal" gap={1}>
                          <Button variant="danger" style={{ minWidth: "100px" }} onClick={() => handleDefinitionRecall(0)}>
                            Forgot
                          </Button>
                          <Button variant="warning" style={{ minWidth: "100px" }} onClick={() => handleDefinitionRecall(1)}>
                            Hard
                          </Button>
                          <Button variant="success" style={{ minWidth: "100px" }} onClick={() => handleDefinitionRecall(2)}>
                            Easy
                          </Button>
                        </Stack>
                      ) : (
                        <></>
                      )}
                    </Col>
                  </Row>
                </Container>
              </Col>
            ) : (
              <Col className="d-flex justify-content-center">
                <Container fluid className="py-5">
                  <Row>
                    <Col className="d-flex justify-content-center">{practiceInSession ? <h1>All definitions recalled!</h1> : <h1>Click above to start a new memorising session</h1>}</Col>
                  </Row>
                </Container>
              </Col>
            )}
          </Row>
          {practiceInSession && (
            <Row className="bg-warning py-5">
              <Col>
                <Container>
                  <Row xs={1} sm={practiceStack.length > 0 ? 2 : 1} className="d-flex justify-content-center">
                    {practiceStack.length > 0 && (
                      <Col>
                        <h1>Definitions to recall</h1>
                        <ol>
                          {practiceStack.map((x) => {
                            return <li key={"ps_" + x.id}>{x.name}</li>;
                          })}
                        </ol>
                      </Col>
                    )}
                    <Col>
                      <h1>Memorised definitions</h1>
                      <ul className="ul-memorised">
                        {memorisedStack.map((x) => {
                          return <li key={"ms_" + x.id}>{x.name}</li>;
                        })}
                      </ul>
                    </Col>
                  </Row>
                  <Row className="bg-success"></Row>
                </Container>
              </Col>
            </Row>
          )}
        </>
      );
    };

    return (
      <>
        {sessionControl()}
        {definitionsRecallUI()}
      </>
    );
  };

  const pageStats = () => {
    return (
      <Container>
        <Row className="py-5">
          <Col className="d-flex justify-content-center">
            <h1>Under development, come back later!</h1>
          </Col>
        </Row>
      </Container>
    );
  };

  // END PAGES ---------------------------------------------------------------------------------------------------------

  const appStateEnum = {
    1: "Begin",
    2: "Settings",
    3: "Practice",
    4: "Stats",
  };

  const appStatePages = {
    1: pageBegin,
    2: pageSettings,
    3: pagePractice,
    4: pageStats,
  };

  // HANDLERS ---------------------------------------------------------------------------------------------------------
  // global dojo definitons handlers
  const handleAppPositionChange = (state) => {
    setAppPosition(state);
  };

  // settings handlers
  const handleChangeSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleMemoriseButton = (id) => {
    let updateDefs = { ...dojoDefs };
    try {
      updateDefs[id].active = updateDefs[id].active == true ? false : true;
    } catch {
      updateDefs[id] = { active: true };
    }
    setDojoDefs(updateDefs);
  };

  // practice handlers
  const handlePracticeSessionChange = (newState) => {
    if (newState) {
      // compile practice stack
      let stack = Object.entries(dojoDefs)
        .map(([id, val]) => {
          return { id: id, ...val };
        })
        .filter((x) => x.active)
        .map((def) => {
          let obj = objects.find((obj) => obj._id === def.id);
          return { ...def, ...obj };
        });
      setPracticeStack(stack);
      setMemorisedStack([]);
    } else {
      // update practice parameters, and save to cloud if user is logged in
      setPracticeStack([]);
      setMemorisedStack([]);
    }
    setPracticeInSession(newState);
  };

  const handleDefinitionRecall = (difficulty) => {
    // if 0 or 1 = forgot/hard // pull from top of stack and push to bottom
    setRevealDefinition(false);
    if (difficulty === 0 || difficulty === 1) {
      setPracticeStack([...practiceStack.slice(1), practiceStack[0]]);
    }
    // if 2 = easy // push to memorised
    else if (difficulty === 2) {
      setMemorisedStack([practiceStack[0], ...memorisedStack]);
      setPracticeStack([...practiceStack.slice(1)]);
    }
  };

  // UTILS ---------------------------------------------------------------------------------------------------------

  const filterSearchObjects = () => {
    let searchTextLower = searchText.toLowerCase();

    let filteredObjects = objects.map((obj) => {
      let name = obj.name.toLowerCase();
      let definition = obj.definition.toLowerCase();
      let nameDef = name; // + " " + definition;
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

    let sortDefs = (a, b) => {
      // sort by topic and then by name
      if (b.mainTopic < a.mainTopic) return 1;
      if (b.mainTopic > a.mainTopic) return -1;
      return b.name < a.name ? 1 : -1;
    };

    // if the search string is empty, just return the whole dictionary
    if (searchTextLower.length === 0) {
      filteredObjects.sort((a, b) => sortDefs(a, b));
      return filteredObjects;
    }

    // next filter the search list by names and definitions containing all of the key words
    let keywords = searchTextLower.split(" ");
    filteredObjects = filteredObjects.filter((obj) => {
      return keywords.every((word) => {
        return obj.nameDef.includes(word);
      });
    });

    filteredObjects.sort((a, b) => sortDefs(a, b));
    return filteredObjects;
  };

  // PAGE RENDER ---------------------------------------------------------------------------------------------------------

  return (
    <Container fluid className="m-0">
      <Row>
        <Col className="bg-secondary d-flex justify-content-center">
          <div className="m-1">
            <Stack direction="horizontal" className="p-1" gap={1}>
              {Object.keys(appStateEnum)
                .map((state) => {
                  return (
                    <Button key={state} size="sm" variant={appPosition == state ? "primary" : "dark"} style={{ minWidth: "5rem" }} onClick={() => handleAppPositionChange(state)}>
                      {appStateEnum[state]}
                    </Button>
                  );
                })
                .reduce((prev, curr) => [prev, " > ", curr])}
            </Stack>
          </div>
        </Col>
      </Row>
      {appStatePages[appPosition]()}
    </Container>
  );
};

export default DojoDefinitions;
